import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../AuthContext'
import Botao from '../components/Botao'
import Cartao from '../components/Cartao'
import CartaoAvaliacao from '../components/Avaliacao'
import { Estrelas } from '../components/Avaliacao'
import Estado from '../components/Estado'
import useConsulta from '../hooks/useConsulta'
import useListaPaginada from '../hooks/useListaPaginada'

export function AvaliarAtendimento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const agendamento = useConsulta(`/agendamentos/${id}/`)
  const [nota, setNota] = useState('')
  const [comentario, setComentario] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function enviarAvaliacao(evento) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      await api(`/agendamentos/${id}/avaliar/`, {
        method: 'POST',
        body: { nota: Number(nota), comentario },
      })
      navigate(`/meus-horarios/${id}`, { state: { mensagem: 'Obrigado pela sua avaliação!' } })
    } catch (falha) {
      setErro(falha)
    } finally {
      setEnviando(false)
    }
  }

  if (agendamento.carregando) return <Estado tipo="carregando" />
  if (agendamento.erro) {
    return <Estado tipo="erro" aoTentarNovamente={agendamento.recarregar}>
      {agendamento.erro.message}
    </Estado>
  }

  const dados = agendamento.dados
  if (dados.status !== 'concluido' || dados.nota) {
    return (
      <section className="pagina-mensagem">
        <h1>Este atendimento não pode ser avaliado</h1>
        <Link to={`/meus-horarios/${id}`}>Voltar ao agendamento</Link>
      </section>
    )
  }

  return (
    <section className="pagina-formulario pilha">
      <p className="sobretitulo">Sua opinião</p>
      <h1>Avalie seu atendimento</h1>
      <Cartao>
        <p><strong>{dados.servico_nome || dados.servico?.nome || 'Atendimento'}</strong></p>
        <p className="texto-suave">Com {dados.recurso_nome || dados.recurso?.nome || dados.profissional?.nome || 'nossa profissional'}</p>

        <form className="pilha" onSubmit={enviarAvaliacao} aria-busy={enviando}>
          <fieldset className="campo campo-nota" disabled={enviando}>
            <legend>Sua nota</legend>
            <div className="opcoes-nota">
              {[1, 2, 3, 4, 5].map((valor) => (
                <label key={valor} className={Number(nota) === valor ? 'nota-selecionada' : ''}>
                  <input
                    type="radio"
                    name="nota"
                    value={valor}
                    checked={Number(nota) === valor}
                    onChange={() => setNota(String(valor))}
                    required
                  />
                  <span aria-hidden="true">★</span>
                  <span className="somente-leitor">{valor} {valor === 1 ? 'estrela' : 'estrelas'}</span>
                </label>
              ))}
            </div>
            {nota && <p className="texto-suave"><Estrelas nota={nota} /> · {nota} de 5</p>}
          </fieldset>

          <div className="campo">
            <label htmlFor="comentario-avaliacao">Comentário (opcional)</label>
            <textarea
              id="comentario-avaliacao"
              rows="4"
              value={comentario}
              onChange={(evento) => setComentario(evento.target.value)}
              disabled={enviando}
              placeholder="Conte como foi sua experiência."
            />
          </div>

          {erro && <p className="campo-erro" role="alert">{erro.message}</p>}
          <div className="acoes">
            <Botao variante="secundario" disabled={enviando} onClick={() => navigate(-1)}>
              Voltar
            </Botao>
            <Botao type="submit" carregando={enviando} disabled={!nota}>
              Enviar avaliação
            </Botao>
          </div>
        </form>
      </Cartao>
    </section>
  )
}

export function ListaAvaliacoesAdministrador() {
  const [recurso, setRecurso] = useState('')
  const [nota, setNota] = useState('')
  const profissionais = useListaPaginada('/recursos/')
  const consulta = useListaPaginada(
    `/avaliacoes/?${recurso ? `recurso=${recurso}&` : ''}${nota ? `nota=${nota}` : ''}`, false,
  )

  if (profissionais.carregando || consulta.carregando) return <Estado tipo="carregando" />
  if (profissionais.erro || consulta.erro) {
    const falha = profissionais.erro || consulta.erro
    const tentarNovamente = profissionais.erro ? profissionais.recarregar : consulta.recarregar
    return <Estado tipo="erro" aoTentarNovamente={tentarNovamente}>{falha.message}</Estado>
  }

  return (
    <section className="pilha">
      <p className="sobretitulo">Administração</p>
      <h1>Avaliações</h1>

      <div className="filtros-agenda">
        <div className="campo">
          <label htmlFor="filtro-avaliacao-profissional">Profissional</label>
          <select
            id="filtro-avaliacao-profissional"
            value={recurso}
            onChange={(evento) => setRecurso(evento.target.value)}
          >
            <option value="">Todas</option>
            {profissionais.dados.map((profissional) => (
              <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="filtro-avaliacao-nota">Nota</label>
          <select
            id="filtro-avaliacao-nota"
            value={nota}
            onChange={(evento) => setNota(evento.target.value)}
          >
            <option value="">Todas</option>
            {[5, 4, 3, 2, 1].map((valor) => (
              <option key={valor} value={valor}>{valor} {valor === 1 ? 'estrela' : 'estrelas'}</option>
            ))}
          </select>
        </div>
      </div>

      {consulta.dados.length ? (
        <div className="grade-componentes">
          {consulta.dados.map((avaliacao) => (
            <CartaoAvaliacao key={avaliacao.id} avaliacao={avaliacao} />
          ))}
        </div>
      ) : (
        <Estado titulo="Nenhuma avaliação encontrada" />
      )}
      {consulta.erroMais && <p role="alert">{consulta.erroMais.message}</p>}
      {consulta.proxima && <Botao carregando={consulta.carregandoMais} onClick={consulta.carregarMais}>Carregar mais</Botao>}
    </section>
  )
}
