import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../AuthContext'
import Botao, { LinkBotao } from '../../components/Botao'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'
import StatusAgendamento from '../../components/StatusAgendamento'
import { ResumoAvaliacao } from '../../components/Avaliacao'
import {
  campoDe,
  dataEHora,
  hoje,
  inicioDo,
  listaDe,
  nomeDaProfissional,
  nomeDoServico,
} from './dados'
import { Carregando, CartaoAgendamento, ErroAoCarregar } from './Componentes'
import { useAgendamento, useListaAgendamentos } from './useAgendamentos'

export function InicioCliente() {
  const [agora] = useState(() => Date.now())
  const agenda = useListaAgendamentos(`/agendamentos/?data_inicio=${hoje()}`)

  if (agenda.carregando) return <Carregando />
  if (agenda.erro) {
    return <ErroAoCarregar erro={agenda.erro} tentarNovamente={agenda.recarregar} />
  }

  const proximos = listaDe(agenda.dados)
    .filter((agendamento) => {
      const aindaAtivo = !['cancelado', 'concluido'].includes(agendamento.status)
      return aindaAtivo && new Date(inicioDo(agendamento)).getTime() >= agora
    })
    .sort((a, b) => new Date(inicioDo(a)) - new Date(inicioDo(b)))
  const proximo = proximos[0]

  return (
    <section className="pilha">
      <p className="sobretitulo">Seu momento de cuidado</p>
      <h1>Olá! Vamos cuidar de você?</h1>

      {proximo ? (
        <>
          <h2>Seu próximo horário</h2>
          <CartaoAgendamento
            agendamento={proximo}
            link={`/meus-horarios/${proximo.id}`}
          />
        </>
      ) : (
        <Cartao>
          <h2>Nenhum horário marcado</h2>
          <p>Escolha um serviço e reserve seu próximo momento no salão.</p>
          <Link className="botao botao--primario" to="/agendar">
            Agendar horário
          </Link>
        </Cartao>
      )}

      <div className="acoes">
        <Link className="botao botao--secundario" to="/meus-horarios">
          Ver horários e histórico
        </Link>
        {proximo && (
          <Link className="botao botao--primario" to="/agendar">
            Agendar outro horário
          </Link>
        )}
      </div>
    </section>
  )
}

export function HorariosCliente() {
  const [aba, setAba] = useState('proximos')
  const [agora] = useState(() => Date.now())
  const caminho = aba === 'proximos'
    ? `/agendamentos/?data_inicio=${hoje()}`
    : '/agendamentos/?ordering=-inicio'
  const agenda = useListaAgendamentos(caminho)

  if (agenda.carregando) return <Carregando />
  if (agenda.erro) {
    return <ErroAoCarregar erro={agenda.erro} tentarNovamente={agenda.recarregar} />
  }

  const horarios = listaDe(agenda.dados)
    .filter((agendamento) => {
      const dataPassou = new Date(inicioDo(agendamento)).getTime() < agora
      const encerrou = ['cancelado', 'concluido'].includes(agendamento.status)
      return aba === 'proximos' ? !encerrou && !dataPassou : encerrou || dataPassou
    })
    .sort((a, b) => new Date(inicioDo(b)) - new Date(inicioDo(a)))

  return (
    <section className="pilha">
      <p className="sobretitulo">Acompanhamento</p>
      <h1>Meus horários</h1>

      <div className="acoes">
        <Botao
          variante={aba === 'proximos' ? 'primario' : 'secundario'}
          onClick={() => setAba('proximos')}
        >
          Próximos horários
        </Botao>
        <Botao
          variante={aba === 'historico' ? 'primario' : 'secundario'}
          onClick={() => setAba('historico')}
        >
          Histórico
        </Botao>
      </div>

      {horarios.length ? (
        <div className="grade-componentes">
          {horarios.map((agendamento) => (
            <CartaoAgendamento
              key={agendamento.id}
              agendamento={agendamento}
              link={`/meus-horarios/${agendamento.id}`}
            />
          ))}
        </div>
      ) : (
        <Estado titulo={aba === 'proximos' ? 'Você não tem próximos horários' : 'Seu histórico está vazio'}>
          {aba === 'proximos' && <Link to="/agendar">Agendar um horário</Link>}
        </Estado>
      )}
    </section>
  )
}

export function DetalheCliente() {
  const { id } = useParams()
  const agendamento = useAgendamento(id)
  const { api } = useAuth()
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [agora] = useState(() => Date.now())

  async function cancelarAgendamento() {
    setEnviando(true)
    setErro(null)

    try {
      await api(`/agendamentos/${id}/cancelar/`, { method: 'POST' })
      setMensagem('Agendamento cancelado.')
      setConfirmandoCancelamento(false)
      agendamento.recarregar()
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  if (agendamento.carregando) return <Carregando />
  if (agendamento.erro) {
    return <ErroAoCarregar erro={agendamento.erro} tentarNovamente={agendamento.recarregar} />
  }

  const dados = agendamento.dados
  const podeCancelar = ['solicitado', 'confirmado'].includes(dados.status) &&
    new Date(inicioDo(dados)).getTime() > agora
  const duracao = campoDe(dados.servico, 'duracao', 'duracao_min', 'duracao_minutos')

  return (
    <section className="pagina-formulario pilha">
      <p className="sobretitulo">Meus horários</p>
      <h1>Detalhes do agendamento</h1>

      <Cartao>
        <StatusAgendamento status={dados.status} />
        <dl className="resumo-agendamento">
          <div><dt>Serviço</dt><dd>{nomeDoServico(dados)}</dd></div>
          <div><dt>Profissional</dt><dd>{nomeDaProfissional(dados)}</dd></div>
          <div><dt>Quando</dt><dd>{dataEHora(inicioDo(dados))}</dd></div>
          <div><dt>Duração</dt><dd>{duracao ? `${duracao} min` : 'Não informada'}</dd></div>
          <div><dt>Observações</dt><dd>{dados.observacoes || 'Nenhuma'}</dd></div>
        </dl>

        {dados.nota && (
          <>
            <h2>Sua avaliação</h2>
            <ResumoAvaliacao avaliacao={{ nota: dados.nota, comentario: dados.comentario }} />
          </>
        )}
        {mensagem && <p className="mensagem" role="status">{mensagem}</p>}
        {erro && <p className="campo-erro" role="alert">{erro.message}</p>}

        {confirmandoCancelamento ? (
          <div className="acoes">
            <Botao variante="perigo" carregando={enviando} onClick={cancelarAgendamento}>
              Confirmar cancelamento
            </Botao>
            <Botao
              variante="secundario"
              disabled={enviando}
              onClick={() => setConfirmandoCancelamento(false)}
            >
              Manter agendamento
            </Botao>
          </div>
        ) : podeCancelar && (
          <Botao variante="perigo" onClick={() => setConfirmandoCancelamento(true)}>
            Cancelar agendamento
          </Botao>
        )}

        {dados.status === 'concluido' && !dados.nota && (
          <LinkBotao to={`/meus-horarios/${id}/avaliar`}>
            Avaliar atendimento
          </LinkBotao>
        )}
      </Cartao>

      <Link to="/meus-horarios">Voltar aos meus horários</Link>
    </section>
  )
}
