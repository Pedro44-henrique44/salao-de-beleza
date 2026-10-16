import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../AuthContext'
import Botao, { LinkBotao } from '../components/Botao'
import Campo from '../components/Campo'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'

export default function Perfil() {
  const { usuario, salvarPerfil, sair } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const arquivo = useRef(null)
  const [nome, setNome] = useState(usuario.nome)
  const [foto, setFoto] = useState(null)
  const [removerFoto, setRemoverFoto] = useState(false)
  const [previa, setPrevia] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [mensagem, setMensagem] = useState(location.state?.mensagem || '')

  useEffect(() => {
    return () => { if (previa) URL.revokeObjectURL(previa) }
  }, [previa])

  useEffect(() => {
    if (location.state?.mensagem) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  async function enviar(event) {
    event.preventDefault()
    if (enviando) return
    setEnviando(true)
    setErro(null)
    setMensagem('')
    const dados = new FormData()
    dados.append('nome', nome.trim())
    if (foto) dados.append('foto', foto)
    else if (removerFoto) dados.append('foto', '')
    try {
      const atualizado = await salvarPerfil(dados)
      setNome(atualizado.nome)
      setFoto(null)
      setPrevia('')
      setRemoverFoto(false)
      if (arquivo.current) arquivo.current.value = ''
      setMensagem('Perfil atualizado.')
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  const fotoExibida = removerFoto ? '' : previa || usuario.foto

  return (
    <section className="pagina-formulario">
      <h1>Meu perfil</h1>
      <p className="texto-suave">{usuario.organizacao?.nome}</p>
      <Cartao>
        <form className="pilha" onSubmit={enviar} aria-busy={enviando}>
          {mensagem && <p className="mensagem" role="status">{mensagem}</p>}
          {erro && <Estado tipo="erro" titulo="Não foi possível salvar o perfil">{erro.message}</Estado>}
          <div className="perfil-foto">
            {fotoExibida ? <img src={fotoExibida} alt="Sua foto de perfil" width="112" height="112" /> : <span className="perfil-sem-foto">Sem foto</span>}
            <Botao variante="secundario" disabled={enviando || !fotoExibida} onClick={() => {
              setFoto(null)
              setPrevia('')
              setRemoverFoto(true)
              if (arquivo.current) arquivo.current.value = ''
            }}>Remover foto</Botao>
          </div>
          <Campo id="perfil-foto" label="Trocar foto" type="file" accept="image/*" ref={arquivo} disabled={enviando} erro={erro?.campos?.foto} ajuda="Escolha uma imagem e clique em Salvar. A remoção também é aplicada ao salvar." onChange={(e) => {
            const selecionada = e.target.files[0] || null
            setFoto(selecionada)
            setPrevia(selecionada ? URL.createObjectURL(selecionada) : '')
            setRemoverFoto(false)
          }} />
          <Campo id="perfil-nome" label="Nome" autoComplete="name" required pattern=".*\S.*" value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} erro={erro?.campos?.nome} />
          <Campo id="perfil-email" label="E-mail" type="email" value={usuario.email} readOnly ajuda="O e-mail da conta não pode ser alterado." />
          <div className="acoes">
            <Botao type="submit" carregando={enviando}>{erro ? 'Tentar de novo' : 'Salvar'}</Botao>
            <LinkBotao to="/perfil/alterar-senha" variante="secundario">Alterar senha</LinkBotao>
          </div>
        </form>
      </Cartao>
      <div className="acoes link-formulario"><Botao variante="secundario" onClick={sair}>Sair</Botao></div>
    </section>
  )
}
