import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function marcaDoUsuario(usuario) {
  return {
    nome: usuario?.organizacao?.nome || 'Salão de Beleza',
    logo: usuario?.organizacao?.logo || '/marca.svg',
    assinatura: 'Cabelo · Manicure · Maquiagem',
  }
}
