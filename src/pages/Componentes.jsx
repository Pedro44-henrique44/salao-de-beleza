import { useState } from 'react'
import Botao, { LinkBotao } from '../components/Botao'
import Campo from '../components/Campo'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'
import StatusAgendamento from '../components/StatusAgendamento'

// Vitrine local para conferir os componentes sem depender da API.
export default function Componentes() {
  const [nome, setNome] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [tentouNovamente, setTentouNovamente] = useState(false)

  return (
    <section className="pilha">
      <header className="titulo-pagina">
        <p className="sobretitulo">Desenvolvimento</p>
        <h1>Componentes da interface</h1>
        <p className="texto-suave">Referência visual local. Os exemplos não enviam dados à API.</p>
      </header>
      <Cartao>
        <h2>Botões e navegação</h2>
        <div className="acoes">
          <Botao onClick={() => setEnviado(true)}>Ação principal</Botao>
          <LinkBotao to="/" variante="secundario">Voltar à entrada</LinkBotao>
          <Botao variante="perigo" onClick={() => setEnviado(false)}>Limpar exemplo</Botao>
          <Botao disabled>Indisponível</Botao>
          <Botao carregando>Salvar</Botao>
        </div>
        <p role="status">{enviado ? 'Ação de exemplo executada.' : 'Nenhuma ação executada.'}</p>
      </Cartao>
      <Cartao>
        <h2>Campos de formulário</h2>
        <div className="grade-componentes">
          <Campo label="Nome" value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" ajuda="Use seu nome completo." required />
          <Campo label="E-mail" type="email" defaultValue="exemplo" erro="Informe um e-mail válido." />
          <Campo label="Campo desabilitado" value="Não editável" disabled />
        </div>
      </Cartao>
      <Cartao>
        <h2>Status dos horários</h2>
        <div className="acoes">{['solicitado', 'confirmado', 'concluido', 'cancelado'].map((status) => <StatusAgendamento key={status} status={status} />)}</div>
      </Cartao>
      <div className="grade-componentes">
        <Estado tipo="carregando">Buscando os horários.</Estado>
        <Estado titulo="Nenhum horário agendado">Seus próximos atendimentos aparecerão aqui.</Estado>
        {tentouNovamente
          ? <Estado titulo="Nova tentativa executada">Este é apenas um exemplo local.</Estado>
          : <Estado tipo="erro" aoTentarNovamente={() => setTentouNovamente(true)}>Confira sua conexão e tente novamente.</Estado>}
      </div>
    </section>
  )
}
