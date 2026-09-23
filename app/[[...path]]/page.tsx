import {notFound} from 'next/navigation';
import Play from '../play';
import {chatGPTSignInPath, getChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{path?:string[]}>}){const {path=[]}=await params;const route=path.join('/');if(!['','coin-flip','pick-a-card','slides','wheel','this-or-that','quiz','quiz/play','admin'].includes(route))notFound();const user=route==='admin'?await getChatGPTUser():null;return <Play signInPath={chatGPTSignInPath('/admin')} signedIn={!!user}/>;}
