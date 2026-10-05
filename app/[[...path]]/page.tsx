import {notFound} from 'next/navigation';
import Play from '../play';
import {chatGPTSignInPath, getChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{path?:string[]}>}){const {path=[]}=await params;const route=path.join('/');if(!['','coin-flip','pick-a-card','slides','wheel','this-or-that','rock-paper-scissors','spy-game','hit-the-mark','admin','admin/settings','admin/quiz','admin/words','quiz','quiz/play'].includes(route))notFound();const user=route.startsWith('admin')?await getChatGPTUser():null;return <Play signInPath={chatGPTSignInPath('/'+route)} signedIn={!!user}/>;}
