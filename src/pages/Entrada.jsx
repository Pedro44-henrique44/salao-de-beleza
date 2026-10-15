import { Link } from 'react-router'
import { rotas } from '../rotas'
import { LinkBotao } from '../components/Botao'
import { marca } from '../marca'

export default function Entrada() {
  return (
    <section>
      <div className="entrada-destaque">
        <div className="entrada-texto">
          <p className="sobretitulo">Seu momento de cuidado</p>
          <h1>A beleza de reservar<br /><em>um tempo para você.</em></h1>
          <p className="entrada-descricao">Cabelo, manicure e maquiagem. Um espaço para valorizar seu estilo e cuidar de você, nos pequenos e nos grandes momentos.</p>
          <div className="acoes">
            <LinkBotao to="/login">Entrar <span aria-hidden="true">↗</span></LinkBotao>
            <LinkBotao to="/cadastro" variante="secundario">Criar conta</LinkBotao>
          </div>
          <p className="aviso-preparacao">Estamos preparando nosso agendamento online. Em breve, por aqui.</p>
        </div>
        <div className="entrada-marca" aria-hidden="true">
          <span className="ornamento">✦</span>
          <img src={marca.logo} alt="" width="96" height="96" />
          <span className="entrada-nome">{marca.nome}</span>
          <span className="entrada-assinatura">Cuidado em cada detalhe</span>
          <span className="ornamento">✦</span>
        </div>
      </div>
      <div className="especialidades" aria-label="Nossas especialidades">
        {[
          ['01', 'Cabelo', 'Seu estilo, sua expressão.'],
          ['02', 'Manicure', 'Cuidado até a ponta dos dedos.'],
          ['03', 'Maquiagem', 'Realce o que faz você ser você.'],
        ].map(([numero, titulo, descricao]) => (
          <div className="especialidade" key={titulo}><span aria-hidden="true">{numero}</span><div><h2>{titulo}</h2><p>{descricao}</p></div></div>
        ))}
      </div>
      {import.meta.env.DEV && (
        <details className="mapa-rotas">
          <summary>Mapa de desenvolvimento</summary>
          <p>Páginas provisórias, sem dados ou autenticação. IDs abaixo são exemplos de navegação.</p>
          <Link to="/dev/componentes">Ver componentes da interface</Link>
          {['Acesso e perfil', 'Cliente', 'Administração'].map((area) => (
            <section key={area}>
              <h2>{area}</h2>
              <ul>
                {rotas.filter((rota) => rota.area === area).map((rota) => (
                  <li key={rota.caminho}>
                    <Link to={rota.caminho.replace(':id', '1')}>
                      {rota.id} — {rota.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </details>
      )}
    </section>
  )
}
