import type {SkyTheme} from '../../lib/sky-theme';
export function Landscape({theme='night'}:{theme?:SkyTheme}){
 const night=theme==='night'||theme==='night-rain';const wet=['rainy','stormy','night-rain'].includes(theme);const sunny=theme==='sunny';const cloudy=theme==='cloudy'||wet;
 return <svg className="landscape" viewBox="0 0 1200 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
 <linearGradient id="sky" x2="0" y2="1"><stop stopColor="var(--sky-top)"/><stop offset="1" stopColor="var(--sky-bottom)"/></linearGradient>
 <linearGradient id="water" x2="0" y2="1"><stop stopColor="var(--water-top)"/><stop offset="1" stopColor="var(--water-bottom)"/></linearGradient>
 <radialGradient id="glow"><stop stopColor="#ffe1a0" stopOpacity=".3"/><stop offset="1" stopColor="#ffe1a0" stopOpacity="0"/></radialGradient>
 </defs><path fill="url(#sky)" d="M0 0h1200v460H0z"/>
 {sunny&&<g><circle cx="855" cy="160" r="165" fill="url(#glow)"/><circle cx="855" cy="160" r="42" fill="#ffe5a1"/><ellipse cx="855" cy="160" rx="100" ry="100" stroke="#fff2c9" fill="none" opacity=".5" strokeDasharray="2 8"/></g>}
 {night&&!wet&&<g fill="#e5ead7"><path d="M876 117a43 43 0 1 0 19 73 40 40 0 0 1-19-73Z"/>{[[580,80],[655,140],[740,50],[973,61],[1038,164],[1100,90],[620,220],[1150,210]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={i%2?1.4:2} opacity=".65"/>)}</g>}
 <g fill="var(--cloud-color)" opacity={cloudy?.8:.2}><path d="M670 100h155a30 30 0 0 0-28-25 44 44 0 0 0-75-16 35 35 0 0 0-52 41Z"/><path d="M960 160h220a38 38 0 0 0-50-31 49 49 0 0 0-82-16 42 42 0 0 0-88 47Z"/>{cloudy&&<path d="M770 213h280a42 42 0 0 0-53-35 57 57 0 0 0-100-20 49 49 0 0 0-127 55Z"/>}</g>
 {wet&&<g stroke="var(--rain-color)" strokeWidth="2" opacity=".45">{Array.from({length:18},(_,i)=><path key={i} d={`M${635+i*30} ${225+(i%3)*18}l-6 22`}/>)}</g>}
 <path d="M0 290 145 190 260 249 390 150 535 265 670 201 812 266 955 190 1200 271V460H0Z" fill="var(--hill-far)"/><path d="M0 323 190 245 350 307 514 221 642 306 785 254 892 305 1070 229 1200 294V460H0Z" fill="var(--hill-mid)"/><path d="M0 340q175-74 352 0t280-11q95-30 210 17t358-17v131H0Z" fill="var(--hill-near)"/><path d="M696 329c-55 18-50 28 9 43s1 24-61 34-76 31-7 54h377c-172-45-243-31-226-54 21-28-120-38-64-77Z" fill="url(#water)"/><g stroke="#d0e8df" fill="none" opacity=".38"><path d="M696 349h32m-32 9h49m-7 34h36m-105 44h112m-54 15h138"/></g><path d="M0 409q190-74 372-9t268 60H0Z" fill="var(--hill-front)"/><g fill="var(--hill-front)"><path d="m1075 345 16-41 16 41h-10v38h-12v-38Zm40 18 21-61 21 61h-14v40h-14v-40Zm55-15 15-39 15 39h-9v36h-12v-36Z"/><path d="m520 341 13-37 13 37h-8v28h-10v-28Z"/></g></svg>;
}
