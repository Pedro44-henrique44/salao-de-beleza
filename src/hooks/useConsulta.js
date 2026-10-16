import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'

export default function useConsulta(caminho) {
  const { api } = useAuth()
  const [resultado, setResultado] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    api(caminho).then((resposta) => {
      if (ativo) setResultado({ caminho, tentativa, dados: resposta, erro: null })
    }).catch((falha) => {
      if (ativo) setResultado({ caminho, tentativa, dados: null, erro: falha })
    })
    return () => { ativo = false }
  }, [api, caminho, tentativa])

  const carregando = resultado?.caminho !== caminho || resultado?.tentativa !== tentativa
  return { dados: carregando ? null : resultado.dados, erro: carregando ? null : resultado.erro, carregando, recarregar: () => setTentativa((valor) => valor + 1) }
}
