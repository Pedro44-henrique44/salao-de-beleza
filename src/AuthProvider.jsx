import { startTransition, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from './AuthContext'
import { api } from './api/client'
import { criarSessao } from './api/sessao'
import { inicioDoUsuario, temPermissao } from './permissoes'

export default function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [sessao] = useState(() => criarSessao(api, {
    getItem: (chave) => localStorage.getItem(chave),
    setItem: (chave, valor) => localStorage.setItem(chave, valor),
    removeItem: (chave) => localStorage.removeItem(chave),
  }, () => {
    setUsuario(null)
    setErro(null)
    setAviso('Sua sessão terminou. Entre novamente.')
  }))

  useEffect(() => {
    let ativo = true
    async function restaurar() {
      setCarregando(true)
      setErro(null)
      try {
        if (sessao.temTokens()) {
          const dados = await sessao.api('/auth/eu/')
          if (ativo) setUsuario(dados)
        }
      } catch (falha) {
        if (ativo && sessao.temTokens()) setErro(falha)
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    restaurar()
    return () => { ativo = false }
  }, [sessao, tentativa])

  async function entrar(email, senha) {
    const dados = await sessao.entrar(email, senha)
    setUsuario(dados)
    setAviso('')
    setErro(null)
    return dados
  }

  function sair() {
    sessao.sair()
    // Atualizar a sessão e a rota juntas evita um desvio intermediário ao login.
    startTransition(() => {
      setUsuario(null)
      setErro(null)
      setAviso('')
      navigate('/', { replace: true })
    })
  }

  async function salvarPerfil(dados) {
    const atualizado = await sessao.api('/auth/eu/', { method: 'PATCH', body: dados })
    setUsuario(atualizado)
    return atualizado
  }

  return (
    <AuthContext.Provider value={{
      usuario, carregando, erro, aviso, entrar, sair, salvarPerfil,
      api: sessao.api,
      inicio: inicioDoUsuario(usuario),
      pode: (permissao) => temPermissao(usuario, permissao),
      tentarNovamente: () => setTentativa((valor) => valor + 1),
    }}>
      {children}
    </AuthContext.Provider>
  )
}
