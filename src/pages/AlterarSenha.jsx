import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../AuthContext'
import Botao, { LinkBotao } from '../components/Botao'
import Campo from '../components/Campo'
import Cartao from '../components/Cartao'
import Estado from '../components/Estado'

export default function AlterarSenha() {
  const { api } = useAuth()
  const navigate = useNavigate()
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  async function enviar(event) {
    event.preventDefault()
    if (enviando) return
    if (nova !== confirmacao) {
      setErro({ message: 'Confira a confirmação da nova senha.', campos: { confirmacao: 'As senhas não coincidem.' } })
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      await api('/auth/alterar-senha/', { method: 'POST', body: { senha_atual: atual, nova_senha: nova } })
      navigate('/perfil', { replace: true, state: { mensagem: 'Senha alterada' } })
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="pagina-formulario">
      <h1>Alterar senha</h1>
      <Cartao>
        <form className="pilha" onSubmit={enviar} aria-busy={enviando}>
          {erro && <Estado tipo="erro" titulo="Não foi possível alterar a senha">{erro.message}</Estado>}
          <Campo id="senha-atual" label="Senha atual" type="password" autoComplete="current-password" required value={atual} onChange={(e) => setAtual(e.target.value)} disabled={enviando} erro={erro?.campos?.senha_atual} />
          <Campo id="senha-nova" label="Nova senha" type="password" autoComplete="new-password" required value={nova} onChange={(e) => setNova(e.target.value)} disabled={enviando} erro={erro?.campos?.nova_senha} />
          <Campo id="senha-confirmacao" label="Confirme a nova senha" type="password" autoComplete="new-password" required value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} disabled={enviando} erro={erro?.campos?.confirmacao} />
          <div className="acoes">
            <Botao type="submit" carregando={enviando}>{erro ? 'Tentar de novo' : 'Salvar'}</Botao>
            <LinkBotao to="/perfil" variante="secundario">Cancelar</LinkBotao>
          </div>
        </form>
      </Cartao>
    </section>
  )
}
