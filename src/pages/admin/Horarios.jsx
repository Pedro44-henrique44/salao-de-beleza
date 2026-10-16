import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../AuthContext'
import Botao, { LinkBotao } from '../../components/Botao'
import Campo from '../../components/Campo'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'

const dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
const vazio = { dia_semana: 0, hora_inicio: '', hora_fim: '' }

export default function Horarios() {
  const { id } = useParams()
  const { api, pode } = useAuth()
  const navigate = useNavigate()
  const [profissional, setProfissional] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [formulario, setFormulario] = useState(vazio)
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState(null)
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [excluir, setExcluir] = useState(null)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErroCarga(null)
      try {
        const pessoa = await api(`/recursos/${id}/`)
        let proxima = `/disponibilidades/?recurso=${id}`
        const faixas = []
        while (proxima) {
          const pagina = await api(proxima)
          faixas.push(...pagina.results)
          proxima = pagina.next
        }
        if (ativo) { setProfissional(pessoa); setHorarios(faixas) }
      } catch (falha) {
        if (ativo && falha.status === 404) navigate('/admin/profissionais', { replace: true, state: { mensagem: 'Profissional não encontrada.' } })
        else if (ativo) setErroCarga(falha)
      } finally { if (ativo) setCarregando(false) }
    }
    carregar()
    return () => { ativo = false }
  }, [api, id, navigate, tentativa])

  function alterar(campo, valor) { setFormulario((atual) => ({ ...atual, [campo]: valor })) }
  async function salvar(event) {
    event.preventDefault()
    if (enviando) return
    setErro(null)
    setMensagem('')
    if (formulario.hora_fim <= formulario.hora_inicio) {
      setErro({ message: 'O fim deve ser depois do início.', campos: { hora_fim: 'Escolha um horário após o início.' } })
      return
    }
    setEnviando(true)
    try {
      const dados = { recurso: Number(id), dia_semana: Number(formulario.dia_semana), hora_inicio: formulario.hora_inicio, hora_fim: formulario.hora_fim }
      const atualizado = await api(`/disponibilidades/${formulario.id ? `${formulario.id}/` : ''}`, { method: formulario.id ? 'PATCH' : 'POST', body: dados })
      setHorarios((atuais) => formulario.id ? atuais.map((item) => item.id === atualizado.id ? atualizado : item) : [...atuais, atualizado])
      setFormulario(vazio)
      setMensagem('Horário salvo.')
    } catch (falha) {
      if (falha.status === 404) {
        setFormulario(vazio)
        setMensagem('Horário não encontrado. A lista foi atualizada.')
        setTentativa((valor) => valor + 1)
      } else setErro(falha)
    } finally { setEnviando(false) }
  }

  async function remover() {
    if (enviando) return
    setEnviando(true)
    setErro(null)
    setMensagem('')
    try {
      await api(`/disponibilidades/${excluir.id}/`, { method: 'DELETE' })
      setHorarios((atuais) => atuais.filter((item) => item.id !== excluir.id))
      if (formulario.id === excluir.id) setFormulario(vazio)
      setExcluir(null)
      setMensagem('Horário removido.')
    } catch (falha) {
      if (falha.status === 404) {
        setExcluir(null)
        setFormulario(vazio)
        setMensagem('Horário não encontrado. A lista foi atualizada.')
        setTentativa((valor) => valor + 1)
      } else setErro(falha)
    } finally { setEnviando(false) }
  }

  if (carregando) return <Estado tipo="carregando" />
  if (erroCarga) return <Estado tipo="erro" aoTentarNovamente={() => setTentativa(tentativa + 1)}>{erroCarga.message}</Estado>
  const podeSalvar = pode(`api.${formulario.id ? 'change' : 'add'}_disponibilidade`)
  return <section className="pilha">
    <h1>Horários de {profissional?.nome}</h1>
    <div className="acoes"><LinkBotao to="/admin/profissionais" variante="secundario">Voltar às profissionais</LinkBotao></div>
    {mensagem && <p className="mensagem" role="status">{mensagem}</p>}
    {erro && <Estado tipo="erro" titulo="Não foi possível concluir">{erro.message}</Estado>}
    {!horarios.length && <Estado titulo="Sem horários: ninguém consegue agendar" />}
    <div className="grade-componentes">
      {dias.map((dia, indice) => <Cartao key={dia}>
        <h2>{dia}</h2>
        <div className="pilha">
          {!horarios.some((item) => item.dia_semana === indice) && <p className="texto-suave">Sem atendimento</p>}
          {horarios.filter((item) => item.dia_semana === indice).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)).map((item) => <div key={item.id}>
            <p>{item.hora_inicio.slice(0, 5)} – {item.hora_fim.slice(0, 5)}</p>
            <div className="acoes">
              {pode('api.change_disponibilidade') && <Botao variante="secundario" disabled={enviando || !!excluir} onClick={() => { setFormulario({ ...item, hora_inicio: item.hora_inicio.slice(0, 5), hora_fim: item.hora_fim.slice(0, 5) }); setErro(null); document.getElementById('horario-dia')?.focus() }}>Editar<span className="somente-leitor"> {dia} às {item.hora_inicio.slice(0, 5)}</span></Botao>}
              {pode('api.delete_disponibilidade') && <Botao variante="secundario" disabled={enviando || !!excluir} onClick={() => { setExcluir(item); setErro(null) }}>Remover<span className="somente-leitor"> {dia} às {item.hora_inicio.slice(0, 5)}</span></Botao>}
            </div>
          </div>)}
        </div>
      </Cartao>)}
    </div>
    {excluir && <Cartao><div className="pilha" role="group" aria-label="Confirmar remoção">
      <p>Remover {dias[excluir.dia_semana]}, das {excluir.hora_inicio.slice(0, 5)} às {excluir.hora_fim.slice(0, 5)}?</p>
      <div className="acoes"><Botao variante="perigo" carregando={enviando} onClick={remover}>Confirmar remoção</Botao><Botao variante="secundario" disabled={enviando} onClick={() => setExcluir(null)}>Manter horário</Botao></div>
    </div></Cartao>}
    {podeSalvar && <Cartao><h2>{formulario.id ? 'Editar faixa de horário' : 'Adicionar faixa de horário'}</h2>
      <form className="pilha" onSubmit={salvar} aria-busy={enviando}>
        <Campo as="select" id="horario-dia" label="Dia da semana" value={formulario.dia_semana} disabled={enviando || !!excluir} erro={erro?.campos?.dia_semana} onChange={(e) => alterar('dia_semana', Number(e.target.value))}>{dias.map((dia, indice) => <option key={dia} value={indice}>{dia}</option>)}</Campo>
        <div className="grade-componentes">
          <Campo id="horario-inicio" label="Início" type="time" required value={formulario.hora_inicio} disabled={enviando || !!excluir} erro={erro?.campos?.hora_inicio} onChange={(e) => alterar('hora_inicio', e.target.value)} />
          <Campo id="horario-fim" label="Fim" type="time" required value={formulario.hora_fim} disabled={enviando || !!excluir} erro={erro?.campos?.hora_fim} onChange={(e) => alterar('hora_fim', e.target.value)} />
        </div>
        <div className="acoes"><Botao type="submit" carregando={enviando} disabled={!!excluir}>Salvar horário</Botao>{formulario.id && <Botao variante="secundario" disabled={enviando} onClick={() => { setFormulario(vazio); setErro(null) }}>Cancelar edição</Botao>}</div>
      </form>
    </Cartao>}
  </section>
}
