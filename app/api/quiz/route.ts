import {json,readQuiz} from '../../../lib/quiz';
export const dynamic='force-dynamic';
export async function GET(){try{ const data=await readQuiz();return json(data.quiz.published?data:{quiz:null,revision:data.revision}); }catch(e){console.error(e);return json({error:'unavailable'},503);}}
