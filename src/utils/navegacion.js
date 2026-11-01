// Solo acepta rutas internas y evita volver a las pantallas de acceso
export function destinoSeguro(valor) {
    if (typeof valor !== 'string') return '/'
    const valido =
        valor.startsWith('/') &&
        !valor.startsWith('//') &&
        !valor.startsWith('/login') &&
        !valor.startsWith('/registro')
    return valido ? valor : '/'
}