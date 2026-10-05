import { db, locales, type LocalText } from './quiz';

export const moduleIds = ['coin','cards','slides','wheel','either','quiz','rps','spy','timer'] as const;
export type ModuleId = typeof moduleIds[number];
export type EitherPair = { id:string; enabled:boolean; options:[LocalText,LocalText] };
export type SiteSettings = {
  modules: Record<ModuleId,boolean>;
  timerTarget:number;
  eitherPairs:EitherPair[];
};

const text=(en:string,cn:string,bm:string):LocalText=>({en,cn,bm});
export const defaultSettings:SiteSettings={
  modules:Object.fromEntries(moduleIds.map(id=>[id,true])) as Record<ModuleId,boolean>,
  timerTarget:5,
  eitherPairs:[
    ['Laksa','叻沙','Laksa','Kolo mee','哥罗面','Mi kolok'],
    ['Sunrise','日出','Matahari terbit','Sunset','日落','Matahari terbenam'],
    ['Coffee','咖啡','Kopi','Tea','茶','Teh'],
    ['Mountains','高山','Gunung','Beach','海滩','Pantai'],
    ['Sweet','甜食','Manis','Savoury','咸食','Masin'],
    ['Movie night','电影之夜','Malam filem','Game night','游戏之夜','Malam permainan'],
    ['Cats','猫','Kucing','Dogs','狗','Anjing'],
    ['Plan ahead','提前规划','Rancang awal','Go with the flow','随心而行','Ikut keadaan'],
  ].map((v,i)=>({id:`starter-${i+1}`,enabled:true,options:[text(v[0],v[1],v[2]),text(v[3],v[4],v[5])]})),
};

export async function readSettings(){
  const row=await db().prepare('SELECT data, revision FROM site_settings WHERE id = ?').bind('main').first<{data:string;revision:number}>();
  return {settings:row?JSON.parse(row.data) as SiteSettings:defaultSettings,revision:row?.revision??0};
}

export function validSettings(value:unknown):value is SiteSettings{
  if(!value||typeof value!=='object')return false;
  const s=value as SiteSettings;
  if(!s.modules||!moduleIds.every(id=>typeof s.modules[id]==='boolean'))return false;
  if(typeof s.timerTarget!=='number'||!Number.isFinite(s.timerTarget)||s.timerTarget<1||s.timerTarget>60||Math.round(s.timerTarget*100)!==s.timerTarget*100)return false;
  if(!Array.isArray(s.eitherPairs)||s.eitherPairs.length<1||s.eitherPairs.length>100)return false;
  const ids=new Set<string>();
  return s.eitherPairs.every(pair=>{
    if(!pair||typeof pair.id!=='string'||!/^[-a-zA-Z0-9]{1,64}$/.test(pair.id)||ids.has(pair.id)||typeof pair.enabled!=='boolean'||!Array.isArray(pair.options)||pair.options.length!==2)return false;
    ids.add(pair.id);
    return pair.options.every(option=>option&&locales.every(locale=>typeof option[locale]==='string'&&option[locale].length<=80&&(!pair.enabled||option[locale].trim().length>0)));
  });
}
