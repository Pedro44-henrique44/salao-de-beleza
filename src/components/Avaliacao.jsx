import Cartao from './Cartao'

export function Estrelas({ nota }) {
  const valor = Math.max(0, Math.min(5, Number(nota) || 0))
  return (
    <span className="avaliacao-estrelas" aria-label={`${valor} de 5 estrelas`}>
      {'★'.repeat(valor)}{'☆'.repeat(5 - valor)}
    </span>
  )
}

export function ResumoAvaliacao({ avaliacao }) {
  if (!avaliacao?.nota) return null
  return (
    <div className="resumo-avaliacao">
      <Estrelas nota={avaliacao.nota} />
      {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
    </div>
  )
}

export default function CartaoAvaliacao({ avaliacao }) {
  const cliente = avaliacao.cliente?.nome ||
    avaliacao.usuario?.nome ||
    avaliacao.cliente_nome ||
    avaliacao.agendamento?.cliente?.nome ||
    'Cliente'
  const servico = avaliacao.servico?.nome ||
    avaliacao.servico_nome ||
    avaliacao.agendamento?.servico?.nome ||
    'Serviço'
  const profissional = avaliacao.recurso?.nome ||
    avaliacao.profissional?.nome ||
    avaliacao.recurso_nome ||
    'Profissional'

  return (
    <Cartao className="cartao-avaliacao">
      <div className="avaliacao-cabecalho">
        <Estrelas nota={avaliacao.nota} />
        <span>{avaliacao.nota} de 5</span>
      </div>
      {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
      <p className="texto-suave">
        {cliente} · {servico} · {profissional}
      </p>
    </Cartao>
  )
}
