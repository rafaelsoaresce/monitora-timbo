import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect} from 'vitest';
import {ConnectionState} from '../components/monitor/connection-state';
import {DashboardInformation} from '../components/monitor/dashboard-information';
it('shows empty measurements and distinguishes network loss from server failure',()=>{
 const offline=renderToStaticMarkup(createElement(ConnectionState,{status:'offline',onRetry:()=>{},busy:false}));
 expect(offline).toContain('Sem conexão com a internet');expect(offline.match(/class="offline-value"/g)).toHaveLength(3);expect(offline).not.toContain('<svg');
 const server=renderToStaticMarkup(createElement(ConnectionState,{status:'unavailable',onRetry:()=>{},busy:false}));
 expect(server).toContain('Não foi possível carregar os dados');expect(server).not.toContain('Sem conexão com a internet');
});
it('keeps official guidance in the data-independent dashboard content',()=>{
 const html=renderToStaticMarkup(createElement(DashboardInformation));
 expect(html).toContain('https://www.defesacivil.sc.gov.br/');
 expect(html).toContain('Como interpretar o nível');
 expect(html).toContain('projeto independente');
});
