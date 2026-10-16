import { Link } from 'react-router'
import Botao from '../../components/Botao'
import Cartao from '../../components/Cartao'
import StatusAgendamento from '../../components/StatusAgendamento'
import { campoDe, CHAVE_AGENDAMENTO } from './dados'

export default function Enviado({ navigate, selecao }) {
  const agendamento = selecao.agendamento || {}
  const inicio = campoDe(selecao.horario, 'inicio', 'data_hora') ||
    agendamento.inicio ||
    selecao.data

  function voltarAoInicio() {
    sessionStorage.removeItem(CHAVE_AGENDAMENTO)
    navigate('/inicio')
  }

  return (
    <section className="pagina-mensagem">
      <p className="sobretitulo">Tudo certo</p>
      <h1>Agendamento enviado</h1>
      <p>Seu pedido foi registrado e aguarda a confirmação do administrador.</p>

      <Cartao>
        <p><strong>{selecao.servico?.nome}</strong></p>
        <p>
          {selecao.profissional?.nome || 'Profissional a definir'}
          <br />
          {new Date(inicio).toLocaleString('pt-BR', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </p>
        <StatusAgendamento status={agendamento.status || 'solicitado'} />
      </Cartao>

      <div className="acoes">
        <Link
          className="botao botao--primario"
          to={`/meus-horarios/${agendamento.id || ''}`}
        >
          Ver horário
        </Link>
        <Botao variante="secundario" onClick={voltarAoInicio}>
          Início
        </Botao>
      </div>
    </section>
  )
}
