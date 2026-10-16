import Estado from '../../components/Estado'

export function CabecalhoEtapa({ titulo, numero }) {
  return (
    <div className="admin-titulo acoes">
      <div>
        <p className="sobretitulo">Agendamento · etapa {numero} de 4</p>
        <h1>{titulo}</h1>
      </div>
    </div>
  )
}

export function ErroAoCarregar({ erro }) {
  if (!erro) return null

  return (
    <Estado tipo="erro" titulo="Não foi possível carregar" aoTentarNovamente={() => window.location.reload()}>
      {erro.message}
    </Estado>
  )
}
