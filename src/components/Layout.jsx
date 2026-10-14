import { Link, Outlet } from 'react-router'

export default function Layout() {
  return (
    <>
      <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
      <header className="cabecalho">
        <Link to="/" className="marca">Salão de Beleza</Link>
        <nav aria-label="Navegação principal">
          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Criar conta</Link>
        </nav>
      </header>
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
