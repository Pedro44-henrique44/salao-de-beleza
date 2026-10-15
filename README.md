# Salão de Beleza

Aplicativo web da disciplina POS 2026, desenvolvido em React e JavaScript com Vite.
O objetivo é permitir agendamentos de cabelo, manicure e maquiagem e a administração
dos profissionais, serviços, horários e agenda do salão.

**Estado atual:** itens 01 a 03 da árvore de progresso, com estrutura de pastas,
rotas provisórias, identidade visual, componentes comuns e cliente HTTP com erros padronizados.
Login, cadastros e agendamentos ainda não estão implementados.

## Executar localmente

Usar Node.js 22.12+ (recomendado: Node.js 24) e npm.

```sh
npm ci
npm run dev
```

Abrir o endereço informado pelo Vite. Na entrada, o mapa de desenvolvimento permite
visitar as páginas provisórias. Ele não aparece no build de produção.

Opcionalmente, copiar `.env.example` para `.env` e ajustar `VITE_API_URL`.
Reiniciar o Vite após alterações. A configuração padrão já aponta para a API da
disciplina e usa o slug fixo `salao-de-beleza`. Não colocar credenciais no `.env`:
variáveis `VITE_` são públicas.

```sh
npm run lint
npm run build
npm run preview
```

O build é gerado em `dist/`. A configuração de rotas do Vercel está em
`vercel.json`; o projeto ainda precisa ser publicado.

## Organização do código

- `src/api/`: configuração, cliente HTTP e tratamento dos erros da API.
- `src/components/`: componentes compartilhados, como o layout.
- `src/hooks/`: hooks compartilhados, conforme forem necessários.
- `src/pages/`: páginas; `admin/` para administração e `agendar/` para o agendamento.
- `src/rotas.js`: caminhos das telas e seus códigos na especificação.
- `src/App.jsx`: associação entre rotas e componentes.
- `src/main.jsx`: inicialização do React e do BrowserRouter.

Os arquivos `.gitkeep` mantêm as pastas vazias no Git e podem ser removidos quando
elas receberem código. As rotas atuais exibem páginas provisórias, sem dados ou
autenticação. Ao implementar uma tela, substituir sua rota provisória em `App.jsx`
pelo componente real. Coordenar alterações nos arquivos compartilhados com o colega.
Ao usar `Campo`, informar um `id` único na página para associar o rótulo ao input.

## Documentação

- [Especificação do salão e critérios de aceite](docs/salao-de-beleza.md)
- [Swagger da API](https://agendamentos.spaincentral.cloudapp.azure.com/api/docs/)
- [Aula de React do professor](https://dvcirilo-ifrn.github.io/pos/slides/aula15.html#66)
- [Referência de organização dos arquivos](https://github.com/devigMurilo/consultorio-medico)

A entrega da disciplina está prevista para **16/10/2026**, com demonstração no
Vercel. Todos os integrantes devem contribuir com commits. As próximas issues
introduzem acesso/sessão (04–08). Esses números correspondem
aos itens da árvore de progresso, não aos números automáticos do GitHub.

## Comunicação com a API

Importar `api` de `src/api/client.js`. O cliente usa a `VITE_API_URL` já configurada
e aceita endpoints com barra final, como `/servicos/`. Filtros vão na URL.

```js
const pagina = await api('/servicos/?ativo=true&page=1', { token: access })
const proxima = pagina.next ? await api(pagina.next, { token: access }) : null
const dados = new FormData()
dados.append('nome', nome)
dados.append('foto', arquivo)
await api('/auth/eu/', { method: 'PATCH', body: dados, token: access })
```

`body` aceita um objeto JSON ou `FormData` (sem definir `Content-Type` manualmente).
Para montar filtros com valores variáveis, pode-se usar `URLSearchParams`.
Respostas vazias retornam `null`, e as listas preservam a paginação da API.
Links absolutos, como `next`, só são aceitos dentro da API configurada.

Falhas lançam um `Error`: `message` serve para o componente `Estado`, `campos.email`
(e os demais campos) para `Campo`, `status` para decisões da tela e `dados` preserva
o JSON original. Erros gerais de validação vêm de `detail`, `non_field_errors` ou
listas. Há mensagens para 400, 401, 403, 404, 429, falhas do servidor e de conexão
(`status: 0` em falhas de conexão).

O token é opcional e fornecido por requisição. Login, armazenamento e renovação
automática ainda serão integrados nos itens 04–05; por enquanto, 401 é propagado.
O retorno à lista em 404 será responsabilidade de cada página.
