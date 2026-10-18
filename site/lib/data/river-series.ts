import type {RiverPoint} from './types';
export function riverChange(points:RiverPoint[]):{metres:number;from:string;to:string}|null{if(points.length<2)return null;const a=points[0],b=points[points.length-1];return {metres:b.metres-a.metres,from:a.at,to:b.at};}
