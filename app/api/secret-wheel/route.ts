import {json,sameOrigin} from '../../../lib/quiz';
import {readSecretWheel} from '../../../lib/secret-wheel';
export const dynamic='force-dynamic';

function randomInt(maxExclusive:number){
  const value=new Uint32Array(1),limit=Math.floor(4294967296/maxExclusive)*maxExclusive;
  do crypto.getRandomValues(value);while(value[0]>=limit);
  return value[0]%maxExclusive;
}

export async function GET(){
  try{
    const {wheel}=await readSecretWheel();
    return json({options:wheel.options.map(({id,name})=>({id,name}))});
  }catch(e){console.error(e);return json({error:'unavailable'},503)}
}

export async function POST(req:Request){
  if(!sameOrigin(req))return json({error:'origin'},403);
  try{
    const {wheel}=await readSecretWheel();
    let index:number;
    if(!wheel.useWeights)index=randomInt(wheel.options.length);
    else{
      const total=wheel.options.reduce((sum,option)=>sum+option.weight,0);
      let choice=randomInt(total);index=wheel.options.length-1;
      for(let i=0;i<wheel.options.length;i++){choice-=wheel.options[i].weight;if(choice<0){index=i;break}}
    }
    const winner=wheel.options[index];
    return json({options:wheel.options.map(({id,name})=>({id,name})),winner:{id:winner.id,name:winner.name}});
  }catch(e){console.error(e);return json({error:'unavailable'},503)}
}
