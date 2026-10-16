import { API_URL } from './config.js'
import { criarErroApi } from './erros.js'

// body recebe um objeto JSON ou FormData; token recebe o access, sem "Bearer".
export async function api(caminho, { method = 'GET', body, token } = {}) {
  const base = new URL(`${API_URL}/`)
  // Aceita endpoints relativos e o link absoluto "next" das listas paginadas.
  const url = new URL(caminho.startsWith('/') ? `.${caminho}` : caminho, base)

  // Nunca enviar o token para outra origem ou para fora do caminho da API.
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || url.username || url.password) {
    throw new Error('O endereço deve pertencer à API configurada.')
  }

  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let corpo = body
  // Com FormData, o navegador define o Content-Type necessário para o upload.
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    corpo = JSON.stringify(body)
  }

  let resposta
  let texto
  try {
    resposta = await fetch(url, { method, headers, body: corpo, redirect: 'error' })
    texto = await resposta.text()
  } catch {
    throw criarErroApi(0)
  }

  let dados = null
  if (texto.trim()) {
    try {
      dados = JSON.parse(texto)
    } catch {
      // Uma página HTML de erro não deve aparecer como mensagem para o usuário.
      if (resposta.ok) {
        throw criarErroApi(resposta.status, null, 'A API retornou uma resposta inválida. Tente de novo.')
      }
    }
  }

  if (!resposta.ok) {
    // A sessão trata 401 e renovação; a página decide a navegação em 404.
    throw criarErroApi(resposta.status, dados)
  }

  // Inclui respostas 204 de exclusão. Listas mantêm count, next, previous e results.
  return dados
}
