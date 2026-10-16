import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Botao from '../components/Botao'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'
import StatusAgendamento from '../components/StatusAgendamento'
import { useAuth } from '../AuthContext'
import useListaPaginada from '../hooks/useListaPaginada'

const CHAVE = 'agendamento-em-andamento'
const dataHoje = () => new Date().toISOString().slice(0, 10)
const lista = (dados) => Array.isArray(dados) ? dados : (dados?.results || [])
const campo = (item, ...nomes) => nomes.map((nome) => item?.[nome]).find((valor) => valor !== undefined && valor !== null)
const dinheiro = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const minutos = (valor) => valor ? `${valor} min` : ''

function useDados(api, caminho) {
  const [estado, setEstado] = useState({ caminho: '', carregando: true, dados: null, erro: null })
  useEffect(() => {
    let ativo = true
    api(caminho).then((dados) => ativo && setEstado({ caminho, carregando: false, dados, erro: null })).catch((erro) => ativo && setEstado({ caminho, carregando: false, dados: null, erro }))
    return () => { ativo = false }
  }, [api, caminho])
  return estado
}

function Cabecalho({ titulo, etapa }) {
  return <div className="admin-titulo acoes"><div><p className="sobretitulo">Agendamento · etapa {etapa} de 4</p><h1>{titulo}</h1></div></div>
}

export default function Agendamento() {
  const { api } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [selecao, setSelecao] = useState(() => {
    const anterior = JSON.parse(sessionStorage.getItem(CHAVE) || '{}')
    const profissional = location.state?.profissional
    return profissional
      ? { profissional }
      : anterior
  })
  const salvar = (dados) => { setSelecao(dados); sessionStorage.setItem(CHAVE, JSON.stringify(dados)) }
  const caminho = location.pathname

  if (caminho === '/agendar') return <EscolherServico api={api} navigate={navigate} selecao={selecao} salvar={salvar} />
  if (caminho === '/agendar/profissional') return <EscolherProfissional api={api} navigate={navigate} selecao={selecao} salvar={salvar} />
  if (caminho === '/agendar/horario') return <EscolherHorario api={api} navigate={navigate} selecao={selecao} salvar={salvar} />
  if (caminho === '/agendar/confirmar') return <Confirmar api={api} navigate={navigate} selecao={selecao} salvar={salvar} />
  return <Enviado navigate={navigate} selecao={selecao} />
}

function Falha({ estado }) { return estado.erro ? <Estado tipo="erro" titulo="Não foi possível carregar" aoTentarNovamente={() => window.location.reload()}>{estado.erro.message}</Estado> : null }

function EscolherServico({ navigate, selecao, salvar }) {
  const estado = useListaPaginada('/servicos/?ativo=true')
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Falha estado={estado} />
  const profissional = selecao.profissional
  const servicos = lista(estado.dados).filter((servico) => !profissional ||
    (servico.recursos || []).some((recurso) => String(recurso.id ?? recurso) === String(profissional.id)))
  return <section className="pagina-agendamento"><Cabecalho titulo="Escolha um serviço" etapa="1" />{selecao.profissional && <p className="mensagem">Agendando com {selecao.profissional.nome}. <Botao variante="secundario" onClick={() => salvar({})}>Escolher outra profissional</Botao></p>}{servicos.length ? <div className="grade-agendamento">{servicos.map((servico) => <Cartao className="cartao-servico" key={servico.id}><h2>{servico.nome}</h2><p className="texto-suave">{servico.descricao || 'Um cuidado pensado para você.'}</p><p><strong>{minutos(servico.duracao_min)}</strong> · <strong>{dinheiro(servico.preco)}</strong></p><Botao onClick={() => { salvar({ profissional, servico }); navigate(selecao.profissional ? '/agendar/horario' : '/agendar/profissional') }}>Escolher</Botao></Cartao>)}</div> : <Estado titulo="Nenhum serviço disponível" />}</section>
}

function EscolherProfissional({ api, navigate, selecao, salvar }) {
  const id = selecao.servico?.id
  const estado = useDados(api, `/recursos/?servicos=${id || ''}`)
  if (!id) { navigate('/agendar'); return null }
  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <Falha estado={estado} />
  const profissionais = lista(estado.dados)
  return <section className="pagina-agendamento"><Cabecalho titulo="Escolha a profissional" etapa="2" /><div className="acoes navegacao-etapa"><Botao variante="secundario" onClick={() => navigate('/agendar')}>Voltar</Botao></div>{profissionais.length ? <div className="grade-agendamento"><Cartao className="cartao-escolha"><h2>Qualquer uma</h2><p className="texto-suave">Encontre o primeiro horário disponível.</p><Botao onClick={() => { salvar({ ...selecao, profissional: null }); navigate('/agendar/horario') }}>Escolher</Botao></Cartao>{profissionais.map((profissional) => <Cartao className="cartao-escolha" key={profissional.id}><h2>{profissional.nome}</h2><p className="texto-suave">{profissional.bio || 'Profissional do salão'}</p><Botao onClick={() => { salvar({ ...selecao, profissional }); navigate('/agendar/horario') }}>Escolher</Botao></Cartao>)}</div> : <Estado titulo="Nenhuma profissional realiza este serviço" />}</section>
}

function EscolherHorario({ api, navigate, selecao, salvar }) {
  const [data, setData] = useState(selecao.data || dataHoje())
  const params = new URLSearchParams({ servico: selecao.servico?.id || '', data })
  if (selecao.profissional?.id) params.set('recurso', selecao.profissional.id)
  const estado = useDados(api, `/horarios-livres/?${params}`)
  if (!selecao.servico) { navigate('/agendar'); return null }
  const horarios = lista(estado.dados)
  const escolher = (horario) => { salvar({ ...selecao, data, horario, profissional: selecao.profissional || horario.recurso || horario.profissional }); navigate('/agendar/confirmar') }
  return <section className="pagina-agendamento"><Cabecalho titulo="Escolha o dia e horário" etapa="3" /><div className="campo campo-data"><label htmlFor="data-agendamento">Dia</label><input id="data-agendamento" type="date" min={dataHoje()} value={data} onChange={(evento) => setData(evento.target.value)} /></div>{estado.carregando ? <Estado tipo="carregando" /> : estado.erro ? <Falha estado={estado} /> : horarios.length ? <div className="grade-horarios">{horarios.map((horario, indice) => <Cartao key={horario.id || indice}><strong>{new Date(campo(horario, 'inicio', 'data_hora')).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong><p className="texto-suave">{campo(horario.recurso, 'nome') || campo(horario.profissional, 'nome') || selecao.profissional?.nome || 'Profissional disponível'}</p><Botao onClick={() => escolher(horario)}>Escolher</Botao></Cartao>)}</div> : <Estado titulo="Sem horários livres neste dia">Escolha outra data para encontrar um horário.</Estado>}<div className="acoes navegacao-etapa"><Botao variante="secundario" onClick={() => navigate('/agendar/profissional')}>Voltar</Botao></div></section>
}

function Confirmar({ api, navigate, selecao, salvar }) {
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState(null)
  const horario = selecao.horario || {}
  const inicio = campo(horario, 'inicio', 'data_hora') || `${selecao.data}T00:00:00`
  const profissional = selecao.profissional || horario.recurso || horario.profissional
  const resumo = useMemo(() => ({ servico: selecao.servico?.nome, profissional: profissional?.nome || 'A definir pelo salão', inicio: new Date(inicio).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }), preco: dinheiro(selecao.servico?.preco) }), [inicio, profissional, selecao.servico])
  async function confirmar() { setErro(null); try { const agendamento = await api('/agendamentos/', { method: 'POST', body: { servico: selecao.servico.id, ...(profissional?.id ? { recurso: profissional.id } : {}), inicio, observacoes } }); salvar({ ...selecao, agendamento }); navigate('/agendar/enviado') } catch (falha) { setErro(falha) } }
  return <section className="pagina-agendamento pagina-formulario"><Cabecalho titulo="Confirme seu agendamento" etapa="4" /><Cartao><dl className="resumo-agendamento"><div><dt>Serviço</dt><dd>{resumo.servico}</dd></div><div><dt>Profissional</dt><dd>{resumo.profissional}</dd></div><div><dt>Quando</dt><dd>{resumo.inicio}</dd></div><div><dt>Valor</dt><dd>{resumo.preco}</dd></div></dl><div className="campo"><label htmlFor="observacoes">Observações (opcional)</label><textarea id="observacoes" rows="4" value={observacoes} onChange={(evento) => setObservacoes(evento.target.value)} placeholder="Ex.: maquiagem para casamento às 16h" /></div>{erro && <p className="campo-erro" role="alert">{erro.message || 'Não foi possível confirmar este horário. Escolha outro.'}</p>}<div className="acoes"><Botao variante="secundario" onClick={() => navigate('/agendar/horario')}>Voltar</Botao><Botao onClick={confirmar}>Confirmar agendamento</Botao></div></Cartao></section>
}

function Enviado({ navigate, selecao }) {
  const agendamento = selecao.agendamento || {}
  return <section className="pagina-mensagem"><p className="sobretitulo">Tudo certo</p><h1>Agendamento enviado</h1><p>Seu pedido foi registrado e aguarda a confirmação do administrador.</p><Cartao><p><strong>{selecao.servico?.nome}</strong></p><p>{selecao.profissional?.nome || 'Profissional a definir'}<br />{new Date(campo(selecao.horario, 'inicio', 'data_hora') || agendamento.inicio || selecao.data).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p><StatusAgendamento status={agendamento.status || 'solicitado'} /></Cartao><div className="acoes"><Link className="botao botao--primario" to={`/meus-horarios/${agendamento.id || ''}`}>Ver horário</Link><Botao variante="secundario" onClick={() => { sessionStorage.removeItem(CHAVE); navigate('/inicio') }}>Início</Botao></div></section>
}
