import type {SkyTheme} from '../../lib/sky-theme';
export function Landscape({theme='night'}:{theme?:SkyTheme}){
 const night=theme==='night'||theme==='night-rain';const wet=['rainy','stormy','night-rain'].includes(theme);const sunny=theme==='sunny';const cloudy=theme==='cloudy'||wet;
 const dim=night||theme==='stormy';
 const park={wall:dim?'#789199':'#e5e7d9',roof:dim?'#4b6074':'#8097a5',blue:dim?'#294478':'#4364ad',blueLight:dim?'#3b5590':'#5b78bb',glass:dim?'#c6bc8c':'#8eb6b7',letters:dim?'#c9d4c8':'#fff8e4',heart:dim?'#a25257':'#c95651',path:dim?'#496069':'#b3b8a4',edge:dim?'#7a8d8d':'#e0ddc5',trunk:dim?'#496064':'#7b8973'};
 return <svg className="landscape" viewBox="0 0 1200 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
 <linearGradient id="sky" x2="0" y2="1"><stop stopColor="var(--sky-top)"/><stop offset="1" stopColor="var(--sky-bottom)"/></linearGradient>
 <radialGradient id="glow"><stop stopColor="#ffe1a0" stopOpacity=".3"/><stop offset="1" stopColor="#ffe1a0" stopOpacity="0"/></radialGradient>
 </defs><path fill="url(#sky)" d="M0 0h1200v460H0z"/>
 {sunny&&<g><circle cx="855" cy="160" r="165" fill="url(#glow)"/><circle cx="855" cy="160" r="42" fill="#ffe5a1"/><ellipse cx="855" cy="160" rx="100" ry="100" stroke="#fff2c9" fill="none" opacity=".5" strokeDasharray="2 8"/></g>}
 {night&&!wet&&<g fill="#e5ead7"><path d="M876 117a43 43 0 1 0 19 73 40 40 0 0 1-19-73Z"/>{[[580,80],[655,140],[740,50],[973,61],[1038,164],[1100,90],[620,220],[1150,210]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={i%2?1.4:2} opacity=".65"/>)}</g>}
 <g fill="var(--cloud-color)" opacity={cloudy?.8:.2}><path d="M670 100h155a30 30 0 0 0-28-25 44 44 0 0 0-75-16 35 35 0 0 0-52 41Z"/><path d="M960 160h220a38 38 0 0 0-50-31 49 49 0 0 0-82-16 42 42 0 0 0-88 47Z"/>{cloudy&&<path d="M770 213h280a42 42 0 0 0-53-35 57 57 0 0 0-100-20 49 49 0 0 0-127 55Z"/>}</g>
 {wet&&<g stroke="var(--rain-color)" strokeWidth="2" opacity=".45">{Array.from({length:18},(_,i)=><path key={i} d={`M${635+i*30} ${225+(i%3)*18}l-6 22`}/>)}</g>}
 <path d="M0 290 145 190 260 249 390 150 535 265 670 201 812 266 955 190 1200 271V460H0Z" fill="var(--hill-far)"/><path d="M0 323 190 245 350 307 514 221 642 306 785 254 892 305 1070 229 1200 294V460H0Z" fill="var(--hill-mid)"/><path d="M0 340q175-74 352 0t280-11q95-30 210 17t358-17v131H0Z" fill="var(--hill-near)"/><g className="park-landmarks">
 {/* Paths weave through the lawn beneath the two park landmarks. */}
 <path d="M590 365c84-13 122 6 177 26s156 14 222-3 111-13 150 4l61 33v35h-63c-81-53-111-45-195-23s-145 5-202-19-105-32-169-15Z" fill={park.path}/>
 <path d="M590 365c84-13 122 6 177 26s156 14 222-3 111-13 150 4M571 403c64-17 112-9 169 15s118 41 202 19 114-30 195 23" fill="none" stroke={park.edge} strokeWidth="2" opacity=".65"/>
 {/* CIC: pale facade, blue tower and projecting entrance canopy. */}
 <g>
 <path d="M561 290h207v72H561Z" fill={park.wall}/>
 <path d="m557 288 10-17h194l11 17Z" fill={park.roof}/>
 <path d="M576 294h8v24h-8Zm23 0h8v24h-8Zm-23 33h8v25h-8Zm23 0h8v25h-8Z" fill={park.glass}/>
 <path d="M619 267h36v96h-36Z" fill={park.blueLight}/>
 <path d="m655 267 9 9v87h-9Z" fill={park.blue}/>
 <path d="M653 295h115v27H653Z" fill={park.roof}/>
 <text x="674" y="316" fill={park.letters} fontFamily="Arial, sans-serif" fontSize="24" letterSpacing="2">CIC</text>
 <path d="M644 323h153l-19 17H644Z" fill={park.blueLight}/>
 <path d="M644 340h134v6H644Z" fill={park.blue}/>
 <path d="M774 340h4v24h-4Z" fill={park.blue}/>
 <path d="M670 346h57v16h-57Z" fill={park.glass}/>
 <path d="M687 346v16m22-16v16" stroke={park.wall} strokeWidth="2"/>
 <path d="M553 363h231v5H553Z" fill={park.edge}/>
 <path d="M566 368h211v4H566Z" fill={park.path}/>
 <path d="M628 280h18v10h-18Zm5-4h8v4h-8Z" stroke={park.letters} strokeWidth="1" fill="none" opacity=".7"/>
 </g>
 {/* Broad tree canopies echo the flat silhouettes of the hills. */}
 <g fill={park.trunk}><path d="M833 307h5v66h-5Z"/><path d="m836 338-18-19 2-3 17 15 15-24 3 2-17 30Z"/><path d="M1136 309h5v62h-5Z"/></g>
 <g fill="var(--hill-mid)"><path d="M802 316c-20-9-15-30 2-34-5-22 24-32 37-18 20-12 42 2 36 21 23 13 9 37-11 34-13 14-43 13-51 0Z"/><path d="M1106 312c-18-10-13-28 1-32-2-20 22-27 34-16 18-9 37 5 31 21 18 10 11 32-9 32-17 12-37 8-44-1Z"/></g>
 <g fill="var(--hill-near)" opacity=".45"><ellipse cx="830" cy="302" rx="32" ry="18"/><ellipse cx="1142" cy="301" rx="27" ry="17"/></g>
 {/* Outlined letters keep the landmark independent of installed fonts. */}
 <path d="M857 386h268v6H857Z" fill="var(--hill-front)"/>
 <path d="M854 392h274v3H854Z" fill={park.path}/>
 <path d="M882 381c-8-7-23-17-23-28 0-14 15-18 23-7 8-11 23-7 23 7 0 11-15 21-23 28Z" fill="none" stroke={park.heart} strokeWidth="7" strokeLinejoin="round"/>
 <g fill={park.letters}>
 <path d="M910 340h36v9h-13v35h-10v-35h-13Zm42 0h10v44h-10Zm18 44v-44h10l13 18 13-18h10v44h-10v-28l-13 18-13-18v28Z"/>
 <path fillRule="evenodd" d="M1025 340h18c18 0 22 20 11 22 14 5 8 22-8 22h-21Zm10 9v9h8c8 0 8-9 0-9Zm0 17v9h9c9 0 9-9 0-9Z"/>
 <path fillRule="evenodd" d="M1091 339c30 0 30 46 0 46s-30-46 0-46Zm0 10c-17 0-17 26 0 26s17-26 0-26Z"/>
 <path d="m1086 334 8-11h13l-13 11Z"/>
 </g>
 <g stroke={park.edge} strokeWidth="2" fill="none" opacity=".7"><path d="M808 352v27m0-25q7-9 13-5M1166 341v35m0-32q-7-9-13-5"/></g>
 </g>
 <path d="M0 409q190-74 372-9t268 60H0Z" fill="var(--hill-front)"/>
 </svg>;
}
