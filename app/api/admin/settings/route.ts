import { writeDocument } from '../../../../lib/documents';
import {admin,json,sameOrigin} from '../../../../lib/quiz';
import {readSettings,validSettings} from '../../../../lib/settings';
export const dynamic='force-dynamic';
export async function GET(){if(!await admin())return json({error:'forbidden'},403);try{return json(await readSettings())}catch(e){console.error(e);return json({error:'unavailable'},503)}}
export async function PUT(req:Request){
  const user=await admin();if(!user)return json({error:'forbidden'},403);
  if(!sameOrigin(req))return json({error:'origin'},403);
  try{
    if(Number(req.headers.get('content-length'))>200000)return json({error:'invalid'},413);
    const raw=await req.text();if(raw.length>200000)return json({error:'invalid'},413);
    let body;try{body=JSON.parse(raw)}catch{return json({error:'invalid'},400)}
    if(!body||!validSettings(body.settings)||!Number.isInteger(body.revision)||body.revision<0)return json({error:'invalid'},400);
    const {settings,revision}=body;
    const next=await writeDocument('site_settings',settings,revision,user.userId);
 if(next===null)return json({error:'conflict'},409);
    return json({revision:revision+1});
  }catch(e){console.error(e);return json({error:'unavailable'},503)}
}
