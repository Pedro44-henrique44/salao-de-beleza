import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import ProtecaoRota from './components/ProtecaoRota'
import FormularioCadastro from './pages/admin/FormularioCadastro'
import Horarios from './pages/admin/Horarios'
import ListaCadastros from './pages/admin/ListaCadastros'
import Acesso from './pages/Acesso'
import Agendamento from './pages/Agendamento'
import AlterarSenha from './pages/AlterarSenha'
import { AvaliarAtendimento, ListaAvaliacoesAdministrador } from './pages/Avaliacoes'
import Componentes from './pages/Componentes'
import EsqueciMinhaSenha from './pages/EsqueciMinhaSenha'
import Entrada from './pages/Entrada'
import NaoEncontrada from './pages/NaoEncontrada'
import PaginaEmConstrucao from './pages/PaginaEmConstrucao'
import Perfil from './pages/Perfil'
import { ListaProfissionais, PerfilProfissional } from './pages/Profissionais'
import {
  AgendaAdministrador,
  DetalheAdministrador,
  DetalheCliente,
  HorariosCliente,
  InicioCliente,
  PedidosAdministrador,
} from './pages/Acompanhamento'
import { rotas } from './rotas'

const paginasCliente = {
  C1: <InicioCliente />,
  C7: <HorariosCliente />,
  C8: <DetalheCliente />,
  C9: <AvaliarAtendimento />,
  C10: <ListaProfissionais />,
  C11: <PerfilProfissional />,
}

const paginasAdministrador = {
  A1: <AgendaAdministrador />,
  A2: <PedidosAdministrador />,
  A3: <DetalheAdministrador />,
  A10: <ListaAvaliacoesAdministrador />,
}

function paginaDoCliente(rota) {
  if (['C2', 'C3', 'C4', 'C5', 'C6'].includes(rota.id)) {
    return <Agendamento />
  }

  return paginasCliente[rota.id] || <PaginaEmConstrucao titulo={rota.titulo} />
}

function paginaDoAdministrador(rota) {
  return paginasAdministrador[rota.id] || <PaginaEmConstrucao titulo={rota.titulo} />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<ProtecaoRota publica />}>
          <Route path="/" element={<Entrada />} />
          <Route path="/login" element={<Acesso key="login" />} />
          <Route path="/cadastro" element={<Acesso key="cadastro" cadastro />} />
          <Route path="/esqueci-minha-senha" element={<EsqueciMinhaSenha />} />
        </Route>
        {import.meta.env.DEV && <Route path="/dev/componentes" element={<Componentes />} />}
        <Route element={<ProtecaoRota />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/alterar-senha" element={<AlterarSenha />} />
          {rotas
            .filter((rota) => rota.area === 'Cliente')
            .map((rota) => (
              <Route key={rota.caminho} element={<ProtecaoRota permissao={rota.permissao} />}>
                <Route path={rota.caminho} element={paginaDoCliente(rota)} />
              </Route>
            ))}
          <Route element={<ProtecaoRota permissao="api.change_organizacao" />}>
            <Route path="/admin" element={<Navigate to="/admin/agenda" replace />} />
            <Route path="/admin/negocio" element={<FormularioCadastro key="negocio" tipo="negocio" />} />
            <Route path="/admin/profissionais" element={<ListaCadastros key="profissionais" />} />
            <Route path="/admin/profissionais/nova" element={<FormularioCadastro key="nova-profissional" tipo="recurso" />} />
            <Route path="/admin/profissionais/:id/editar" element={<FormularioCadastro key="editar-profissional" tipo="recurso" />} />
            <Route path="/admin/profissionais/:id/horarios" element={<Horarios />} />
            <Route path="/admin/servicos" element={<ListaCadastros key="servicos" servicos />} />
            <Route path="/admin/servicos/novo" element={<FormularioCadastro key="novo-servico" tipo="servico" />} />
            <Route path="/admin/servicos/:id/editar" element={<FormularioCadastro key="editar-servico" tipo="servico" />} />
            {rotas
              .filter((rota) => rota.area === 'Administração' && ['A1', 'A2', 'A3', 'A10'].includes(rota.id))
              .map((rota) => (
                <Route key={rota.caminho} path={rota.caminho} element={paginaDoAdministrador(rota)} />
              ))}
          </Route>
        </Route>
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
