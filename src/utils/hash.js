const encoder = new TextEncoder()

const aHex = (buffer) =>
    [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')

const desdeHex = (hex) => Uint8Array.from(hex.match(/.{2}/g).map((h) => parseInt(h, 16)))

export function nuevaSal() {
    return aHex(crypto.getRandomValues(new Uint8Array(16)))
}

// PBKDF2-SHA256 con Web Crypto (requiere https o localhost).
// En un sistema real esto se hace en el servidor.
export async function hashPassword(password, sal) {
    const clave = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
        'deriveBits',
    ])
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: desdeHex(sal), iterations: 100_000, hash: 'SHA-256' },
        clave,
        256,
    )
    return aHex(bits)
}