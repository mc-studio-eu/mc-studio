export type ResourceKind = 'payment' | 'file' | 'mockup' | 'link' | 'wiki' | 'analytics'
export type PortalResource = { versionCount?:number; canDelete?:boolean; id:string; projectId:string|null; kind:ResourceKind; title:string; description:string; url:string; content:string; amount:number; currency:string; status:string; dueDate:string; fileName:string; fileSize:number; createdAt:string }
export const resourceLabels: Record<ResourceKind,string> = {payment:'Paiements',file:'Fichiers',mockup:'Maquettes',link:'Liens utiles',wiki:'Wiki MC Studio',analytics:'Analytics'}
export const resourceIcons: Record<ResourceKind,string> = {payment:'i-tabler-credit-card',file:'i-tabler-folder',mockup:'i-tabler-layout',link:'i-tabler-link',wiki:'i-tabler-book',analytics:'i-tabler-chart-bar'}
export const money = (amount:number) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(amount/100)
export const portalDate = (value:string) => {
 if (!value) return 'À définir'
 const date = new Date(value.length === 10 ? value+'T12:00:00' : value.replace(' ','T'))
 return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})
}

export type MemberRole = 'decision_maker' | 'contributor' | 'viewer'
export const memberRoleLabels: Record<string,string> = { decision_maker:'Décideur', contributor:'Contributeur', viewer:'Lecteur' }
export type PortalMember = { id:string; name:string; email:string; memberRole:MemberRole; suspended:boolean }
export type PortalTodo = { id:string; kind:'file'|'mockup'|'payment'|'milestone'|'roadmap'|'roadmap_step'; title:string; projectId:string; responsibleId:string|null; responsibleName:string; dueDate:string; status:string; resourceId?:string; stepId?:string }
