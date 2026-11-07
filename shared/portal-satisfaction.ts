export type SatisfactionQuestion = { id:string; label:string; description:string; type:'text'|'rating'|'choice'; required:boolean; options:string[] }
export type SatisfactionSection = { id:string; title:string; description:string; questions:SatisfactionQuestion[] }
export type SatisfactionDefinition = { title:string; description:string; googleReviewUrl:string; referralUrl:string; sections:SatisfactionSection[] }
export type SatisfactionAnswers = Record<string,string|number>
export type SatisfactionResponse = { id:string; revision:number; submittedAt:string; respondent:{name:string;email:string;projectName:string;organizationName:string}; definition:SatisfactionDefinition; answers:SatisfactionAnswers }
export type SatisfactionData = { revision:number; definition:SatisfactionDefinition; project:{name:string;organizationName:string}; respondent:{name:string;email:string}; response:SatisfactionResponse|null; permissions:{canEdit:boolean;canSubmit:boolean} }
const q=(id:string,label:string,type:SatisfactionQuestion['type']='text',options:string[]=[],required=false):SatisfactionQuestion=>({id,label,type,options,required,description:''})
const section=(id:string,title:string,questions:SatisfactionQuestion[],description=''):SatisfactionSection=>({id,title,questions,description})
const yes=['Oui, totalement','Oui, en grande partie','Partiellement','Non']
export function defaultSatisfactionDefinition():SatisfactionDefinition {
 return {
  title:'Votre retour compte.',
  description:'Merci pour votre confiance. Prenez quelques minutes pour nous partager votre expérience : vos réponses nous aident à améliorer nos projets et notre façon de travailler.',
  googleReviewUrl:'https://g.page/r/CUhpIHjy9mErEBM/review',
  referralUrl:'https://mc-studio.notion.site/apport-d-affaires?pvs=74',
  sections:[
   section('project','Informations projet',[],'Les informations de votre projet et de votre compte sont renseignées automatiquement.'),
   section('overall','Satisfaction globale',[
    q('experience','Comment évaluez-vous votre expérience globale avec MC Studio ?','rating',[],true),
    q('result','Comment évaluez-vous le résultat final ?','rating',[],true),
    q('needs','Le projet répond-il à votre besoin initial ?','choice',yes,true),q('why','Pourquoi ?')]),
   section('collaboration','Collaboration & process',[
    q('clarity','Le déroulement du projet était-il clair ?','choice',['Très clair','Clair','Moyennement clair','Pas clair']),
    q('communication','Comment avez-vous trouvé la communication ?','choice',['Très fluide','Fluide','Moyenne','Difficile']),
    q('appreciated','Qu’avez-vous le plus apprécié dans notre collaboration ?'),q('improve','Qu’aurions-nous pu améliorer ?')]),
   section('quality','Qualité du livrable',[
    q('ready','Le livrable est-il prêt à être utilisé ?','choice',yes),q('bugs','Avez-vous rencontré des bugs ou des difficultés ?'),
    q('autonomy','Vous sentez-vous autonome pour utiliser votre livrable ?','choice',['Oui, facilement','Oui, avec un peu d’aide','Pas vraiment','Non'])]),
   section('testimonial-section','Témoignage & avis public',[
    q('testimonial','En quelques mots, comment décririez-vous votre expérience ?'),
    q('permission','Nous autorisez-vous à partager votre témoignage ?','choice',['Oui, avec mon nom et le nom du projet','Oui, mais sans afficher mon nom','Oui, mais uniquement après validation','Non']),
    q('google','Accepteriez-vous de laisser un avis Google ?','choice',['Oui','Peut-être','Non'])], 'Votre autorisation concerne uniquement votre témoignage. Aucun avis n’est publié automatiquement.'),
   section('recommendation','Recommandation',[
    q('recommend','Recommanderiez-vous MC Studio ?','choice',['Oui','Peut-être','Non']),q('lead','Connaissez-vous une personne ou une entreprise qui pourrait avoir besoin de nos services ?'),
    q('introduction','Seriez-vous à l’aise pour nous mettre en relation ?','choice',['Oui, je peux faire l’introduction','Oui, envoyez-moi un message à transférer','Peut-être plus tard','Non'])]),
   section('last','Dernier retour',[q('suggestion','Une dernière remarque, une idée ou une suggestion ?')])
  ]
 }
}
