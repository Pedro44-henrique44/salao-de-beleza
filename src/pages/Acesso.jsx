import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../AuthContext'
import { api } from '../api/client'
import { ORGANIZACAO_SLUG } from '../api/config'
import { inicioDoUsuario } from '../permissoes'
import Botao from '../components/Botao'
import Campo from '../components/Campo'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'

export default function Acesso({ cadastro = false }) {
  const { entrar, aviso } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [contaCriada, setContaCriada] = useState(false)

  async function enviar(event) {
    event.preventDefault()
    if (enviando) return
    setEnviando(true)
    setErro(null)
    let fazendoLogin = !cadastro || contaCriada
    try {
      if (!fazendoLogin) {
        await api('/auth/cadastro/', { method: 'POST', body: { nome: nome.trim(), email: email.trim(), senha, organizacao: ORGANIZACAO_SLUG } })
        setContaCriada(true)
        fazendoLogin = true
      }
      const usuario = await entrar(email.trim(), senha)
      navigate(inicioDoUsuario(usuario), { replace: true })
    } catch (falha) {
      if (fazendoLogin && (falha.status === 400 || falha.status === 401)) falha.message = 'Organização, e-mail ou senha inválidos'
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="pagina-formulario">
      <p className="sobretitulo">Seu momento de cuidado</p>
      <h1>{cadastro ? 'Criar conta' : 'Entrar'}</h1>
      <p className="texto-suave">{cadastro ? 'Preencha seus dados para se cadastrar no salão.' : 'Acesse sua conta com e-mail e senha.'}</p>
      <Cartao>
        <form className="pilha" onSubmit={enviar} aria-busy={enviando}>
          {aviso && <p className="mensagem" role="status">{aviso}</p>}
          {contaCriada && <p className="mensagem" role="status">Conta criada. Se o acesso não foi concluído, tente entrar novamente abaixo.</p>}
          {erro && <Estado tipo="erro" titulo="Não foi possível entrar ou cadastrar">{erro.message}</Estado>}
          {cadastro && <Campo id="acesso-nome" label="Nome" autoComplete="name" required pattern=".*\S.*" value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando || contaCriada} erro={erro?.campos?.nome} />}
          <Campo id="acesso-email" label="E-mail" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} disabled={enviando || contaCriada} erro={erro?.campos?.email} />
          <Campo id="acesso-senha" label="Senha" type="password" autoComplete={cadastro && !contaCriada ? 'new-password' : 'current-password'} required value={senha} onChange={(e) => setSenha(e.target.value)} disabled={enviando} erro={erro?.campos?.senha} />
          <Botao type="submit" carregando={enviando}>{erro ? 'Tentar de novo' : cadastro && !contaCriada ? 'Criar conta' : 'Entrar'}</Botao>
          <div className="acoes">
            <Link to={cadastro ? '/login' : '/cadastro'}>{cadastro ? 'Já tenho conta' : 'Criar conta'}</Link>
            <Link to="/esqueci-minha-senha">Esqueci minha senha</Link>
          </div>
        </form>
      </Cartao>
    </section>
  )
}
