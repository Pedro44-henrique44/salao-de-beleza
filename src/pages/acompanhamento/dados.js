export function listaDe(dados) {
  return Array.isArray(dados) ? dados : dados?.results || []
}

export function campoDe(item, ...nomes) {
  return nomes.map((nome) => item?.[nome]).find((valor) => valor !== undefined && valor !== null)
}

export function inicioDo(agendamento) {
  return campoDe(agendamento, 'inicio', 'data_hora', 'data_inicio')
}

export function nomeDoServico(agendamento) {
  return campoDe(agendamento?.servico, 'nome') || agendamento?.servico_nome || 'Serviço'
}

export function nomeDaProfissional(agendamento) {
  return campoDe(agendamento?.recurso, 'nome') ||
    campoDe(agendamento?.profissional, 'nome') ||
    agendamento?.recurso_nome || 'A definir'
}

export function dataEHora(data) {
  if (!data) return 'Data não informada'
  return new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

export function dataLocal(data = new Date()) {
  const dia = new Date(data)
  const ano = dia.getFullYear()
  const mes = String(dia.getMonth() + 1).padStart(2, '0')
  const numeroDoDia = String(dia.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${numeroDoDia}`
}

export function hoje() {
  return dataLocal()
}

