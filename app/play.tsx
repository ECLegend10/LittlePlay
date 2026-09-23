'use client';
import {useEffect,useRef} from 'react';
export default function Play({signInPath,signedIn}:{signInPath:string;signedIn:boolean}){const root=useRef<HTMLDivElement>(null);useEffect(()=>{const s=document.createElement('script');s.src='/app.js';s.async=true;document.body.appendChild(s);return()=>{s.remove();};},[]);return <><div id="app" ref={root} data-signin={signInPath} data-signedin={signedIn?'yes':'no'} /><noscript>Please enable JavaScript to play. 请启用 JavaScript。 Sila aktifkan JavaScript.</noscript></>;}
