import { useEffect, useState } from 'react'
import { useAuth } from '../../AuthContext'
import { listaDe } from './dados'

export function useListaAgendamentos(caminho) {
  const { api } = useAuth()
  const [resultado, setResultado] = useState({ caminho: '', dados: null, erro: null })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        let dados = await api(caminho)

        if (!Array.isArray(dados) && Array.isArray(dados?.results)) {
          const resultados = [...dados.results]
          let proximaPagina = dados.next

          while (proximaPagina) {
            const pagina = await api(proximaPagina)
            resultados.push(...listaDe(pagina))
            proximaPagina = pagina?.next
          }

          dados = resultados
        }

        if (ativo) setResultado({ caminho, dados, erro: null })
      } catch (erro) {
        if (ativo) setResultado({ caminho, dados: null, erro })
      }
    }

    carregar()
    return () => { ativo = false }
  }, [api, caminho, tentativa])

  return {
    ...resultado,
    carregando: resultado.caminho !== caminho,
    recarregar: () => setTentativa((valor) => valor + 1),
  }
}

export function useAgendamento(id) {
  const { api } = useAuth()
  const [resultado, setResultado] = useState({ id: '', dados: null, erro: null })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    api(`/agendamentos/${id}/`)
      .then((dados) => ativo && setResultado({ id, dados, erro: null }))
      .catch((erro) => ativo && setResultado({ id, dados: null, erro }))

    return () => { ativo = false }
  }, [api, id, tentativa])

  return {
    ...resultado,
    carregando: resultado.id !== id,
    recarregar: () => setTentativa((valor) => valor + 1),
  }
}
