export default function Cartao({ children, className = '', ...props }) {
  return <div {...props} className={`cartao ${className}`}>{children}</div>
}
