import {json} from '../../../lib/quiz';
import {readSlides} from '../../../lib/slides';
export const dynamic='force-dynamic';

export async function GET(){
  try{
    const {library}=await readSlides();
    const deck=library.decks.find(item=>item.id===library.activeDeckId)||null;
    return json({deck});
  }catch(error){console.error(error);return json({error:'unavailable'},503)}
}
