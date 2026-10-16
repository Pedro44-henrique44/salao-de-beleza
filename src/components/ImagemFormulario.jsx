import { useEffect, useRef, useState } from 'react'
import Botao from './Botao'
import Campo from './Campo'

export default function ImagemFormulario({ nome, atual, remover, onChange, disabled, erro }) {
  const input = useRef(null)
  const [previa, setPrevia] = useState('')
  useEffect(() => {
    return () => { if (previa) URL.revokeObjectURL(previa) }
  }, [previa])
  const imagem = remover ? '' : previa || atual
  return <div className="pilha">
    {imagem && <img className="imagem-cadastro" src={imagem} alt={`Prévia de ${nome}`} />}
    <Campo id={`arquivo-${nome}`} label={nome} type="file" accept="image/*" ref={input} disabled={disabled} erro={erro}
      ajuda="A imagem ou sua remoção será aplicada ao salvar."
      onChange={(e) => {
        const selecionado = e.target.files[0] || null
        setPrevia(selecionado ? URL.createObjectURL(selecionado) : '')
        onChange(selecionado, false)
      }} />
    <Botao variante="secundario" disabled={disabled || !imagem} onClick={() => {
      input.current.value = ''
      setPrevia('')
      onChange(null, true)
    }}>Remover imagem</Botao>
  </div>
}
