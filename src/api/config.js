// Variáveis VITE_ são públicas e incorporadas ao build. Não colocar segredos aqui.
export const API_URL = (
  import.meta.env.VITE_API_URL?.trim() ||
  'https://agendamentos.spaincentral.cloudapp.azure.com/api'
).replace(/\/+$/, '')

// Identificador fixo fornecido pela disciplina para cadastro, login e recuperação.
export const ORGANIZACAO_SLUG = 'salao-de-beleza'
