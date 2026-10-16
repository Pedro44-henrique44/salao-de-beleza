import { useState } from 'react'
import Botao from '../../components/Botao'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'
import { CabecalhoEtapa, ErroAoCarregar } from './Componentes'
import { campoDe, dataHoje, listaDe, useDados } from './dados'

export default function EscolherHorario({ api, navigate, selecao, salvar }) {
  const [data, setData] = useState(selecao.data || dataHoje())
  const parametros = new URLSearchParams({
    servico: selecao.servico?.id || '',
    data,
  })

  if (selecao.profissional?.id) {
    parametros.set('recurso', selecao.profissional.id)
  }

  const estado = useDados(api, `/horarios-livres/?${parametros}`)

  if (!selecao.servico) {
    navigate('/agendar')
    return null
  }

  function escolherHorario(horario) {
    salvar({
      ...selecao,
      data,
      horario,
      profissional:
        selecao.profissional || horario.recurso || horario.profissional,
    })
    navigate('/agendar/confirmar')
  }

  const horarios = listaDe(estado.dados)

  return (
    <section className="pagina-agendamento">
      <CabecalhoEtapa titulo="Escolha o dia e horário" numero="3" />

      <div className="campo campo-data">
        <label htmlFor="data-agendamento">Dia</label>
        <input
          id="data-agendamento"
          type="date"
          min={dataHoje()}
          value={data}
          onChange={(evento) => setData(evento.target.value)}
        />
      </div>

      {estado.carregando ? (
        <Estado tipo="carregando" />
      ) : estado.erro ? (
        <ErroAoCarregar erro={estado.erro} />
      ) : horarios.length ? (
        <div className="grade-horarios">
          {horarios.map((horario, indice) => (
            <Cartao key={horario.id || indice}>
              <strong>
                {new Date(campoDe(horario, 'inicio', 'data_hora')).toLocaleTimeString(
                  'pt-BR',
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </strong>
              <p className="texto-suave">
                {campoDe(horario.recurso, 'nome') ||
                  campoDe(horario.profissional, 'nome') ||
                  selecao.profissional?.nome ||
                  'Profissional disponível'}
              </p>
              <Botao onClick={() => escolherHorario(horario)}>Escolher</Botao>
            </Cartao>
          ))}
        </div>
      ) : (
        <Estado titulo="Sem horários livres neste dia">
          Escolha outra data para encontrar um horário.
        </Estado>
      )}

      <div className="acoes navegacao-etapa">
        <Botao
          variante="secundario"
          onClick={() => navigate('/agendar/profissional')}
        >
          Voltar
        </Botao>
      </div>
    </section>
  )
}
