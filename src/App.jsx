import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Entrada from './pages/Entrada'
import NaoEncontrada from './pages/NaoEncontrada'
import PaginaEmConstrucao from './pages/PaginaEmConstrucao'
import { rotas } from './rotas'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Entrada />} />
        {rotas.filter((rota) => rota.caminho !== '/').map((rota) => (
          <Route
            key={rota.caminho}
            path={rota.caminho}
            element={<PaginaEmConstrucao titulo={rota.titulo} />}
          />
        ))}
        <Route path="/admin" element={<Navigate to="/admin/agenda" replace />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
