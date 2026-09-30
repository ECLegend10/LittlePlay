import {json,sameOrigin} from '../../../lib/quiz';
import {pickWord,readVault} from '../../../lib/spy';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'origin'},403);
 try{
  if(Number(req.headers.get('content-length'))>25000)return json({error:'invalid'},413);
  const raw=await req.text();if(raw.length>25000)return json({error:'invalid'},413);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'invalid'},400)}
  if(!body||!Array.isArray(body.exclude)||body.exclude.length>300||body.exclude.some((id:unknown)=>typeof id!=='string'||!/^[-a-zA-Z0-9]{1,64}$/.test(id)))return json({error:'invalid'},400);
  const {words}=await readVault(),choice=pickWord(words,body.exclude);
  if(!choice)return json({error:'empty'},404);
  return json(choice);
 }catch(e){console.error(e);return json({error:'unavailable'},503)}
}
