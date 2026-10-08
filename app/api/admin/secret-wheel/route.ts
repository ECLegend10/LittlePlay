import {admin,db,json,sameOrigin} from '../../../../lib/quiz';
import {readSecretWheel,validSecretWheel} from '../../../../lib/secret-wheel';
export const dynamic='force-dynamic';

export async function GET(){
  if(!await admin())return json({error:'forbidden'},403);
  try{return json(await readSecretWheel())}catch(e){console.error(e);return json({error:'unavailable'},503)}
}

export async function PUT(req:Request){
  const user=await admin();if(!user)return json({error:'forbidden'},403);
  if(!sameOrigin(req))return json({error:'origin'},403);
  try{
    if(Number(req.headers.get('content-length'))>100000)return json({error:'invalid'},413);
    const raw=await req.text();if(raw.length>100000)return json({error:'invalid'},413);
    let body;try{body=JSON.parse(raw)}catch{return json({error:'invalid'},400)}
    if(!body||!validSecretWheel(body.wheel)||!Number.isInteger(body.revision)||body.revision<0)return json({error:'invalid'},400);
    const {wheel,revision}=body;
    const statement=revision===0
      ?db().prepare('INSERT INTO secret_wheels (id, data, revision, updated_by) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO NOTHING').bind('main',JSON.stringify(wheel),user.userId)
      :db().prepare('UPDATE secret_wheels SET data = ?, revision = revision + 1, updated_by = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(wheel),user.userId,'main',revision);
    const result=await statement.run();if(!result.meta.changes)return json({error:'conflict'},409);
    return json({revision:revision+1});
  }catch(e){console.error(e);return json({error:'unavailable'},503)}
}
