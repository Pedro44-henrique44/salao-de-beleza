import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import ProtecaoRota from './components/ProtecaoRota'
import FormularioCadastro from './pages/admin/FormularioCadastro'
import Horarios from './pages/admin/Horarios'
import ListaCadastros from './pages/admin/ListaCadastros'
import Acesso from './pages/Acesso'
import Agendamento from './pages/agendar/index.jsx'
import AlterarSenha from './pages/AlterarSenha'
import { AvaliarAtendimento, ListaAvaliacoesAdministrador } from './pages/Avaliacoes'
import Componentes from './pages/Componentes'
import EsqueciMinhaSenha from './pages/EsqueciMinhaSenha'
import Entrada from './pages/Entrada'
import NaoEncontrada from './pages/NaoEncontrada'
import Perfil from './pages/Perfil'
import { ListaProfissionais, PerfilProfissional } from './pages/Profissionais'
import {AgendaAdministrador, DetalheAdministrador, DetalheCliente, HorariosCliente, InicioCliente, PedidosAdministrador,} from './pages/acompanhamento/index.jsx'

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

        {import.meta.env.DEV && (
          <Route path="/dev/componentes" element={<Componentes />} />
        )}

        <Route element={<ProtecaoRota />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/alterar-senha" element={<AlterarSenha />} />

          <Route path="/inicio" element={<InicioCliente />} />
          <Route element={<ProtecaoRota permissao="api.add_agendamento" />}>
            <Route path="/agendar" element={<Agendamento />} />
            <Route path="/agendar/profissional" element={<Agendamento />} />
            <Route path="/agendar/horario" element={<Agendamento />} />
            <Route path="/agendar/confirmar" element={<Agendamento />} />
            <Route path="/agendar/enviado" element={<Agendamento />} />
          </Route>
          <Route path="/meus-horarios" element={<HorariosCliente />} />
          <Route path="/meus-horarios/:id" element={<DetalheCliente />} />
          <Route element={<ProtecaoRota permissao="api.avaliar_agendamento" />}>
            <Route path="/meus-horarios/:id/avaliar" element={<AvaliarAtendimento />} />
          </Route>
          <Route path="/profissionais" element={<ListaProfissionais />} />
          <Route path="/profissionais/:id" element={<PerfilProfissional />} />

          <Route element={<ProtecaoRota permissao="api.change_organizacao" />}>
            <Route path="/admin" element={<Navigate to="/admin/agenda" replace />} />
            <Route path="/admin/agenda" element={<AgendaAdministrador />} />
            <Route path="/admin/a-confirmar" element={<PedidosAdministrador />} />
            <Route path="/admin/agendamentos/:id" element={<DetalheAdministrador />} />
            <Route path="/admin/negocio" element={<FormularioCadastro key="negocio" tipo="negocio" />} />
            <Route path="/admin/profissionais" element={<ListaCadastros key="profissionais" />} />
            <Route path="/admin/profissionais/nova" element={<FormularioCadastro key="nova-profissional" tipo="recurso" />} />
            <Route path="/admin/profissionais/:id/editar" element={<FormularioCadastro key="editar-profissional" tipo="recurso" />} />
            <Route path="/admin/profissionais/:id/horarios" element={<Horarios />} />
            <Route path="/admin/servicos" element={<ListaCadastros key="servicos" servicos />} />
            <Route path="/admin/servicos/novo" element={<FormularioCadastro key="novo-servico" tipo="servico" />} />
            <Route path="/admin/servicos/:id/editar" element={<FormularioCadastro key="editar-servico" tipo="servico" />} />
            <Route path="/admin/avaliacoes" element={<ListaAvaliacoesAdministrador />} />
          </Route>
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
