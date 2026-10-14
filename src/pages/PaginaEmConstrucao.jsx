import { Link } from 'react-router'

export default function PaginaEmConstrucao({ titulo }) {
  return (
    <section>
      <h1>{titulo}</h1>
      <p>Esta página está em construção.</p>
      <Link to="/">Voltar para a entrada</Link>
    </section>
  )
}
