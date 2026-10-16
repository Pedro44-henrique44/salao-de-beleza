import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Entrada from './pages/Entrada'
import NaoEncontrada from './pages/NaoEncontrada'
import PaginaEmConstrucao from './pages/PaginaEmConstrucao'
import { rotas } from './rotas'
import Componentes from './pages/Componentes'
import ProtecaoRota from './components/ProtecaoRota'
import Acesso from './pages/Acesso'
import EsqueciMinhaSenha from './pages/EsqueciMinhaSenha'
import Perfil from './pages/Perfil'
import AlterarSenha from './pages/AlterarSenha'

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
          {rotas.filter((rota) => rota.area === 'Cliente').map((rota) => (
            <Route key={rota.caminho} element={<ProtecaoRota permissao={rota.permissao} />}>
              <Route path={rota.caminho} element={<PaginaEmConstrucao titulo={rota.titulo} />} />
            </Route>
          ))}
          <Route element={<ProtecaoRota permissao="api.change_organizacao" />}>
            <Route path="/admin" element={<Navigate to="/admin/agenda" replace />} />
            {rotas.filter((rota) => rota.area === 'Administração').map((rota) => (
              <Route key={rota.caminho} path={rota.caminho} element={<PaginaEmConstrucao titulo={rota.titulo} />} />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
