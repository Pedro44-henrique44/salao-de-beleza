import { Link, useParams } from 'react-router'
import { LinkBotao } from '../components/Botao'
import Cartao from '../components/Cartao'
import CartaoAvaliacao from '../components/Avaliacao'
import Estado from '../components/Estado'
import useConsulta from '../hooks/useConsulta'
import useListaPaginada from '../hooks/useListaPaginada'

export function ListaProfissionais() {
  const profissionais = useListaPaginada('/recursos/?ativo=true')

  if (profissionais.carregando) return <Estado tipo="carregando" />
  if (profissionais.erro) {
    return <Estado tipo="erro" aoTentarNovamente={profissionais.recarregar}>
      {profissionais.erro.message}
    </Estado>
  }

  return (
    <section className="pilha">
      <p className="sobretitulo">Conheça nossa equipe</p>
      <h1>Profissionais</h1>

      {profissionais.dados.length ? (
        <div className="grade-componentes">
          {profissionais.dados.map((profissional) => (
            <Cartao key={profissional.id} className="cartao-profissional">
              {profissional.foto && (
                <img className="foto-profissional" src={profissional.foto} alt={profissional.nome} />
              )}
              <h2>{profissional.nome}</h2>
              <p className="texto-suave">{profissional.bio || 'Profissional do salão'}</p>
              <LinkBotao to={`/profissionais/${profissional.id}`} variante="secundario">
                Ver perfil
              </LinkBotao>
            </Cartao>
          ))}
        </div>
      ) : (
        <Estado titulo="Nenhuma profissional cadastrada" />
      )}
    </section>
  )
}

export function PerfilProfissional() {
  const { id } = useParams()
  const pessoa = useConsulta(`/recursos/${id}/`)
  const servicos = useListaPaginada('/servicos/?ativo=true')
  const avaliacoes = useListaPaginada(`/avaliacoes/?recurso=${id}`)

  if (pessoa.carregando || servicos.carregando || avaliacoes.carregando) {
    return <Estado tipo="carregando" />
  }

  const falha = pessoa.erro || servicos.erro || avaliacoes.erro
  if (falha) {
    return <Estado
      tipo="erro"
      aoTentarNovamente={pessoa.erro ? pessoa.recarregar : servicos.erro ? servicos.recarregar : avaliacoes.recarregar}
    >
      {falha.message}
    </Estado>
  }

  const profissional = pessoa.dados
  const servicosDaProfissional = servicos.dados.filter((servico) => {
    const recursos = servico.recursos || servico.profissionais || []
    return recursos.some((recurso) => String(recurso.id ?? recurso) === String(id))
  })
  const media = avaliacoes.dados.length
    ? avaliacoes.dados.reduce((total, avaliacao) => total + Number(avaliacao.nota || 0), 0) / avaliacoes.dados.length
    : 0

  return (
    <section className="pilha">
      <p className="sobretitulo">Nossa equipe</p>
      <div className="perfil-profissional">
        {profissional.foto && (
          <img className="foto-profissional foto-profissional--perfil" src={profissional.foto} alt={profissional.nome} />
        )}
        <div>
          <h1>{profissional.nome}</h1>
          <p>{profissional.bio || 'Profissional do salão'}</p>
          <p className="texto-suave">
            {avaliacoes.dados.length
              ? `${media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de 5 · ${avaliacoes.dados.length} avaliação(ões)`
              : 'Ainda sem avaliações'}
          </p>
          <Link className="botao botao--primario" to="/agendar" state={{ profissional }}>
            Agendar com esta profissional
          </Link>
        </div>
      </div>

      <section className="pilha">
        <h2>Serviços</h2>
        {servicosDaProfissional.length ? (
          <ul className="lista-servicos">
            {servicosDaProfissional.map((servico) => (
              <li key={servico.id}>
                <strong>{servico.nome}</strong>
                {servico.duracao_min && <span> · {servico.duracao_min} min</span>}
                {servico.preco != null && (
                  <span> · {Number(servico.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="texto-suave">Nenhum serviço disponível no momento.</p>
        )}
      </section>

      <section className="pilha">
        <h2>Avaliações</h2>
        {avaliacoes.dados.length ? (
          <div className="grade-componentes">
            {avaliacoes.dados.map((avaliacao) => (
              <CartaoAvaliacao key={avaliacao.id} avaliacao={avaliacao} />
            ))}
          </div>
        ) : (
          <Estado titulo="Ainda sem avaliações" />
        )}
      </section>
    </section>
  )
}
