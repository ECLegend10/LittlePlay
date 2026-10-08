import {env} from 'cloudflare:workers';

export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
  const {key}=await params;if(!/^[a-f0-9-]+\.pdf$/.test(key))return new Response(null,{status:404});
  try{
    const object=await env.BUCKET?.get(key,{range:req.headers});if(!object)return new Response(null,{status:404});
    if(!('body' in object))return new Response(null,{status:412});
    const headers=new Headers({'Content-Type':'application/pdf','Content-Disposition':'inline','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','ETag':object.httpEtag,'Cross-Origin-Resource-Policy':'same-origin'});
    let status=200;
    if(object.range){
      const offset='suffix' in object.range?Math.max(0,object.size-object.range.suffix):object.range.offset??0;
      const length='suffix' in object.range?object.size-offset:object.range.length??object.size-offset;
      headers.set('Content-Range',`bytes ${offset}-${offset+length-1}/${object.size}`);
      headers.set('Content-Length',String(length));status=206;
    }else headers.set('Content-Length',String(object.size));
    return new Response(object.body,{status,headers});
  }catch{return new Response(null,{status:503})}
}
