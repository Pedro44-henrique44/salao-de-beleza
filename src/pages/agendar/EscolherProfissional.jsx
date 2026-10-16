import Botao from '../../components/Botao'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'
import { CabecalhoEtapa, ErroAoCarregar } from './Componentes'
import { listaDe, useDados } from './dados'

export default function EscolherProfissional({ api, navigate, selecao, salvar }) {
  const idServico = selecao.servico?.id
  const estado = useDados(api, `/recursos/?servicos=${idServico || ''}`)

  if (!idServico) {
    navigate('/agendar')
    return null
  }

  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <ErroAoCarregar erro={estado.erro} />

  const profissionais = listaDe(estado.dados)

  return (
    <section className="pagina-agendamento">
      <CabecalhoEtapa titulo="Escolha a profissional" numero="2" />

      <div className="acoes navegacao-etapa">
        <Botao variante="secundario" onClick={() => navigate('/agendar')}>
          Voltar
        </Botao>
      </div>

      {profissionais.length ? (
        <div className="grade-agendamento">
          <Cartao className="cartao-escolha">
            <h2>Qualquer uma</h2>
            <p className="texto-suave">Encontre o primeiro horário disponível.</p>
            <Botao
              onClick={() => {
                salvar({ ...selecao, profissional: null })
                navigate('/agendar/horario')
              }}
            >
              Escolher
            </Botao>
          </Cartao>

          {profissionais.map((profissional) => (
            <Cartao className="cartao-escolha" key={profissional.id}>
              <h2>{profissional.nome}</h2>
              <p className="texto-suave">
                {profissional.bio || 'Profissional do salão'}
              </p>
              <Botao
                onClick={() => {
                  salvar({ ...selecao, profissional })
                  navigate('/agendar/horario')
                }}
              >
                Escolher
              </Botao>
            </Cartao>
          ))}
        </div>
      ) : (
        <Estado titulo="Nenhuma profissional realiza este serviço" />
      )}
    </section>
  )
}
