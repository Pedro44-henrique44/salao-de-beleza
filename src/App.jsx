import { Navigate, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Entrada from './pages/Entrada'
import NaoEncontrada from './pages/NaoEncontrada'
import PaginaEmConstrucao from './pages/PaginaEmConstrucao'
import { rotas } from './rotas'
import { lazy, Suspense } from 'react'
import Estado from './components/Estado'

const Componentes = import.meta.env.DEV ? lazy(() => import('./pages/Componentes')) : null

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Entrada />} />
        {import.meta.env.DEV && <Route path="/dev/componentes" element={<Suspense fallback={<Estado tipo="carregando" />}><Componentes /></Suspense>} />}
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
