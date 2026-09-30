// Shared outline icons from the existing Lucide dependency.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as icons from 'lucide-react';
import { writeFileSync, readFileSync } from 'node:fs';
const names=['Coins','Layers','Presentation','Disc3','ArrowLeftRight','CircleHelp','Scissors','Fingerprint','Vault','Settings2','LayoutGrid','Sun','Moon','Menu','X','RotateCcw','ChevronLeft','ChevronRight','ArrowRight','ArrowUpRight','Plus','Check','Copy','Expand','ChevronDown','Trash2','LockKeyhole','HandFist','Hand','Sparkles'];
const symbols=names.map(name=>{
 if(!icons[name])throw Error(`Missing Lucide icon: ${name}`);
 const svg=renderToStaticMarkup(createElement(icons[name],{strokeWidth:1.8}));
 const children=svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>'));
 return `<symbol id="${name}" viewBox="0 0 24 24">${children}</symbol>`;
}).join('\n');
writeFileSync('public/icons.svg',`<svg xmlns="http://www.w3.org/2000/svg">\n${symbols}\n</svg>\n`);
writeFileSync('public/icons.LICENSE.txt',readFileSync('node_modules/lucide-react/LICENSE','utf8'));
const brand=renderToStaticMarkup(createElement(icons.Sparkles,{color:'#426925',strokeWidth:1.8}));
writeFileSync('public/favicon.svg',brand.replace('<svg ','<svg style="background:#e8ebed;border-radius:6px;padding:3px" '));
console.log(`Generated ${names.length} consistent Lucide icons.`);
