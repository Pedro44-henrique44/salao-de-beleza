import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useAuth } from '../../AuthContext'
import Botao from '../../components/Botao'
import Cartao from '../../components/Cartao'
import StatusAgendamento from '../../components/StatusAgendamento'
import { ResumoAvaliacao } from '../../components/Avaliacao'
import { Carregando, CartaoAgendamento, ErroAoCarregar } from './Componentes'
import {
  campoDe,
  dataEHora,
  hoje,
  inicioDo,
  listaDe,
  nomeDaProfissional,
  nomeDoServico,
} from './dados'
import { useAgendamento, useListaAgendamentos } from './useAgendamentos'

export function AgendaAdministrador() {
  const [parametros, setParametros] = useSearchParams()
  const [data, setData] = useState(parametros.get('data') || hoje())
  const [status, setStatus] = useState(parametros.get('status') || '')
  const [recurso, setRecurso] = useState(parametros.get('recurso') || '')

  const filtroDoRecurso = recurso ? `&recurso=${recurso}` : ''
  const agenda = useListaAgendamentos(
    `/agendamentos/?data_inicio=${data}&data_fim=${data}${filtroDoRecurso}`,
  )
  const profissionais = useListaAgendamentos('/recursos/?ativo=true')

  const horariosDoDia = useMemo(() => {
    return listaDe(agenda.dados)
      .filter((agendamento) => {
        const mesmoStatus = !status || agendamento.status === status
        const idDoRecurso = campoDe(agendamento.recurso, 'id') || agendamento.recurso_id
        const mesmaProfissional = !recurso || String(idDoRecurso) === recurso
        return mesmoStatus && mesmaProfissional
      })
      .sort((a, b) => new Date(inicioDo(a)) - new Date(inicioDo(b)))
  }, [agenda.dados, recurso, status])

  function aplicarFiltros() {
    setParametros({
      ...(data ? { data } : {}),
      ...(status ? { status } : {}),
      ...(recurso ? { recurso } : {}),
    })
  }

  if (agenda.carregando || profissionais.carregando) return <Carregando />
  if (agenda.erro) {
    return <ErroAoCarregar erro={agenda.erro} tentarNovamente={agenda.recarregar} />
  }
  if (profissionais.erro) {
    return <ErroAoCarregar erro={profissionais.erro} tentarNovamente={profissionais.recarregar} />
  }

  return (
    <section className="pilha">
      <p className="sobretitulo">Administração</p>
      <h1>Agenda do dia</h1>

      <form
        className="filtros-agenda"
        onSubmit={(evento) => {
          evento.preventDefault()
          aplicarFiltros()
        }}
      >
        <div className="campo">
          <label htmlFor="agenda-data">Data</label>
          <input
            id="agenda-data"
            type="date"
            value={data}
            onChange={(evento) => setData(evento.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="agenda-status">Status</label>
          <select
            id="agenda-status"
            value={status}
            onChange={(evento) => setStatus(evento.target.value)}
          >
            <option value="">Todos</option>
            <option value="solicitado">Solicitado</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="agenda-profissional">Profissional</label>
          <select
            id="agenda-profissional"
            value={recurso}
            onChange={(evento) => setRecurso(evento.target.value)}
          >
            <option value="">Todas</option>
            {listaDe(profissionais.dados).map((profissional) => (
              <option key={profissional.id} value={profissional.id}>
                {profissional.nome}
              </option>
            ))}
          </select>
        </div>

        <Botao type="submit">Aplicar filtros</Botao>
      </form>

      {horariosDoDia.length ? (
        <div className="grade-componentes">
          {horariosDoDia.map((agendamento) => (
            <CartaoAgendamento
              key={agendamento.id}
              agendamento={agendamento}
              link={`/admin/agendamentos/${agendamento.id}`}
              mostrarCliente
            />
          ))}
        </div>
      ) : (
        <p>Nenhum agendamento para estes filtros.</p>
      )}
    </section>
  )
}

export function PedidosAdministrador() {
  const { api } = useAuth()
  const [erroDaAcao, setErroDaAcao] = useState(null)
  const [agendamentoEmAtualizacao, setAgendamentoEmAtualizacao] = useState(null)
  const pedidos = useListaAgendamentos('/agendamentos/?status=solicitado')

  async function atualizarPedido(agendamento, acao) {
    setErroDaAcao(null)
    setAgendamentoEmAtualizacao(agendamento.id)

    try {
      await api(`/agendamentos/${agendamento.id}/${acao}/`, { method: 'POST' })
      pedidos.recarregar()
    } catch (erro) {
      setErroDaAcao(erro)
    } finally {
      setAgendamentoEmAtualizacao(null)
    }
  }

  if (pedidos.carregando) return <Carregando />
  if (pedidos.erro) {
    return <ErroAoCarregar erro={pedidos.erro} tentarNovamente={pedidos.recarregar} />
  }

  const listaDePedidos = listaDe(pedidos.dados)
    .sort((a, b) => new Date(inicioDo(a)) - new Date(inicioDo(b)))

  return (
    <section className="pilha">
      <p className="sobretitulo">Administração</p>
      <h1>A confirmar</h1>
      {erroDaAcao && <p className="campo-erro" role="alert">{erroDaAcao.message}</p>}

      {listaDePedidos.length ? (
        <div className="grade-componentes">
          {listaDePedidos.map((agendamento) => (
            <CartaoAgendamento
              key={agendamento.id}
              agendamento={agendamento}
              link={`/admin/agendamentos/${agendamento.id}`}
              mostrarCliente
              acoes={(
                <>
                  <Botao
                    disabled={agendamentoEmAtualizacao === agendamento.id}
                    onClick={() => atualizarPedido(agendamento, 'confirmar')}
                  >
                    Confirmar
                  </Botao>
                  <Botao
                    variante="perigo"
                    disabled={agendamentoEmAtualizacao === agendamento.id}
                    onClick={() => atualizarPedido(agendamento, 'cancelar')}
                  >
                    Cancelar
                  </Botao>
                </>
              )}
            />
          ))}
        </div>
      ) : (
        <p>Nenhum pedido aguardando confirmação.</p>
      )}
    </section>
  )
}

export function DetalheAdministrador() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const agendamento = useAgendamento(id)
  const [erroDaAcao, setErroDaAcao] = useState(null)
  const [atualizando, setAtualizando] = useState(false)

  async function atualizarAgendamento(acao) {
    setErroDaAcao(null)
    setAtualizando(true)

    try {
      await api(`/agendamentos/${id}/${acao}/`, { method: 'POST' })
      agendamento.recarregar()
    } catch (erro) {
      setErroDaAcao(erro)
    } finally {
      setAtualizando(false)
    }
  }

  if (agendamento.carregando) return <Carregando />
  if (agendamento.erro) {
    return <ErroAoCarregar erro={agendamento.erro} tentarNovamente={agendamento.recarregar} />
  }

  const dados = agendamento.dados

  return (
    <section className="pagina-formulario pilha">
      <p className="sobretitulo">Administração</p>
      <h1>Detalhes do atendimento</h1>

      <Cartao>
        <StatusAgendamento status={dados.status} />
        <dl className="resumo-agendamento">
          <div>
            <dt>Cliente</dt>
            <dd>
              {campoDe(dados.cliente, 'nome') || campoDe(dados.usuario, 'nome') || dados.cliente_nome || 'Cliente'}
            </dd>
          </div>
          <div><dt>Serviço</dt><dd>{nomeDoServico(dados)}</dd></div>
          <div><dt>Profissional</dt><dd>{nomeDaProfissional(dados)}</dd></div>
          <div><dt>Quando</dt><dd>{dataEHora(inicioDo(dados))}</dd></div>
          <div><dt>Observações</dt><dd>{dados.observacoes || 'Nenhuma'}</dd></div>
        </dl>

        {dados.nota && (
          <>
            <h2>Avaliação</h2>
            <ResumoAvaliacao avaliacao={{ nota: dados.nota, comentario: dados.comentario }} />
          </>
        )}
        {erroDaAcao && <p className="campo-erro" role="alert">{erroDaAcao.message}</p>}

        <div className="acoes">
          {dados.status === 'solicitado' && (
            <>
              <Botao disabled={atualizando} onClick={() => atualizarAgendamento('confirmar')}>
                Confirmar pedido
              </Botao>
              <Botao variante="perigo" disabled={atualizando} onClick={() => atualizarAgendamento('cancelar')}>
                Cancelar pedido
              </Botao>
            </>
          )}
          {dados.status === 'confirmado' && (
            <>
              <Botao disabled={atualizando} onClick={() => atualizarAgendamento('concluir')}>
                Concluir atendimento
              </Botao>
              <Botao variante="perigo" disabled={atualizando} onClick={() => atualizarAgendamento('cancelar')}>
                Cancelar agendamento
              </Botao>
            </>
          )}
        </div>
      </Cartao>

      <Botao variante="secundario" onClick={() => navigate(-1)}>Voltar</Botao>
    </section>
  )
}
