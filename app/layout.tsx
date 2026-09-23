import type {Metadata} from 'next';
export const metadata:Metadata={title:'Little Play · Your activity room',description:'Flip a coin, pick a card, spin a wheel, explore slides, and enjoy a little quiz.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><link rel="stylesheet" href="/style.css"/></head><body>{children}</body></html>;}
