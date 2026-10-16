import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
import { ORGANIZACAO_SLUG } from '../api/config'
import Botao from '../components/Botao'
import Campo from '../components/Campo'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'

export default function EsqueciMinhaSenha() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState(null)

  async function enviar(event) {
    event.preventDefault()
    if (enviando) return
    setEnviando(true)
    setErro(null)
    try {
      await api('/auth/redefinir-senha/', { method: 'POST', body: { email: email.trim(), organizacao: ORGANIZACAO_SLUG } })
      setEnviado(true)
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="pagina-formulario">
      <h1>Esqueci minha senha</h1>
      <p className="texto-suave">Enviaremos um link para você criar uma nova senha.</p>
      <Cartao>
        {enviado ? (
          <div className="pilha">
            <p className="mensagem" role="status">Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.</p>
            <p>O link vale por 1 hora e só pode ser usado uma vez. Depois de trocar a senha na página aberta pelo link, volte aqui para entrar.</p>
          </div>
        ) : (
          <form className="pilha" onSubmit={enviar} aria-busy={enviando}>
            {erro && <Estado tipo="erro" titulo="Não foi possível enviar o link">{erro.message}</Estado>}
            <Campo id="recuperar-email" label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={enviando} erro={erro?.campos?.email} />
            <Botao type="submit" carregando={enviando}>{erro ? 'Tentar de novo' : 'Enviar link'}</Botao>
          </form>
        )}
        <p className="link-formulario"><Link to="/login">Voltar para o login</Link></p>
      </Cartao>
    </section>
  )
}
