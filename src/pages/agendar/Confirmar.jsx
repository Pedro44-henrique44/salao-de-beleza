import { useMemo, useState } from 'react'
import Botao from '../../components/Botao'
import Cartao from '../../components/Cartao'
import { CabecalhoEtapa } from './Componentes'
import { campoDe, emReais } from './dados'

export default function Confirmar({ api, navigate, selecao, salvar }) {
  const [observacoes, setObservacoes] = useState('')
  const [erro, setErro] = useState(null)
  const horario = selecao.horario || {}
  const inicio = campoDe(horario, 'inicio', 'data_hora') || `${selecao.data}T00:00:00`
  const profissional = selecao.profissional || horario.recurso || horario.profissional

  const resumo = useMemo(() => ({
    servico: selecao.servico?.nome,
    profissional: profissional?.nome || 'A definir pelo salão',
    inicio: new Date(inicio).toLocaleString('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }),
    preco: emReais(selecao.servico?.preco),
  }), [inicio, profissional, selecao.servico])

  async function confirmarAgendamento() {
    setErro(null)

    try {
      const agendamento = await api('/agendamentos/', {
        method: 'POST',
        body: {
          servico: selecao.servico.id,
          ...(profissional?.id ? { recurso: profissional.id } : {}),
          inicio,
          observacoes,
        },
      })

      salvar({ ...selecao, agendamento })
      navigate('/agendar/enviado')
    } catch (falha) {
      setErro(falha)
    }
  }

  return (
    <section className="pagina-agendamento pagina-formulario">
      <CabecalhoEtapa titulo="Confirme seu agendamento" numero="4" />

      <Cartao>
        <dl className="resumo-agendamento">
          <div><dt>Serviço</dt><dd>{resumo.servico}</dd></div>
          <div><dt>Profissional</dt><dd>{resumo.profissional}</dd></div>
          <div><dt>Quando</dt><dd>{resumo.inicio}</dd></div>
          <div><dt>Valor</dt><dd>{resumo.preco}</dd></div>
        </dl>

        <div className="campo">
          <label htmlFor="observacoes">Observações (opcional)</label>
          <textarea
            id="observacoes"
            rows="4"
            value={observacoes}
            onChange={(evento) => setObservacoes(evento.target.value)}
            placeholder="Ex.: maquiagem para casamento às 16h"
          />
        </div>

        {erro && (
          <p className="campo-erro" role="alert">
            {erro.message || 'Não foi possível confirmar este horário. Escolha outro.'}
          </p>
        )}

        <div className="acoes">
          <Botao variante="secundario" onClick={() => navigate('/agendar/horario')}>
            Voltar
          </Botao>
          <Botao onClick={confirmarAgendamento}>Confirmar agendamento</Botao>
        </div>
      </Cartao>
    </section>
  )
}
