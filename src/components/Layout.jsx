import { Link, NavLink, Outlet } from 'react-router'
import { marca } from '../marca'

export default function Layout() {
  return (
    <>
      <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
      <header className="cabecalho">
        <Link to="/" className="marca">
          <img src={marca.logo} alt="" width="44" height="44" />
          <span>{marca.nome}<small>{marca.assinatura}</small></span>
        </Link>
        <nav aria-label="Navegação principal">
          <NavLink to="/login" className="link-navegacao">Entrar</NavLink>
          <NavLink to="/cadastro" className="botao botao--primario">Criar conta</NavLink>
        </nav>
      </header>
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="rodape"><span>{marca.nome}</span><span>Um tempo para cuidar de você.</span></footer>
    </>
  )
}
