import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useAuth } from '../AuthContext'
import Botao, { LinkBotao } from '../components/Botao'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'
import StatusAgendamento from '../components/StatusAgendamento'
import useConsulta from '../hooks/useConsulta'
import { ResumoAvaliacao } from '../components/Avaliacao'

const itens = (dados) => Array.isArray(dados) ? dados : (dados?.results || [])
const valor = (item, ...chaves) => chaves.map((chave) => item?.[chave]).find((item) => item !== undefined && item !== null)
const inicioDe = (item) => valor(item, 'inicio', 'data_hora', 'data_inicio')
const servicoDe = (item) => valor(item?.servico, 'nome') || item?.servico_nome || 'Serviço'
const profissionalDe = (item) => valor(item?.recurso, 'nome') || valor(item?.profissional, 'nome') || item?.recurso_nome || 'A definir'
const dataHora = (data) => data ? new Date(data).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }) : 'Data não informada'
const dataLocal = (data = new Date()) => { const d = new Date(data); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const hoje = () => dataLocal()
const duracaoDe = (a) => {
  const minutos = (new Date(a.fim) - new Date(a.inicio)) / 60000
  return Number.isFinite(minutos) && minutos > 0 ? `${minutos} min` : 'Não informada'
}

function useLista(caminho) {
  const { api } = useAuth()
  const [estado, setEstado] = useState({ caminho: '', dados: null, erro: null })
  const [tentativa, setTentativa] = useState(0)
  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        let dados = await api(caminho)
        if (!Array.isArray(dados) && Array.isArray(dados?.results)) {
          const resultados = [...dados.results]
          let proxima = dados.next
          while (ativo && proxima) {
            const pagina = await api(proxima)
            resultados.push(...itens(pagina))
            proxima = pagina?.next
          }
          dados = resultados
        }
        if (ativo) setEstado({ caminho, tentativa, dados, erro: null })
      } catch (erro) { if (ativo) setEstado({ caminho, tentativa, dados: null, erro }) }
    }
    carregar()
    return () => { ativo = false }
  }, [api, caminho, tentativa])
  const carregando = estado.caminho !== caminho || estado.tentativa !== tentativa
  return { ...estado, carregando, recarregar: () => setTentativa((n) => n + 1) }
}

function Erro({ erro, tentar }) { return <Estado tipo="erro" titulo="Não foi possível carregar os agendamentos" aoTentarNovamente={tentar}>{erro?.message}</Estado> }
function CartaoAgendamento({ agendamento, href, acao, exibirCliente = false }) {
  const cliente = valor(agendamento.cliente, 'nome') || valor(agendamento.usuario, 'nome') || agendamento.cliente_nome || 'Cliente'
  return <Cartao className="cartao-agendamento"><div className="acoes"><StatusAgendamento status={agendamento.status} /><strong>{dataHora(inicioDe(agendamento))}</strong></div><h2>{servicoDe(agendamento)}</h2><p className="texto-suave">Com {profissionalDe(agendamento)}</p>{exibirCliente && <><p><strong>Cliente:</strong> {cliente}</p>{agendamento.observacoes && <p><strong>Observações:</strong> {agendamento.observacoes}</p>}</>}<div className="acoes">{href && <Link className="botao botao--secundario" to={href}>Ver detalhes</Link>}{acao}</div></Cartao>
}

export function InicioCliente() {
  const [agora] = useState(() => Date.now())
  const estado = useLista(`/agendamentos/?data_inicio=${hoje()}`)
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Erro erro={estado.erro} tentar={estado.recarregar} />
  const proximos = itens(estado.dados).filter((a) => !['cancelado', 'concluido'].includes(a.status) && new Date(inicioDe(a)).getTime() >= agora).sort((a, b) => new Date(inicioDe(a)) - new Date(inicioDe(b)))
  const proximo = proximos[0]
  return <section className="pilha"><p className="sobretitulo">Seu momento de cuidado</p><h1>Olá! Vamos cuidar de você?</h1>{proximo ? <><h2>Seu próximo horário</h2><CartaoAgendamento agendamento={proximo} href={`/meus-horarios/${proximo.id}`} /></> : <Cartao><h2>Nenhum horário marcado</h2><p>Escolha um serviço e reserve seu próximo momento no salão.</p><Link className="botao botao--primario" to="/agendar">Agendar horário</Link></Cartao>}<div className="acoes"><Link className="botao botao--secundario" to="/meus-horarios">Ver horários e histórico</Link>{proximo && <Link className="botao botao--primario" to="/agendar">Agendar outro horário</Link>}</div></section>
}

export function HorariosCliente() {
  const [aba, setAba] = useState('proximos')
  const [agora] = useState(() => Date.now())

  const caminho = aba === 'proximos'
  ? `/agendamentos/?data_inicio=${hoje()}`
  : '/agendamentos/?ordering=-inicio'

  const estado = useLista(caminho)
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Erro erro={estado.erro} tentar={estado.recarregar} />
  const todos = itens(estado.dados).sort((a, b) => new Date(inicioDe(b)) - new Date(inicioDe(a)))
  const lista = todos.filter((a) => aba === 'proximos' ? !['cancelado', 'concluido'].includes(a.status) && new Date(inicioDe(a)).getTime() >= agora : ['cancelado', 'concluido'].includes(a.status) || new Date(inicioDe(a)).getTime() < agora)
  return <section className="pilha"><p className="sobretitulo">Acompanhamento</p><h1>Meus horários</h1><div className="acoes"><Botao variante={aba === 'proximos' ? 'primario' : 'secundario'} onClick={() => setAba('proximos')}>Próximos horários</Botao><Botao variante={aba === 'historico' ? 'primario' : 'secundario'} onClick={() => setAba('historico')}>Histórico</Botao></div>{lista.length ? <div className="grade-componentes">{lista.map((a) => <CartaoAgendamento key={a.id} agendamento={a} href={`/meus-horarios/${a.id}`} />)}</div> : <Estado titulo={aba === 'proximos' ? 'Você não tem próximos horários' : 'Seu histórico está vazio'}>{aba === 'proximos' && <Link to="/agendar">Agendar um horário</Link>}</Estado>}</section>
}

function useAgendamento(id) {
  return useConsulta(`/agendamentos/${id}/`)
}

export function DetalheCliente() {
  const { id } = useParams(); const estado = useAgendamento(id); const { api, pode } = useAuth(); const [confirma, setConfirma] = useState(false); const [enviando, setEnviando] = useState(false); const [erro, setErro] = useState(null); const [mensagem, setMensagem] = useState('')
  const [agora] = useState(() => Date.now())
  async function cancelar() { setEnviando(true); setErro(null); try { await api(`/agendamentos/${id}/cancelar/`, { method: 'POST' }); setMensagem('Agendamento cancelado.'); setConfirma(false); estado.recarregar() } catch (falha) { setErro(falha) } finally { setEnviando(false) } }
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Erro erro={estado.erro} tentar={estado.recarregar} />
  const a = estado.dados; const podeCancelar = pode('api.cancelar_agendamento') && ['solicitado', 'confirmado'].includes(a.status) && new Date(inicioDe(a)).getTime() > agora
  return <section className="pagina-formulario pilha"><p className="sobretitulo">Meus horários</p><h1>Detalhes do agendamento</h1><Cartao><StatusAgendamento status={a.status} /><dl className="resumo-agendamento"><div><dt>Serviço</dt><dd>{servicoDe(a)}</dd></div><div><dt>Profissional</dt><dd>{profissionalDe(a)}</dd></div><div><dt>Quando</dt><dd>{dataHora(inicioDe(a))}</dd></div><div><dt>Duração</dt><dd>{duracaoDe(a)}</dd></div><div><dt>Observações</dt><dd>{a.observacoes || 'Nenhuma'}</dd></div></dl>{a.nota && <><h2>Sua avaliação</h2><ResumoAvaliacao avaliacao={{ nota: a.nota, comentario: a.comentario }} /></>}{mensagem && <p className="mensagem" role="status">{mensagem}</p>}{erro && <p className="campo-erro" role="alert">{erro.message}</p>}{confirma ? <div className="acoes"><Botao variante="perigo" carregando={enviando} onClick={cancelar}>Confirmar cancelamento</Botao><Botao variante="secundario" disabled={enviando} onClick={() => setConfirma(false)}>Manter agendamento</Botao></div> : podeCancelar && <Botao variante="perigo" onClick={() => setConfirma(true)}>Cancelar agendamento</Botao>}{pode('api.avaliar_agendamento') && a.status === 'concluido' && !a.nota && <LinkBotao to={`/meus-horarios/${id}/avaliar`}>Avaliar atendimento</LinkBotao>}</Cartao><Link to="/meus-horarios">Voltar aos meus horários</Link></section>
}

export function AgendaAdministrador() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(params.get('data') || hoje());
  const [status, setStatus] = useState(params.get('status') || '');
  const [recurso, setRecurso] = useState(params.get('recurso') || '');
  const estado = useLista(`/agendamentos/?data_inicio=${data}&data_fim=${data}${recurso ? `&recurso=${recurso}` : ''}`);
  const profissionais = useLista('/recursos/?ativo=true');
  const filtrados = useMemo(() => itens(estado.dados).filter((a) => (!status || a.status === status) && (!recurso || String(a.recurso?.id ?? a.recurso ?? a.recurso_id) === recurso)).sort((a, b) => new Date(inicioDe(a)) - new Date(inicioDe(b))), [estado.dados, status, recurso])
  function filtrar() { setParams({ ...(data ? { data } : {}), ...(status ? { status } : {}), ...(recurso ? { recurso } : {}) }) }
  if (estado.carregando || profissionais.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Erro erro={estado.erro} tentar={estado.recarregar} />
  if (profissionais.erro) return <Erro erro={profissionais.erro} tentar={profissionais.recarregar} />
  return <section className="pilha"><p className="sobretitulo">Administração</p><h1>Agenda do dia</h1><form className="filtros-agenda" onSubmit={(e) => { e.preventDefault(); filtrar() }}><div className="campo"><label htmlFor="agenda-data">Data</label><input id="agenda-data" type="date" value={data} onChange={(e) => setData(e.target.value)} /></div><div className="campo"><label htmlFor="agenda-status">Status</label><select id="agenda-status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option><option value="solicitado">Solicitado</option><option value="confirmado">Confirmado</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option></select></div><div className="campo"><label htmlFor="agenda-profissional">Profissional</label><select id="agenda-profissional" value={recurso} onChange={(e) => setRecurso(e.target.value)}><option value="">Todas</option>{itens(profissionais.dados).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div><Botao type="submit">Aplicar filtros</Botao></form>{filtrados.length ? <div className="grade-componentes">{filtrados.map((a) => <CartaoAgendamento key={a.id} agendamento={a} href={`/admin/agendamentos/${a.id}`} exibirCliente />)}</div> : <Estado titulo="Nenhum agendamento para estes filtros" />}</section>
}

export function PedidosAdministrador() {
  const estado = useLista('/agendamentos/?status=solicitado'); const { api, pode } = useAuth(); const [erro, setErro] = useState(null); const [ocupado, setOcupado] = useState(null)
  async function atualizar(a, acao) { setErro(null); setOcupado(a.id); try { await api(`/agendamentos/${a.id}/${acao}/`, { method: 'POST' }); estado.recarregar() } catch (falha) { setErro(falha) } finally { setOcupado(null) } }
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Erro erro={estado.erro} tentar={estado.recarregar} />
  const pedidos = itens(estado.dados).sort((a, b) => new Date(inicioDe(a)) - new Date(inicioDe(b)))
  return <section className="pilha"><p className="sobretitulo">Administração</p><h1>A confirmar</h1>{erro && <p className="campo-erro" role="alert">{erro.message}</p>}{pedidos.length ? <div className="grade-componentes">{pedidos.map((a) => <CartaoAgendamento key={a.id} agendamento={a} href={`/admin/agendamentos/${a.id}`} exibirCliente acao={<>{pode('api.confirmar_agendamento') && <Botao disabled={ocupado === a.id} onClick={() => atualizar(a, 'confirmar')}>Confirmar</Botao>}{pode('api.cancelar_agendamento') && <Botao variante="perigo" disabled={ocupado === a.id} onClick={() => atualizar(a, 'cancelar')}>Cancelar</Botao>}</>} />)}</div> : <Estado titulo="Nenhum pedido aguardando confirmação" />}</section>
}

export function DetalheAdministrador() {
  const { id } = useParams(); const estado = useAgendamento(id); const { api, pode } = useAuth(); const navigate = useNavigate(); const [erro, setErro] = useState(null); const [ocupado, setOcupado] = useState(false)
  async function atualizar(acao) { setErro(null); setOcupado(true); try { await api(`/agendamentos/${id}/${acao}/`, { method: 'POST' }); estado.recarregar() } catch (falha) { setErro(falha) } finally { setOcupado(false) } }
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Erro erro={estado.erro} tentar={estado.recarregar} />
  const a = estado.dados
  return <section className="pagina-formulario pilha"><p className="sobretitulo">Administração</p><h1>Detalhes do atendimento</h1><Cartao><StatusAgendamento status={a.status} /><dl className="resumo-agendamento"><div><dt>Cliente</dt><dd>{valor(a.cliente, 'nome') || valor(a.usuario, 'nome') || a.cliente_nome || 'Cliente'}</dd></div><div><dt>Serviço</dt><dd>{servicoDe(a)}</dd></div><div><dt>Profissional</dt><dd>{profissionalDe(a)}</dd></div><div><dt>Quando</dt><dd>{dataHora(inicioDe(a))}</dd></div><div><dt>Observações</dt><dd>{a.observacoes || 'Nenhuma'}</dd></div></dl>{a.nota && <><h2>Avaliação</h2><ResumoAvaliacao avaliacao={{ nota: a.nota, comentario: a.comentario }} /></>}{erro && <p className="campo-erro" role="alert">{erro.message}</p>}<div className="acoes">{a.status === 'solicitado' && <>{pode('api.confirmar_agendamento') && <Botao disabled={ocupado} onClick={() => atualizar('confirmar')}>Confirmar pedido</Botao>}{pode('api.cancelar_agendamento') && <Botao variante="perigo" disabled={ocupado} onClick={() => atualizar('cancelar')}>Cancelar pedido</Botao>}</>}{a.status === 'confirmado' && <>{pode('api.concluir_agendamento') && <Botao disabled={ocupado} onClick={() => atualizar('concluir')}>Concluir atendimento</Botao>}{pode('api.cancelar_agendamento') && <Botao variante="perigo" disabled={ocupado} onClick={() => atualizar('cancelar')}>Cancelar agendamento</Botao>}</>}</div></Cartao><Botao variante="secundario" onClick={() => navigate(-1)}>Voltar</Botao></section>
}
