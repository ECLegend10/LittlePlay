import {db,locales,type LocalText} from './quiz';

export type ImageSlide={id:string;url:string};
export type ImageDeck={id:string;title:LocalText;type:'images';pages:ImageSlide[];pdfUrl:''};
export type PdfDeck={id:string;title:LocalText;type:'pdf';pages:[];pdfUrl:string};
export type SlideDeck=ImageDeck|PdfDeck;
export type SlideLibrary={activeDeckId:string;decks:SlideDeck[]};

export const emptySlideLibrary:SlideLibrary={activeDeckId:'',decks:[]};
const idPattern=/^[a-zA-Z0-9-]{1,64}$/;
const imagePattern=/^\/api\/images\/[a-f0-9-]+\.(png|jpg|webp)$/;
const pdfPattern=/^\/api\/files\/[a-f0-9-]+\.pdf$/;

export async function readSlides(){
  const row=await db().prepare('SELECT data, revision FROM slide_libraries WHERE id = ?').bind('main').first<{data:string;revision:number}>();
  if(!row)return {library:emptySlideLibrary,revision:0};
  const library:unknown=JSON.parse(row.data);
  if(!validSlideLibrary(library))throw new Error('Invalid stored slide library');
  return {library,revision:row.revision};
}

export function validSlideLibrary(value:unknown):value is SlideLibrary{
  if(!value||typeof value!=='object')return false;
  const library=value as SlideLibrary;
  if(typeof library.activeDeckId!=='string'||!Array.isArray(library.decks)||library.decks.length>20)return false;
  const ids=new Set<string>();
  const valid=library.decks.every(deck=>{
    if(!deck||!idPattern.test(deck.id)||ids.has(deck.id)||!deck.title||!locales.every(locale=>typeof deck.title[locale]==='string'&&deck.title[locale].trim().length>0&&deck.title[locale].length<=80))return false;
    ids.add(deck.id);
    if(deck.type==='images'){
      const pageIds=new Set<string>();
      return deck.pdfUrl===''&&Array.isArray(deck.pages)&&deck.pages.length>=1&&deck.pages.length<=50&&deck.pages.every(page=>{
        if(!page||!idPattern.test(page.id)||pageIds.has(page.id)||!imagePattern.test(page.url))return false;
        pageIds.add(page.id);return true;
      });
    }
    return deck.type==='pdf'&&Array.isArray(deck.pages)&&deck.pages.length===0&&pdfPattern.test(deck.pdfUrl);
  });
  return valid&&(library.decks.length===0?library.activeDeckId==='':ids.has(library.activeDeckId));
}

export function storedKeys(library:SlideLibrary){
  const keys=new Set<string>();
  for(const deck of library.decks){
    if(deck.type==='pdf'){const match=deck.pdfUrl.match(/^\/api\/files\/(.+)$/);if(match)keys.add(match[1]);}
    else for(const page of deck.pages){const match=page.url.match(/^\/api\/images\/(.+)$/);if(match)keys.add(match[1]);}
  }
  return keys;
}
