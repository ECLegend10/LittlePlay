import {json} from '../../../lib/quiz';
import {readSettings} from '../../../lib/settings';
export const dynamic='force-dynamic';
export async function GET(){try{const {settings}=await readSettings();return json({settings});}catch(e){console.error(e);return json({error:'unavailable'},503)}}
