import {env} from 'cloudflare:workers';
import {admin,db,json,sameOrigin} from '../../../../lib/quiz';
import {readSlides,storedKeys,validSlideLibrary} from '../../../../lib/slides';
export const dynamic='force-dynamic';

export async function GET(){
  if(!await admin())return json({error:'forbidden'},403);
  try{return json(await readSlides())}catch(error){console.error(error);return json({error:'unavailable'},503)}
}

export async function PUT(req:Request){
  const user=await admin();if(!user)return json({error:'forbidden'},403);
  if(!sameOrigin(req))return json({error:'origin'},403);
  try{
    if(Number(req.headers.get('content-length'))>150000)return json({error:'invalid'},413);
    const raw=await req.text();if(raw.length>150000)return json({error:'invalid'},413);
    let body;try{body=JSON.parse(raw)}catch{return json({error:'invalid'},400)}
    if(!body||!validSlideLibrary(body.library)||!Number.isInteger(body.revision)||body.revision<0)return json({error:'invalid'},400);
    const previous=await readSlides();
    const statement=body.revision===0
      ?db().prepare('INSERT INTO slide_libraries (id, data, revision, updated_by) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO NOTHING').bind('main',JSON.stringify(body.library),user.userId)
      :db().prepare('UPDATE slide_libraries SET data = ?, revision = revision + 1, updated_by = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(body.library),user.userId,'main',body.revision);
    const result=await statement.run();if(!result.meta.changes)return json({error:'conflict'},409);
    const nextKeys=storedKeys(body.library);
    const removed=[...storedKeys(previous.library)].filter(key=>!nextKeys.has(key));
    if(removed.length&&env.BUCKET)await Promise.allSettled(removed.map(key=>env.BUCKET!.delete(key)));
    return json({revision:body.revision+1});
  }catch(error){console.error(error);return json({error:'unavailable'},503)}
}
