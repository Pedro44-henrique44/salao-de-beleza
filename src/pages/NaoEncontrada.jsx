import { LinkBotao } from '../components/Botao'

export default function NaoEncontrada() {
  return (
    <section className="pagina-mensagem">
      <p className="sobretitulo">Erro 404</p>
      <h1>Página não encontrada</h1>
      <p>Confira o endereço ou volte para a entrada.</p>
      <LinkBotao to="/" variante="secundario">Voltar para a entrada</LinkBotao>
    </section>
  )
}
