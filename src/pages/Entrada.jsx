import { Link } from 'react-router'
import { rotas } from '../rotas'

export default function Entrada() {
  return (
    <section>
      <h1>Salão de Beleza</h1>
      <p>Seu espaço para agendar cabelo, manicure e maquiagem.</p>
      <p>Estamos preparando o aplicativo. Em breve você poderá agendar seu atendimento.</p>
      {import.meta.env.DEV && (
        <details className="mapa-rotas">
          <summary>Mapa de desenvolvimento</summary>
          <p>Páginas provisórias, sem dados ou autenticação. IDs abaixo são exemplos de navegação.</p>
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
