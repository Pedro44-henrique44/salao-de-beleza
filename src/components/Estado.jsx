import Botao from './Botao'

export default function Estado({ tipo = 'vazio', titulo, children, aoTentarNovamente, acao }) {
  const titulos = { carregando: 'Carregando…', erro: 'Não foi possível carregar', vazio: 'Nada por aqui ainda' }

  return (
    <div className={`estado estado--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {tipo === 'carregando' && <span className="indicador-carregamento" aria-hidden="true" />}
      <h2>{titulo || titulos[tipo]}</h2>
      {children && <p>{children}</p>}
      {tipo === 'erro' && aoTentarNovamente && <Botao variante="secundario" onClick={aoTentarNovamente}>Tentar de novo</Botao>}
      {acao}
    </div>
  )
}
