import { Link } from 'react-router'

export default function NaoEncontrada() {
  return (
    <section>
      <h1>Página não encontrada</h1>
      <p>Confira o endereço ou volte para a entrada.</p>
      <Link to="/">Voltar para a entrada</Link>
    </section>
  )
}
