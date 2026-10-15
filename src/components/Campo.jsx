import { useId } from 'react'

export default function Campo({ label, ajuda, erro, id, className = '', ...props }) {
  const idGerado = useId()
  const campoId = id || idGerado
  const descricoes = [props['aria-describedby'], ajuda && `${campoId}-ajuda`, erro && `${campoId}-erro`].filter(Boolean).join(' ')

  return (
    <div className={`campo ${className}`}>
      <label htmlFor={campoId}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <input {...props} id={campoId} aria-invalid={erro ? true : props['aria-invalid']} aria-describedby={descricoes || undefined} />
      {ajuda && <small id={`${campoId}-ajuda`} className="texto-suave">{ajuda}</small>}
      {erro && <small id={`${campoId}-erro`} className="campo-erro">{erro}</small>}
    </div>
  )
}
