import {admin,json} from '../../../lib/quiz';
export const dynamic='force-dynamic';
export async function GET(){return json({admin:!!await admin()});}
