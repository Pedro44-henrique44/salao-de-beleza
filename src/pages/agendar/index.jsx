import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../AuthContext'
import { CHAVE_AGENDAMENTO } from './dados'
import Confirmar from './Confirmar'
import Enviado from './Enviado'
import EscolherHorario from './EscolherHorario'
import EscolherProfissional from './EscolherProfissional'
import EscolherServico from './EscolherServico'

export default function Agendamento() {
  const { api } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [selecao, setSelecao] = useState(() => {
    const anterior = JSON.parse(sessionStorage.getItem(CHAVE_AGENDAMENTO) || '{}')
    const profissional = location.state?.profissional

    return profissional
      ? { ...anterior, profissional, servico: null, horario: null }
      : anterior
  })

  function salvarSelecao(dados) {
    setSelecao(dados)
    sessionStorage.setItem(CHAVE_AGENDAMENTO, JSON.stringify(dados))
  }

  const propriedades = {
    api,
    navigate,
    selecao,
    salvar: salvarSelecao,
  }

  switch (location.pathname) {
    case '/agendar':
      return <EscolherServico {...propriedades} />
    case '/agendar/profissional':
      return <EscolherProfissional {...propriedades} />
    case '/agendar/horario':
      return <EscolherHorario {...propriedades} />
    case '/agendar/confirmar':
      return <Confirmar {...propriedades} />
    default:
      return <Enviado navigate={navigate} selecao={selecao} />
  }
}
