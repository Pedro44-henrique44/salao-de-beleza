import { LinkBotao } from '../components/Botao'

export default function PaginaEmConstrucao({ titulo }) {
  return (
    <section className="pagina-mensagem">
      <p className="sobretitulo">Em breve</p>
      <h1>{titulo}</h1>
      <p>Esta página está em construção.</p>
      <LinkBotao to="/" variante="secundario">Voltar para a entrada</LinkBotao>
    </section>
  )
}
