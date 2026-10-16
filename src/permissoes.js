export function temPermissao(usuario, permissao) {
  return Boolean(usuario?.permissoes?.includes(permissao))
}

export function inicioDoUsuario(usuario) {
  return temPermissao(usuario, 'api.change_organizacao') ? '/admin/agenda' : '/inicio'
}
