import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../AuthContext'
import Estado from './Estado'
import Botao, { LinkBotao } from './Botao'

export default function ProtecaoRota({ publica = false, permissao }) {
  const { usuario, carregando, erro, inicio, pode, tentarNovamente, sair } = useAuth()

  if (carregando) return <Estado tipo="carregando" titulo="Carregando sua sessão…" />
  if (erro) return <Estado tipo="erro" aoTentarNovamente={tentarNovamente} acao={<Botao variante="secundario" onClick={sair}>Voltar ao acesso</Botao>}>{erro.message}</Estado>
  if (publica) return usuario ? <Navigate to={inicio} replace /> : <Outlet />
  if (!usuario) return <Navigate to="/login" replace />
  if (permissao && !pode(permissao)) {
    return <Estado tipo="erro" titulo="Acesso não permitido" acao={<LinkBotao to={inicio}>Voltar ao início</LinkBotao>}>Você não tem permissão para esta ação</Estado>
  }
  return <Outlet />
}
