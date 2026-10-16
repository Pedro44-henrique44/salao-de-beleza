import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../AuthContext'

// Cadastros precisam da lista completa; avaliações carregam uma página por vez.
export default function useListaPaginada(caminho, todas = true) {
  const { api } = useAuth()
  const [resultado, setResultado] = useState({ caminho: '', dados: [], erro: null })
  const [tentativa, setTentativa] = useState(0)
  const consultaAtual = useRef(0)

  useEffect(() => {
    const consulta = ++consultaAtual.current
    async function carregar() {
      try {
        const primeira = await api(caminho)
        const dados = Array.isArray(primeira) ? [...primeira] : [...(primeira?.results || [])]
        let proxima = primeira?.next
        while (todas && proxima && consulta === consultaAtual.current) {
          const pagina = await api(proxima)
          dados.push(...(Array.isArray(pagina) ? pagina : pagina?.results || []))
          proxima = pagina?.next
        }
        if (consulta === consultaAtual.current) {
          setResultado({ caminho, tentativa, dados, proxima, erro: null })
        }
      } catch (erro) {
        if (consulta === consultaAtual.current) setResultado({ caminho, tentativa, dados: [], erro })
      }
    }
    carregar()
    return () => { consultaAtual.current = consulta + 1 }
  }, [api, caminho, tentativa, todas])

  async function carregarMais() {
    if (!resultado.proxima || resultado.carregandoMais) return
    const consulta = consultaAtual.current
    setResultado((atual) => ({ ...atual, carregandoMais: true, erroMais: null }))
    try {
      const pagina = await api(resultado.proxima)
      if (consulta === consultaAtual.current) {
        setResultado((atual) => ({ ...atual,
          dados: [...atual.dados, ...(Array.isArray(pagina) ? pagina : pagina?.results || [])],
          proxima: pagina?.next, carregandoMais: false,
        }))
      }
    } catch (erroMais) {
      if (consulta === consultaAtual.current) {
        setResultado((atual) => ({ ...atual, erroMais, carregandoMais: false }))
      }
    }
  }

  return {
    ...resultado,
    carregando: resultado.caminho !== caminho || resultado.tentativa !== tentativa,
    carregarMais,
    recarregar: () => setTentativa((valor) => valor + 1),
  }
}
