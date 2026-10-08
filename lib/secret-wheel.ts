import { db } from './quiz';

export type SecretWheelOption = { id:string; name:string; weight:number };
export type SecretWheel = { useWeights:boolean; options:SecretWheelOption[] };

export const defaultSecretWheel:SecretWheel={
  useWeights:false,
  options:[
    {id:'starter-1',name:'Laksa',weight:1},
    {id:'starter-2',name:'Kolo mee',weight:1},
    {id:'starter-3',name:'Chicken rice',weight:1},
    {id:'starter-4',name:'Nasi lemak',weight:1},
  ],
};

export async function readSecretWheel(){
  const row=await db().prepare('SELECT data, revision FROM secret_wheels WHERE id = ?').bind('main').first<{data:string;revision:number}>();
  return {wheel:row?JSON.parse(row.data) as SecretWheel:defaultSecretWheel,revision:row?.revision??0};
}

export function validSecretWheel(value:unknown):value is SecretWheel{
  if(!value||typeof value!=='object')return false;
  const wheel=value as SecretWheel;
  if(typeof wheel.useWeights!=='boolean'||!Array.isArray(wheel.options)||wheel.options.length<2||wheel.options.length>50)return false;
  const ids=new Set<string>();
  return wheel.options.every(option=>{
    if(!option||typeof option!=='object'||typeof option.id!=='string'||!/^[-a-zA-Z0-9]{1,64}$/.test(option.id)||ids.has(option.id))return false;
    ids.add(option.id);
    return typeof option.name==='string'&&option.name.trim().length>=1&&option.name.length<=40&&Number.isInteger(option.weight)&&option.weight>=1&&option.weight<=1000;
  });
}
