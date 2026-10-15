// Cada campo deve receber um id único na página para associar o rótulo ao input.
export default function Campo({ label, ajuda, erro, id, className = '', ...props }) {
  const descricoes = [props['aria-describedby'], ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(' ')

  return (
    <div className={`campo ${className}`}>
      <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <input {...props} id={id} aria-invalid={erro ? true : props['aria-invalid']} aria-describedby={descricoes || undefined} />
      {ajuda && <small id={`${id}-ajuda`} className="texto-suave">{ajuda}</small>}
      {erro && <small id={`${id}-erro`} className="campo-erro">{erro}</small>}
    </div>
  )
}
