import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../AuthContext'
import Botao, { LinkBotao } from '../../components/Botao'
import Campo from '../../components/Campo'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'
import ImagemFormulario from '../../components/ImagemFormulario'

// Os três cadastros compartilham nome, texto, imagem e a mesma forma de salvar.
export default function FormularioCadastro({ tipo }) {
  const { id } = useParams()
  const { api, pode, salvarOrganizacao } = useAuth()
  const navigate = useNavigate()
  const negocio = tipo === 'negocio'
  const servico = tipo === 'servico'
  const endpoint = negocio ? '/organizacao/' : servico ? '/servicos/' : '/recursos/'
  const lista = servico ? '/admin/servicos' : '/admin/profissionais'
  const imagem = negocio ? 'logo' : servico ? 'imagem' : 'foto'
  const texto = tipo === 'recurso' ? 'bio' : 'descricao'
  const [dados, setDados] = useState(null)
  const [profissionais, setProfissionais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const [erro, setErro] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [remover, setRemover] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [versaoImagem, setVersaoImagem] = useState(0)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErroCarga(null)
      try {
        const inicial = negocio || id ? await api(`${endpoint}${id ? `${id}/` : ''}`) : {
          nome: '', bio: '', descricao: '', capacidade: 1, ativo: true,
          duracao_min: 30, preco: '', recursos: [],
        }
        const pessoas = []
        if (servico) {
          let proxima = '/recursos/'
          while (proxima) {
            const pagina = await api(proxima)
            pessoas.push(...pagina.results)
            proxima = pagina.next
          }
        }
        if (ativo) { setDados(inicial); setProfissionais(pessoas) }
      } catch (falha) {
        if (ativo && falha.status === 404 && !negocio) navigate(lista, { replace: true, state: { mensagem: 'Não encontrado.' } })
        else if (ativo) setErroCarga(falha)
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [api, endpoint, id, negocio, servico, lista, navigate, tentativa])

  const podeSalvar = pode(`api.${negocio || id || dados?.id ? 'change' : 'add'}_${negocio ? 'organizacao' : tipo}`)
  function alterar(campo, valor) { setDados((atual) => ({ ...atual, [campo]: valor })) }

  async function salvar(event) {
    event.preventDefault()
    if (enviando || !podeSalvar) return
    setEnviando(true)
    setErro(null)
    setMensagem('')
    const registroId = dados.id || id
    const caminho = `${endpoint}${!negocio && registroId ? `${registroId}/` : ''}`
    const method = negocio || registroId ? 'PATCH' : 'POST'
    let cadastroSalvo = false
    try {
      const campos = { nome: dados.nome.trim(), [texto]: dados[texto] || '' }
      if (!negocio) campos.ativo = dados.ativo
      if (tipo === 'recurso') campos.capacidade = Number(dados.capacidade)
      if (servico) {
        campos.duracao_min = Number(dados.duracao_min)
        campos.preco = dados.preco
        campos.recursos = dados.recursos
      }
      let atualizado
      if (servico) {
        // JSON preserva a lista vazia ao remover todas as profissionais.
        if (remover) campos.imagem = null
        atualizado = await api(caminho, { method, body: campos })
        cadastroSalvo = true
        setDados(atualizado)
        if (arquivo) {
          const upload = new FormData()
          upload.append('imagem', arquivo)
          atualizado = await api(`${endpoint}${atualizado.id}/`, { method: 'PATCH', body: upload })
        }
      } else {
        const corpo = new FormData()
        Object.entries(campos).forEach(([campo, valor]) => corpo.append(campo, valor))
        if (arquivo) corpo.append(imagem, arquivo)
        else if (remover) corpo.append(imagem, '')
        atualizado = negocio
          ? await salvarOrganizacao(corpo)
          : await api(caminho, { method, body: corpo })
      }
      setDados(atualizado)
      setArquivo(null)
      setRemover(false)
      setVersaoImagem((valor) => valor + 1)
      if (negocio) setMensagem('Dados do salão atualizados.')
      else navigate(lista, { state: { mensagem: servico ? 'Serviço salvo.' : 'Profissional salva.' } })
    } catch (falha) {
      if (cadastroSalvo) setMensagem('O serviço foi salvo, mas a imagem não foi enviada. Tente salvar novamente para reenviar a imagem.')
      if (falha.status === 404 && !negocio && !cadastroSalvo) navigate(lista, { replace: true, state: { mensagem: 'Não encontrado.' } })
      else setErro(falha)
    } finally { setEnviando(false) }
  }

  if (carregando) return <Estado tipo="carregando" />
  if (erroCarga) return <Estado tipo="erro" aoTentarNovamente={() => setTentativa(tentativa + 1)}>{erroCarga.message}</Estado>
  if (!dados) return null
  const bloqueado = enviando || !podeSalvar
  return <section className="pagina-formulario pilha">
    <h1>{negocio ? 'Dados do negócio' : servico ? (id ? 'Editar serviço' : 'Novo serviço') : (id ? 'Editar profissional' : 'Nova profissional')}</h1>
    <Cartao><form className="pilha" onSubmit={salvar} aria-busy={enviando}>
      {mensagem && <p className="mensagem" role="status">{mensagem}</p>}
      {erro && <Estado tipo="erro" titulo="Não foi possível concluir">{erro.message}</Estado>}
      {!podeSalvar && <p role="status">Você não tem permissão para salvar este cadastro.</p>}
      <Campo id="cadastro-nome" label="Nome" required pattern=".*\S.*" maxLength={100} value={dados.nome} disabled={bloqueado} erro={erro?.campos?.nome} onChange={(e) => alterar('nome', e.target.value)} />
      <Campo as="textarea" id="cadastro-texto" label={tipo === 'recurso' ? 'Sobre a profissional' : 'Descrição'} rows={4} value={dados[texto] || ''} disabled={bloqueado} erro={erro?.campos?.[texto]} onChange={(e) => alterar(texto, e.target.value)} />
      <ImagemFormulario key={versaoImagem} nome={imagem} atual={dados[imagem]} arquivo={arquivo} remover={remover} disabled={bloqueado} erro={erro?.campos?.[imagem]} onChange={(file, retirar) => { setArquivo(file); setRemover(retirar) }} />
      {tipo === 'recurso' && <Campo id="cadastro-capacidade" label="Capacidade" ajuda="Quantidade de atendimentos simultâneos." type="number" min="1" max="2147483647" step="1" required value={dados.capacidade} disabled={bloqueado} erro={erro?.campos?.capacidade} onChange={(e) => alterar('capacidade', e.target.value)} />}
      {servico && <>
        <Campo id="cadastro-duracao" label="Duração (minutos)" type="number" min="1" max="2147483647" step="1" required value={dados.duracao_min} disabled={bloqueado} erro={erro?.campos?.duracao_min} onChange={(e) => alterar('duracao_min', e.target.value)} />
        <Campo id="cadastro-preco" label="Preço (R$)" type="number" min="0" max="99999999.99" step="0.01" required value={dados.preco} disabled={bloqueado} erro={erro?.campos?.preco} onChange={(e) => alterar('preco', e.target.value)} />
        <fieldset className="pilha selecao-profissionais" disabled={bloqueado} aria-describedby={erro?.campos?.recursos ? 'recursos-erro' : undefined}>
          <legend>Profissionais que realizam o serviço</legend>
          {!profissionais.length && <p>Cadastre uma profissional para vinculá-la a este serviço.</p>}
          {profissionais.map((pessoa) => <label className="opcao" key={pessoa.id}>
            <input type="checkbox" checked={dados.recursos.includes(pessoa.id)} onChange={(e) => alterar('recursos', e.target.checked ? [...dados.recursos, pessoa.id] : dados.recursos.filter((valor) => valor !== pessoa.id))} />
            {pessoa.nome}{!pessoa.ativo && ' (inativa)'}
          </label>)}
          {erro?.campos?.recursos && <small id="recursos-erro" className="campo-erro">{erro.campos.recursos}</small>}
        </fieldset>
      </>}
      {!negocio && <div><label className="opcao"><input type="checkbox" checked={dados.ativo} disabled={bloqueado} onChange={(e) => alterar('ativo', e.target.checked)} />{servico ? 'Serviço ativo' : 'Profissional ativa'}</label>
        {erro?.campos?.ativo && <small className="campo-erro" role="alert">{erro.campos.ativo}</small>}
      </div>}
      <div className="acoes">
        {podeSalvar && <Botao type="submit" carregando={enviando}>Salvar</Botao>}
        {!negocio && <LinkBotao to={lista} variante="secundario">Voltar à lista</LinkBotao>}
        {tipo === 'recurso' && id && <LinkBotao to={`/admin/profissionais/${id}/horarios`} variante="secundario">Horários</LinkBotao>}
      </div>
    </form></Cartao>
  </section>
}
