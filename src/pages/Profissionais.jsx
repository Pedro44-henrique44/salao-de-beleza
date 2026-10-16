import { Link, useParams } from 'react-router'
import Botao, { LinkBotao } from '../components/Botao'
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
  const avaliacoes = useListaPaginada(`/avaliacoes/?recurso=${id}`, false)

  if (pessoa.carregando) {
    return <Estado tipo="carregando" />
  }

  const falha = pessoa.erro
  if (falha) {
    return <Estado
      tipo="erro"
      aoTentarNovamente={pessoa.recarregar}
    >
      {falha.message}
    </Estado>
  }

  const profissional = pessoa.dados
  const servicosDaProfissional = servicos.dados.filter((servico) => {
    const recursos = servico.recursos || servico.profissionais || []
    return recursos.some((recurso) => String(recurso.id ?? recurso) === String(id))
  })

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
          <Link
            className="botao botao--primario"
            to="/agendar"
            state={{ profissional }}
          >
            Agendar com esta profissional
          </Link>
        </div>
      </div>

      <section className="pilha">
        <h2>Serviços</h2>
        {servicos.carregando ? <Estado tipo="carregando" /> : servicos.erro ? (
          <Estado tipo="erro" aoTentarNovamente={servicos.recarregar}>{servicos.erro.message}</Estado>
        ) : servicosDaProfissional.length ? (
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
        {avaliacoes.carregando ? <Estado tipo="carregando" /> : avaliacoes.erro ? (
          <Estado tipo="erro" aoTentarNovamente={avaliacoes.recarregar}>{avaliacoes.erro.message}</Estado>
        ) : avaliacoes.dados.length ? (
          <div className="grade-componentes">
            {avaliacoes.dados.map((avaliacao) => (
              <CartaoAvaliacao key={avaliacao.id} avaliacao={avaliacao} />
            ))}
          </div>
        ) : (
          <Estado titulo="Ainda sem avaliações" />
        )}
        {avaliacoes.erroMais && <p role="alert">{avaliacoes.erroMais.message}</p>}
        {!avaliacoes.carregando && avaliacoes.proxima && <Botao carregando={avaliacoes.carregandoMais} onClick={avaliacoes.carregarMais}>Carregar mais</Botao>}
      </section>
    </section>
  )
}
