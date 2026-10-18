import type {MetadataRoute} from 'next';import {siteOrigin,sitemapPaths} from '../lib/seo';
export default function sitemap():MetadataRoute.Sitemap{return sitemapPaths.map(path=>({url:siteOrigin()+(path==='/'?'':path),changeFrequency:path==='/'?'hourly':'monthly',priority:path==='/'?1:.7}));}
