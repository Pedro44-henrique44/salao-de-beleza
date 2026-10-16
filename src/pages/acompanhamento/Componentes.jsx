import { Link } from 'react-router'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'
import StatusAgendamento from '../../components/StatusAgendamento'
import {
  campoDe,
  dataEHora,
  inicioDo,
  nomeDaProfissional,
  nomeDoServico,
} from './dados'

export function Carregando() {
  return <Estado tipo="carregando" />
}

export function ErroAoCarregar({ erro, tentarNovamente }) {
  return (
    <Estado
      tipo="erro"
      titulo="Não foi possível carregar os agendamentos"
      aoTentarNovamente={tentarNovamente}
    >
      {erro?.message}
    </Estado>
  )
}

export function CartaoAgendamento({ agendamento, link, acoes, mostrarCliente = false }) {
  const cliente = campoDe(agendamento.cliente, 'nome') ||
    campoDe(agendamento.usuario, 'nome') ||
    agendamento.cliente_nome || 'Cliente'

  return (
    <Cartao className="cartao-agendamento">
      <div className="acoes">
        <StatusAgendamento status={agendamento.status} />
        <strong>{dataEHora(inicioDo(agendamento))}</strong>
      </div>
      <h2>{nomeDoServico(agendamento)}</h2>
      <p className="texto-suave">Com {nomeDaProfissional(agendamento)}</p>

      {mostrarCliente && (
        <>
          <p><strong>Cliente:</strong> {cliente}</p>
          {agendamento.observacoes && (
            <p><strong>Observações:</strong> {agendamento.observacoes}</p>
          )}
        </>
      )}

      <div className="acoes">
        {link && (
          <Link className="botao botao--secundario" to={link}>
            Ver detalhes
          </Link>
        )}
        {acoes}
      </div>
    </Cartao>
  )
}
