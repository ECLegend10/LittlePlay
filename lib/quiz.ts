import { database } from './d1';
import { getAdmin } from './auth';
export const locales = ['en', 'cn', 'bm'] as const;
export type LocalText = Record<'en'|'cn'|'bm', string>;
export type Quiz = { published:boolean; title:LocalText; intro:LocalText; image:string; questions:{id:string; text:LocalText; image:string; options:LocalText[]; correct:number; explanation:LocalText}[] };
const blank = ():LocalText => ({en:'',cn:'',bm:''});
export function emptyQuiz():Quiz { return {published:false,title:{en:'A little quiz',cn:'趣味小测验',bm:'Kuiz santai'},intro:blank(),image:'',questions:Array.from({length:5},(_,i)=>({id:`q${i+1}`,text:blank(),image:'',options:Array.from({length:4},blank),correct:0,explanation:blank()}))}; }
export const admin = getAdmin;
export const db = database;
export async function readQuiz(){ const r=await db().prepare('SELECT data, revision FROM quizzes WHERE id = ?').bind('main').first<{data:string;revision:number}>(); return {quiz:r?JSON.parse(r.data) as Quiz:emptyQuiz(),revision:r?.revision||0}; }
export function validQuiz(q:unknown):q is Quiz {
 const text=(v:any)=>v&&locales.every(l=>typeof v[l]==='string'&&v[l].length<=4000);
 const image=(v:any)=>typeof v==='string'&&(v===''||/^\/api\/images\/[a-f0-9-]+\.(png|jpg|webp)$/.test(v));
 const a=q as Quiz;
 return !!a&&typeof a.published==='boolean'&&text(a.title)&&text(a.intro)&&image(a.image)&&Array.isArray(a.questions)&&a.questions.length===5&&a.questions.every((v,i)=>v.id===`q${i+1}`&&text(v.text)&&image(v.image)&&Array.isArray(v.options)&&v.options.length>=2&&v.options.length<=4&&v.options.every(text)&&Number.isInteger(v.correct)&&v.correct>=0&&v.correct<v.options.length&&text(v.explanation))&&(!a.published||locales.every(l=>a.title[l].trim()&&a.questions.every(v=>v.text[l].trim()&&v.options.every(o=>o[l].trim()))));
}
export function sameOrigin(req:Request){ const origin=req.headers.get('origin');return !!origin&&origin===new URL(process.env.APP_URL||req.url).origin; }
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
