import { criarErroApi } from './erros.js'
import { ORGANIZACAO_SLUG } from './config.js'

export const CHAVE_SESSAO = 'salao-de-beleza:sessao'

// A sessão recebe o cliente HTTP para poder ser verificada sem acessar a API real.
export function criarSessao(requisicao, armazenamento, aoExpirar) {
  let tokens = null
  let versao = 0
  let renovacao = null

  try {
    const salvos = JSON.parse(armazenamento.getItem(CHAVE_SESSAO))
    if (typeof salvos?.access === 'string' && salvos.access && typeof salvos.refresh === 'string' && salvos.refresh) tokens = salvos
  } catch {
    // Dados inválidos no navegador são tratados como uma sessão encerrada.
  }

  function encerrar() {
    versao += 1
    tokens = null
    renovacao = null
    try { armazenamento.removeItem(CHAVE_SESSAO) } catch { /* A memória também é limpa. */ }
  }

  function conferirVersao(atual) {
    if (atual !== versao) throw criarErroApi(401)
  }

  function guardar(novos) {
    if (!novos?.access || !novos?.refresh) throw new Error('Não foi possível iniciar a sessão. Tente de novo.')
    try {
      armazenamento.setItem(CHAVE_SESSAO, JSON.stringify(novos))
    } catch {
      throw new Error('Permita o armazenamento neste navegador para manter sua sessão.')
    }
    tokens = novos
  }

  async function entrar(email, senha) {
    encerrar()
    const atual = versao
    const novos = await requisicao('/auth/login/', { method: 'POST', body: { email, senha, organizacao: ORGANIZACAO_SLUG } })
    conferirVersao(atual)
    const usuario = await requisicao('/auth/eu/', { token: novos.access })
    conferirVersao(atual)
    guardar(novos)
    return usuario
  }

  async function renovar(atual) {
    if (!renovacao) {
      const anteriores = tokens
      renovacao = (async () => {
        try {
          const novos = await requisicao('/auth/renovar/', { method: 'POST', body: { refresh: anteriores.refresh } })
          conferirVersao(atual)
          guardar({ access: novos.access, refresh: novos.refresh || anteriores.refresh })
        } catch (erro) {
          if (atual === versao) {
            encerrar()
            aoExpirar()
          }
          throw erro
        } finally {
          if (atual === versao) renovacao = null
        }
      })()
    }
    await renovacao
    conferirVersao(atual)
  }

  async function autenticada(caminho, opcoes = {}) {
    if (!tokens) throw criarErroApi(401)
    const atual = versao
    const access = tokens.access
    try {
      const resposta = await requisicao(caminho, { ...opcoes, token: access })
      conferirVersao(atual)
      return resposta
    } catch (erro) {
      conferirVersao(atual)
      if (erro.status !== 401) throw erro
    }

    // Requisições simultâneas compartilham uma renovação. Nunca repetir em loop.
    if (tokens.access === access) await renovar(atual)
    conferirVersao(atual)
    try {
      const resposta = await requisicao(caminho, { ...opcoes, token: tokens.access })
      conferirVersao(atual)
      return resposta
    } catch (erro) {
      if (atual === versao && erro.status === 401) {
        encerrar()
        aoExpirar()
      }
      throw erro
    }
  }

  return { entrar, sair: encerrar, api: autenticada, temTokens: () => Boolean(tokens) }
}
