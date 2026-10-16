import Botao from '../../components/Botao'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'
import { CabecalhoEtapa, ErroAoCarregar } from './Componentes'
import { campoDe, emMinutos, emReais, listaDe, useDados } from './dados'

export default function EscolherServico({ api, navigate, selecao, salvar }) {
  const estado = useDados(api, '/servicos/?ativo=true')

  if (estado.carregando) return <Estado tipo="carregando" />
  if (estado.erro) return <ErroAoCarregar erro={estado.erro} />

  const servicos = listaDe(estado.dados)

  return (
    <section className="pagina-agendamento">
      <CabecalhoEtapa titulo="Escolha um serviço" numero="1" />

      {selecao.profissional && (
        <p className="mensagem">Agendando com {selecao.profissional.nome}</p>
      )}

      {servicos.length ? (
        <div className="grade-agendamento">
          {servicos.map((servico) => (
            <Cartao className="cartao-servico" key={servico.id}>
              <h2>{servico.nome}</h2>
              <p className="texto-suave">
                {servico.descricao || 'Um cuidado pensado para você.'}
              </p>
              <p>
                <strong>{emMinutos(campoDe(servico, 'duracao', 'duracao_minutos'))}</strong>
                {' · '}
                <strong>{emReais(servico.preco)}</strong>
              </p>
              <Botao
                onClick={() => {
                  salvar({ ...selecao, servico, horario: null })
                  navigate(
                    selecao.profissional
                      ? '/agendar/horario'
                      : '/agendar/profissional',
                  )
                }}
              >
                Escolher
              </Botao>
            </Cartao>
          ))}
        </div>
      ) : (
        <Estado titulo="Nenhum serviço disponível" />
      )}
    </section>
  )
}
