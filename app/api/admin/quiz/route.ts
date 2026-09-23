import {admin,db,json,readQuiz,sameOrigin,validQuiz} from '../../../../lib/quiz';
export const dynamic='force-dynamic';
export async function GET(){if(!await admin())return json({error:'forbidden'},403);try{return json(await readQuiz());}catch(e){console.error(e);return json({error:'unavailable'},503);}}
export async function PUT(req:Request){const user=await admin();if(!user)return json({error:'forbidden'},403);if(!sameOrigin(req))return json({error:'origin'},403);try{if(Number(req.headers.get('content-length'))>150000)return json({error:'invalid'},413);const raw=await req.text();if(raw.length>150000)return json({error:'invalid'},413);const {quiz,revision}=JSON.parse(raw);if(!validQuiz(quiz)||!Number.isInteger(revision)||revision<0)return json({error:'invalid'},400);
 const statement=revision===0?db().prepare('INSERT INTO quizzes (id, data, revision, updated_by) VALUES (?, ?, 1, ?) ON CONFLICT(id) DO NOTHING').bind('main',JSON.stringify(quiz),user.userId):db().prepare('UPDATE quizzes SET data = ?, revision = revision + 1, updated_by = ? WHERE id = ? AND revision = ?').bind(JSON.stringify(quiz),user.userId,'main',revision);
 const r=await statement.run();if(!r.meta.changes)return json({error:'conflict'},409);return json({revision:revision+1});
 }catch(e){console.error(e);return json({error:'unavailable'},503);}}
