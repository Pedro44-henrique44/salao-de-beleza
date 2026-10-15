import { Link } from 'react-router'

export default function Botao({ children, variante = 'primario', carregando = false, disabled, className = '', type = 'button', ...props }) {
  return (
    <button {...props} type={type} className={`botao botao--${variante} ${className}`} disabled={disabled || carregando} aria-busy={carregando || undefined}>
      {carregando ? 'Aguarde…' : children}
    </button>
  )
}

export function LinkBotao({ children, variante = 'primario', className = '', ...props }) {
  return <Link {...props} className={`botao botao--${variante} ${className}`}>{children}</Link>
}
