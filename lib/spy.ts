import { readDocument } from './documents';
import { locales, type LocalText } from './quiz';
export type SpyWord = { id: string; text: LocalText; enabled: boolean };
export const seedWords: SpyWord[] = [
 ['Mooncake','月饼','Kuih bulan'],['Lantern','灯笼','Tanglung'],['Durian','榴莲','Durian'],['Laksa','叻沙','Laksa'],
 ['Kolo mee','哥罗面','Mi kolok'],['Coconut','椰子','Kelapa'],['Umbrella','雨伞','Payung'],['Beach','海滩','Pantai'],
 ['Waterfall','瀑布','Air terjun'],['Mountain','高山','Gunung'],['Airport','机场','Lapangan terbang'],['Cinema','电影院','Pawagam'],
 ['Library','图书馆','Perpustakaan'],['Bicycle','自行车','Basikal'],['Camera','相机','Kamera'],['Pillow','枕头','Bantal'],
 ['Ice cream','冰淇淋','Aiskrim'],['Coffee','咖啡','Kopi'],['Cat','猫','Kucing'],['Penguin','企鹅','Penguin'],
 ['Guitar','吉他','Gitar'],['Birthday cake','生日蛋糕','Kek hari jadi'],['Rainbow','彩虹','Pelangi'],['Fireworks','烟花','Bunga api'],
].map(([en,cn,bm],i)=>({id:`starter-${i+1}`,text:{en,cn,bm},enabled:true}));
export async function readVault(){
 const {data,revision} = await readDocument('spy_vault', seedWords);
 return {words:data,revision};
}

export function validWords(value:unknown):value is SpyWord[]{
 if(!Array.isArray(value)||value.length>300)return false;
 const ids=new Set<string>();
 return value.every((word:unknown)=>{
  if(!word||typeof word!=='object')return false;
  const w=word as SpyWord;
  if(typeof w.id!=='string'||!/^[-a-zA-Z0-9]{1,64}$/.test(w.id)||ids.has(w.id)||typeof w.enabled!=='boolean'||!w.text||typeof w.text!=='object')return false;
  ids.add(w.id);
  return locales.every(l=>typeof w.text[l]==='string'&&w.text[l].length<=80&&(!w.enabled||w.text[l].trim().length>0));
 });
}
export function pickWord(words:SpyWord[],exclude:string[]){
 const enabled=words.filter(w=>w.enabled);
 if(!enabled.length)return null;
 const unseen=enabled.filter(w=>!exclude.includes(w.id)),reset=unseen.length===0,pool=reset?enabled:unseen;
 const a=new Uint32Array(1),limit=Math.floor(4294967296/pool.length)*pool.length;
 do{crypto.getRandomValues(a)}while(a[0]>=limit);
 return {word:pool[a[0]%pool.length],reset,total:enabled.length};
}
