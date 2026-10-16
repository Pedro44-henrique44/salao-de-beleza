import { useEffect, useState } from 'react'

export const CHAVE_AGENDAMENTO = 'agendamento-em-andamento'

export function dataHoje() {
  return new Date().toISOString().slice(0, 10)
}

export function listaDe(dados) {
  return Array.isArray(dados) ? dados : dados?.results || []
}

export function campoDe(item, ...nomes) {
  return nomes
    .map((nome) => item?.[nome])
    .find((valor) => valor !== undefined && valor !== null)
}

export function emReais(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function emMinutos(valor) {
  return valor ? `${valor} min` : ''
}

export function useDados(api, caminho) {
  const [estado, setEstado] = useState({
    caminho: '',
    carregando: true,
    dados: null,
    erro: null,
  })

  useEffect(() => {
    let ativo = true

    api(caminho)
      .then((dados) => {
        if (ativo) setEstado({ caminho, carregando: false, dados, erro: null })
      })
      .catch((erro) => {
        if (ativo) setEstado({ caminho, carregando: false, dados: null, erro })
      })

    return () => {
      ativo = false
    }
  }, [api, caminho])

  return estado
}
