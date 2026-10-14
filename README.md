# Salão de Beleza

Aplicativo web da disciplina POS 2026, desenvolvido em React e JavaScript com Vite.
O objetivo é permitir agendamentos de cabelo, manicure e maquiagem e a administração
dos profissionais, serviços, horários e agenda do salão.

**Estado atual:** fundação da issue 01, com estrutura de pastas, rotas provisórias e
configuração da API. Login, cadastros e agendamentos ainda não estão implementados.

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

- `src/api/`: configuração e futura comunicação com a API.
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

## Documentação

- [Especificação do salão e critérios de aceite](docs/salao-de-beleza.md)
- [Swagger da API](https://agendamentos.spaincentral.cloudapp.azure.com/api/docs/)
- [Aula de React do professor](https://dvcirilo-ifrn.github.io/pos/slides/aula15.html#66)
- [Referência de organização dos arquivos](https://github.com/devigMurilo/consultorio-medico)

A entrega da disciplina está prevista para **16/10/2026**, com demonstração no
Vercel. Todos os integrantes devem contribuir com commits. As próximas issues
introduzem identidade visual (02), cliente HTTP (03) e acesso/sessão (04–08).
