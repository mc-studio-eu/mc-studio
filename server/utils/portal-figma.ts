import { createError } from 'h3'

export function figmaSource(value: unknown) {
 try {
  const url = new URL(String(value))
  const key = url.pathname.match(/^\/(?:design|file|proto)\/([a-zA-Z0-9]+)(?:\/|$)/)?.[1]
  if (url.protocol !== 'https:' || !['figma.com','www.figma.com'].includes(url.hostname) || !key) throw new Error()
  return key
 } catch { throw createError({statusCode:400,statusMessage:'Ajoutez un lien de fichier Figma valide.'}) }
}
export async function figmaRequest(path: string) {
 const token = process.env.FIGMA_ACCESS_TOKEN
 if (!token) throw createError({statusCode:503,statusMessage:'Ajoutez FIGMA_ACCESS_TOKEN sur le serveur pour connecter Figma.'})
 let response: Response
 try { response = await fetch('https://api.figma.com/v1/'+path,{headers:{'X-Figma-Token':token},signal:AbortSignal.timeout(90000),redirect:'error'}) }
 catch { throw createError({statusCode:502,statusMessage:'Figma ne répond pas. Réessayez dans un instant.'}) }
 if (!response.ok) throw createError({statusCode:response.status===429?429:502,statusMessage:response.status===429?'Limite Figma atteinte. Réessayez plus tard.':response.status===403?'Le jeton Figma ne permet pas de lire ce fichier.':response.status===404?'Fichier Figma introuvable ou inaccessible.':'Impossible de récupérer le fichier Figma.'})
 return response.json()
}
export async function inspectFigma(key: string, version?: string) {
 const params = new URLSearchParams({depth:'4'}); if(version)params.set('version',version)
 const file = await figmaRequest(`files/${key}?${params}`)
 const screens: {id:string;name:string;page:string;width:number;height:number}[] = []
 const walk = (nodes:any[],page:string) => {
  for(const n of nodes || []) {
   if(n.visible===false)continue
   if(['FRAME','COMPONENT','COMPONENT_SET'].includes(n.type) && n.absoluteBoundingBox?.width>0 && n.absoluteBoundingBox?.height>0) {
    screens.push({id:n.id,name:n.name,page,width:n.absoluteBoundingBox.width,height:n.absoluteBoundingBox.height})
   } else if(n.type==='SECTION') walk(n.children,page+' / '+n.name)
  }
 }
 for(const page of file.document?.children || [])walk(page.children,page.name)
 return {name:String(file.name),version:String(file.version),fileKey:key,screens:screens.slice(0,500)}
}
export async function figmaImage(url: string) {
 const u=new URL(url)
 // Figma's render endpoint returns signed URLs on its dedicated export buckets.
 const allowed = /^(?:figma-alpha-api\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com|figma-alpha-api\.s3-website-[a-z0-9-]+\.amazonaws\.com|[a-z0-9-]+\.figma\.com)$/.test(u.hostname)
 if(u.protocol!=='https:' || !allowed || u.username || u.password)throw createError({statusCode:502,statusMessage:'Adresse d’export Figma non reconnue.'})
 const response=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(90000)})
 if(!response.ok || !response.body)throw createError({statusCode:502,statusMessage:'Export Figma indisponible.'})
 const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>12*1024*1024)throw createError({statusCode:413,statusMessage:'Un écran dépasse 12 Mo. Exportez une section plus petite.'});chunks.push(value)}}finally{await reader.cancel()}
 const data=Buffer.concat(chunks)
 if(data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw createError({statusCode:502,statusMessage:'L’export reçu n’est pas une image PNG.'})
 return {data:data.toString('base64'),size,width:data.readUInt32BE(16),height:data.readUInt32BE(20)}
}
