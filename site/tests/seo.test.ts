import {it,expect,afterEach} from 'vitest';
import {pageMetadata,siteOrigin,sitemapPaths} from '../lib/seo';
afterEach(()=>{delete process.env.SITE_URL});
it('canonical_uses_production_origin',()=>{process.env.SITE_URL='https://example.com';expect(pageMetadata('/nivel-do-rio','Rio','Descrição').alternates?.canonical).toBe('https://example.com/nivel-do-rio')});
it('lists_four_distinct_routes',()=>expect(sitemapPaths).toEqual(['/','/nivel-do-rio','/previsao-do-tempo','/sobre-os-dados']));
it('does_not_invent_a_localhost_canonical',()=>{delete process.env.SITE_URL;expect(siteOrigin()).toBe('https://monitora-timbo.rafaelsoaresce.chatgpt.site')});
it('rejects_invalid_origin',()=>{process.env.SITE_URL='http://localhost:5173';expect(()=>siteOrigin()).toThrow()});
