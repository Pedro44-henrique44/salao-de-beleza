import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'

export default function useListaPaginada(caminho) {
  const { api } = useAuth()
  const [resultado, setResultado] = useState({ caminho: '', dados: [], erro: null })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const primeiraPagina = await api(caminho)
        const resultados = Array.isArray(primeiraPagina)
          ? [...primeiraPagina]
          : [...(primeiraPagina?.results || [])]
        let proxima = primeiraPagina?.next

        while (proxima) {
          const pagina = await api(proxima)
          resultados.push(...(Array.isArray(pagina) ? pagina : pagina?.results || []))
          proxima = pagina?.next
        }

        if (ativo) setResultado({ caminho, dados: resultados, erro: null })
      } catch (erro) {
        if (ativo) setResultado({ caminho, dados: [], erro })
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
