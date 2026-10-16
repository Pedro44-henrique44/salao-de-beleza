import { Link, NavLink, Outlet } from 'react-router'
import { marcaDoUsuario, useAuth } from '../AuthContext'
import Botao from './Botao'

export default function Layout() {
  const { usuario, carregando, inicio, pode, sair } = useAuth()
  const marca = marcaDoUsuario(usuario)
  const administrador = pode('api.change_organizacao')
  const links = administrador ? [
    ['/admin/agenda', 'Agenda'], ['/admin/a-confirmar', 'A confirmar'],
    ['/admin/negocio', 'Negócio'], ['/admin/profissionais', 'Profissionais'],
    ['/admin/servicos', 'Serviços'], ['/admin/avaliacoes', 'Avaliações'],
  ] : [
    ['/inicio', 'Início'], ...(pode('api.add_agendamento') ? [['/agendar', 'Agendar']] : []),
    ['/meus-horarios', 'Meus horários'], ['/profissionais', 'Profissionais'],
  ]

  return (
    <>
      <a className="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
      <header className="cabecalho">
        <Link to={usuario ? inicio : '/'} className="marca">
          <img src={marca.logo} alt="" width="44" height="44" />
          <span>{marca.nome}<small>{marca.assinatura}</small></span>
        </Link>
        <nav aria-label="Conta">
          {!carregando && (usuario ? <>
            <NavLink to="/perfil" className="link-navegacao">Perfil</NavLink>
            <Botao variante="secundario" onClick={sair}>Sair</Botao>
          </> : <>
            <NavLink to="/login" className="link-navegacao">Entrar</NavLink>
            <NavLink to="/cadastro" className="botao botao--primario">Criar conta</NavLink>
          </>)}
        </nav>
      </header>
      {usuario && !carregando && <nav className="menu-sessao" aria-label={administrador ? 'Administração' : 'Navegação principal'}>
        {links.map(([caminho, titulo]) => <NavLink key={caminho} to={caminho} className="link-navegacao">{titulo}</NavLink>)}
      </nav>}
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="rodape"><span>{marca.nome}</span><span>Um tempo para cuidar de você.</span></footer>
    </>
  )
}
