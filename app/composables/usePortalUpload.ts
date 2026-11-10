export function usePortalUpload() {
 const uploading = ref(false)
 const progress = ref<number | null>(null)
 const processing = ref(false)
 let active: XMLHttpRequest | undefined
 let controller: AbortController | undefined
 const reset = () => { uploading.value = false; progress.value = null; processing.value = false }
 onBeforeUnmount(() => { active?.abort(); controller?.abort() })

 const transfer = (url: string, body: FormData | File, method: 'POST'|'PUT', mime?: string): Promise<{id:string}|undefined> => new Promise((resolve,reject) => {
  const xhr = new XMLHttpRequest()
  active = xhr
  xhr.open(method,url)
  if (mime) xhr.setRequestHeader('Content-Type',mime)
  if (method === 'PUT') xhr.setRequestHeader('x-amz-storage-class','STANDARD')
  xhr.responseType = method === 'POST' ? 'json' : 'text'
  xhr.timeout = 15*60*1000
  const fail = (message: string) => reject({data:{statusMessage:message}})
  xhr.upload.onprogress = event => {
   progress.value = event.lengthComputable ? Math.floor(event.loaded/event.total*100) : null
   if (event.lengthComputable && event.loaded === event.total) processing.value = true
  }
  xhr.upload.onload = () => { progress.value = 100; processing.value = true }
  xhr.onload = () => {
   active = undefined
   if (xhr.status >= 200 && xhr.status < 300 && (method === 'PUT' || typeof xhr.response?.id === 'string')) resolve(method === 'PUT' ? undefined : xhr.response)
   else fail((method === 'POST' ? xhr.response?.statusMessage : '') || (xhr.status === 413 ? 'Le serveur a refusé la taille du fichier.' : 'Le dépôt a échoué. Actualisez la liste avant de réessayer.'))
  }
  xhr.onerror = () => { active = undefined; fail('Connexion interrompue. Vérifiez la liste des fichiers avant de réessayer.') }
  xhr.ontimeout = () => { active = undefined; fail('Le transfert a pris trop de temps. Vérifiez la liste des fichiers avant de réessayer.') }
  xhr.onabort = () => { active = undefined; fail('Le transfert a été interrompu. Vérifiez la liste des fichiers avant de réessayer.') }
  xhr.send(body)
 })
 const send = async (url: string, body: FormData): Promise<{id:string}> => {
  uploading.value = true; progress.value = null; processing.value = false
  controller = new AbortController()
  const file = body.get('file')
  if (!(file instanceof File)) throw new Error('Fichier manquant.')
  const parsed = new URL(url,window.location.origin), projectId = parsed.searchParams.get('projectId') || ''
  const metadata = Object.fromEntries([...body.entries()].filter((entry): entry is [string,string] => typeof entry[1] === 'string'))
  const init = await $fetch<{transport:'r2'|'multipart'|'complete';id?:string;uploadId?:string;url?:string;mimeType?:string}>('/api/portal/uploads/init', {method:'POST',retry:0,signal:controller.signal,body:{...metadata,projectId,kind:parsed.pathname.includes('/assets') ? 'asset' : 'file',fileName:file.name,fileSize:file.size,mimeType:file.type,clientKey:crypto.randomUUID()}})
  if (init.transport === 'complete' && init.id) return {id:init.id}
  if (init.transport === 'multipart') return (await transfer(url,body,'POST'))!
  if (!init.url || !init.uploadId || !init.mimeType) throw new Error('Réponse de dépôt invalide.')
  await transfer(init.url,file,'PUT',init.mimeType)
  processing.value = true
  const complete = () => $fetch<{id:string}>('/api/portal/uploads/complete',{method:'POST',retry:0,signal:controller!.signal,body:{projectId,uploadId:init.uploadId}})
  try { return await complete() }
  catch (error: any) {
   // Confirmation is idempotent: a lost response must never create two files.
   if (!controller.signal.aborted && (!error?.statusCode || error.statusCode >= 500)) return await complete()
   throw error
  }
 }
 return { uploading,progress,processing,send,reset }
}
