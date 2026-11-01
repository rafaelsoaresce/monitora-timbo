import type {ConnectionStatus} from '../../lib/connectivity';
export function ConnectionState({status,onRetry,busy}:{status:ConnectionStatus;onRetry:()=>void;busy:boolean}){
 const offline=status==='offline',checking=status==='checking';
 return <section className="connection-state" aria-label="Disponibilidade dos dados">
  <div className="connection-notice" role="status" aria-live="polite"><h2>{offline?'Sem conexão com a internet':checking?'Verificando conexão…':'Não foi possível carregar os dados'}</h2><p>{offline?'Conecte-se para consultar as medições e a previsão do tempo.':checking?'Aguarde enquanto consultamos as medições e a previsão do tempo.':'O serviço pode estar indisponível ou a conexão pode ter sido interrompida. Tente novamente.'}</p><button type="button" className="pwa-button" onClick={onRetry} disabled={busy}>{busy?'Verificando…':'Tentar novamente'}</button></div>
  <div className="offline-cards">{['Nível do rio','Chuva acumulada','Temperatura e previsão'].map(label=><article className="card" key={label}><h3>{label}</h3><div className="offline-value">—</div><p>Indisponível {offline?'sem conexão':'no momento'}</p></article>)}</div><p className="connection-footnote">As informações voltam após reconectar e carregar os dados com sucesso.</p>
 </section>;
}
