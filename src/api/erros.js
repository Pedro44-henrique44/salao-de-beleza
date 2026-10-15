const mensagensPorStatus = {
  0: 'Não foi possível conectar à API. Verifique sua conexão e tente de novo.',
  400: 'Confira os campos informados.',
  401: 'Entre na sua conta para continuar.',
  403: 'Você não tem permissão para esta ação',
  404: 'Não encontrado',
  429: 'Muitas tentativas, aguarde um minuto',
}

function mensagemDoValor(valor) {
  if (typeof valor === 'string') return valor
  if (Array.isArray(valor)) return valor.join(' ')
  return ''
}

// As telas usam message no Estado e campos.nome, campos.email etc. no Campo.
export function criarErroApi(status, dados = null, mensagem = '') {
  const erro = new Error(mensagem || mensagensPorStatus[status] || 'Não foi possível concluir a solicitação. Tente de novo.')
  erro.status = status
  erro.dados = dados
  erro.campos = {}

  if (status === 400) {
    const geral = mensagemDoValor(dados?.detail) || mensagemDoValor(dados?.non_field_errors) || mensagemDoValor(dados)
    if (geral) erro.message = geral

    if (dados && typeof dados === 'object' && !Array.isArray(dados)) {
      for (const campo in dados) {
        if (campo !== 'detail' && campo !== 'non_field_errors') {
          erro.campos[campo] = mensagemDoValor(dados[campo])
        }
      }
    }
  }

  return erro
}
