import type { SatisfactionDefinition, SatisfactionAnswers, SatisfactionResponse } from '../../shared/portal-satisfaction'
import { defaultSatisfactionDefinition } from '../../shared/portal-satisfaction'
import type { PortalDatabase } from './portal-db'
const invalid=(message='Questionnaire invalide.')=>{throw createError({statusCode:400,statusMessage:message})}
function object(value:unknown):Record<string,any>{if(!value||typeof value!=='object'||Array.isArray(value))return invalid();return value as Record<string,any>}
function text(value:unknown,max:number,required=false){if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))return invalid();const result=value.trim();if(required&&!result)return invalid('Un titre est requis.');return result}
export function satisfactionRevision(value:unknown){if(!Number.isSafeInteger(value)||Number(value)<0)return invalid('Version du questionnaire invalide.');return Number(value)}
export function satisfactionBody(value:unknown,keys:string[]){const body=object(value);if(Object.keys(body).some(key=>!keys.includes(key)))return invalid();return body}
export function satisfactionDefinition(value:unknown):SatisfactionDefinition {
 const body=satisfactionBody(value,['title','description','googleReviewUrl','referralUrl','sections'])
 const link=(value:unknown)=>{const url=text(value,2000);if(url){try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password)invalid('Utilisez un lien HTTPS valide.')}catch{invalid('Utilisez un lien HTTPS valide.')}}return url}
 if(!Array.isArray(body.sections)||!body.sections.length||body.sections.length>20)invalid('Ajoutez entre 1 et 20 sections.')
 const ids=new Set<string>();let count=0
 const id=(value:unknown)=>{const result=text(value,100,true);if(!/^[a-zA-Z0-9_-]+$/.test(result)||['__proto__','constructor','prototype'].includes(result)||ids.has(result))invalid('Chaque élément doit avoir un identifiant unique.');ids.add(result);return result}
 return {title:text(body.title,160,true),description:text(body.description,3000),googleReviewUrl:link(body.googleReviewUrl),referralUrl:link(body.referralUrl),sections:body.sections.map((input:unknown)=>{
  const s=satisfactionBody(input,['id','title','description','questions']);if(!Array.isArray(s.questions)||s.questions.length>50)invalid();
  return {id:id(s.id),title:text(s.title,160,true),description:text(s.description,2000),questions:s.questions.map((input:unknown)=>{
   if(++count>100)invalid('Le questionnaire est limité à 100 questions.')
   const q=satisfactionBody(input,['id','label','description','type','required','options']);if(!['text','rating','choice'].includes(q.type)||typeof q.required!=='boolean'||!Array.isArray(q.options))invalid()
   const options=q.options.map((option:unknown)=>text(option,200,true));if(q.type==='choice'&&(options.length<2||options.length>20||new Set(options).size!==options.length))invalid('Ajoutez entre 2 et 20 choix distincts.');if(q.type!=='choice'&&options.length)invalid()
   return {id:id(q.id),label:text(q.label,500,true),description:text(q.description,1000),type:q.type,required:q.required,options}
  })}
 })}
}
export function satisfactionAnswers(value:unknown,definition:SatisfactionDefinition):SatisfactionAnswers {
 const input=object(value),answers:SatisfactionAnswers={};const questions=definition.sections.flatMap(s=>s.questions)
 if(Object.keys(input).some(key=>!questions.some(q=>q.id===key)))invalid('Les réponses ne correspondent pas au questionnaire.')
 for(const q of questions){const value=input[q.id];if(value===undefined||value===''){if(q.required)invalid(`Répondez à la question « ${q.label} ».`);continue}
  if(q.type==='rating'){if(!Number.isInteger(value)||Number(value)<1||Number(value)>10)invalid('Les notes doivent être comprises entre 1 et 10.');answers[q.id]=value}
  else {const answer=text(value,10000);if(!answer){if(q.required)invalid(`Répondez à la question « ${q.label} ».`);continue}if(q.type==='choice'&&!q.options.includes(answer))invalid('Choisissez une réponse proposée.');answers[q.id]=answer}
 }
 return answers
}
export async function getSatisfaction(db:PortalDatabase,projectId:string){const row=await db.prepare('SELECT definition,revision FROM portal_satisfaction_surveys WHERE project_id=?').get(projectId);return {definition:row?JSON.parse(row.definition) as SatisfactionDefinition:defaultSatisfactionDefinition(),revision:row?Number(row.revision):0}}
export function responseRow(row:any):SatisfactionResponse {return {id:row.id,revision:Number(row.revision),submittedAt:row.submitted_at,respondent:JSON.parse(row.respondent),definition:JSON.parse(row.definition),answers:JSON.parse(row.answers)}}
