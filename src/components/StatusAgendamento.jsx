const rotulos = {
  solicitado: 'Solicitado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export default function StatusAgendamento({ status }) {
  return <span className={`status status--${Object.hasOwn(rotulos, status) ? status : 'desconhecido'}`}>{rotulos[status] || 'Status desconhecido'}</span>
}
