import { useState } from 'react'
import { useLocation } from 'react-router'
import { useAuth } from '../../AuthContext'
import useConsulta from '../../hooks/useConsulta'
import Botao, { LinkBotao } from '../../components/Botao'
import Campo from '../../components/Campo'
import Cartao from '../../components/Cartao'
import Estado from '../../components/Estado'

export default function ListaCadastros({ servicos = false }) {
  const { pode } = useAuth()
  const location = useLocation()
  const endpoint = servicos ? 'servicos' : 'recursos'
  const base = servicos ? '/admin/servicos' : '/admin/profissionais'
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const consulta = useConsulta(`/${endpoint}/?page=${pagina}${filtro ? `&ativo=${filtro}` : ''}`)
  const itens = consulta.dados?.results || []

  return <section className="pilha">
    <div className="acoes admin-titulo">
      <h1>{servicos ? 'Serviços' : 'Profissionais'}</h1>
      {pode(`api.add_${servicos ? 'servico' : 'recurso'}`) && <LinkBotao to={`${base}/${servicos ? 'novo' : 'nova'}`}>{servicos ? 'Novo serviço' : 'Nova profissional'}</LinkBotao>}
    </div>
    {location.state?.mensagem && <p className="mensagem" role="status">{location.state.mensagem}</p>}
    <Campo as="select" id="filtro-ativo" label="Situação" value={filtro} onChange={(e) => { setFiltro(e.target.value); setPagina(1) }}>
      <option value="">Todos</option><option value="true">Ativos</option><option value="false">Inativos</option>
    </Campo>
    {consulta.carregando ? <Estado tipo="carregando" /> : consulta.erro ? <Estado tipo="erro" aoTentarNovamente={consulta.recarregar}>{consulta.erro.message}</Estado> : <>
      {!itens.length && <Estado titulo={filtro ? 'Nenhum resultado para este filtro' : servicos ? 'Cadastre o primeiro serviço' : 'Cadastre a primeira profissional'} />}
      <div className="grade-componentes">
        {itens.map((item) => <Cartao key={item.id}>
          {(item.imagem || item.foto) && <img className="imagem-cadastro" src={item.imagem || item.foto} alt="" />}
          <h2>{item.nome}</h2>
          <p>{servicos ? `${item.duracao_min} min · ${Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `Capacidade: ${item.capacidade} atendimento(s) por vez`}</p>
          <p className="texto-suave">{item.ativo ? 'Ativo' : 'Inativo'}</p>
          <div className="acoes">
            {pode(`api.change_${servicos ? 'servico' : 'recurso'}`) && <LinkBotao to={`${base}/${item.id}/editar`} variante="secundario">Editar<span className="somente-leitor"> {item.nome}</span></LinkBotao>}
            {!servicos && <LinkBotao to={`${base}/${item.id}/horarios`} variante="secundario">Horários<span className="somente-leitor"> de {item.nome}</span></LinkBotao>}
          </div>
        </Cartao>)}
      </div>
      <nav className="acoes" aria-label="Paginação">
        <Botao variante="secundario" disabled={!consulta.dados?.previous} onClick={() => setPagina(pagina - 1)}>Anterior</Botao>
        <span>Página {pagina}</span>
        <Botao variante="secundario" disabled={!consulta.dados?.next} onClick={() => setPagina(pagina + 1)}>Próxima</Botao>
      </nav>
    </>}
  </section>
}
