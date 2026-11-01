import { persistentRef } from '@/utils/persist'
import { hashPassword, nuevaSal } from '@/utils/hash'

const SESION_MS = 8 * 60 * 60 * 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Cuentas de demostración: definidas en código y sin contraseña
const CUENTAS_DEMO = [
    { id: 'demo-admin', nombre: 'Admin Tlaloc', email: 'admin@tlaloc.test', rol: 'admin' },
    { id: 'demo-cliente', nombre: 'Cliente Demo', email: 'cliente@tlaloc.test', rol: 'cliente' },
]
export const cuentasDemo = CUENTAS_DEMO

// "Base de datos" del proveedor: cuentas creadas por los usuarios
const cuentas = persistentRef('tlaloc:users:v1', [])

const espera = (ms = 400) => new Promise((r) => setTimeout(r, ms))
const normalizar = (email) => (email ?? '').trim().toLowerCase()
const fallo = (error) => ({ ok: false, error })

function emailExiste(email) {
    return (
        CUENTAS_DEMO.some((c) => c.email === email) || cuentas.value.some((c) => c.email === email)
    )
}

function crearSesion({ id, nombre, email, rol }) {
    return {
        usuario: { id, nombre, email, rol }, // nunca incluye sal ni hash
        token: crypto.randomUUID(),
        expiraEn: Date.now() + SESION_MS,
    }
}

export async function iniciarSesion(email, password) {
    await espera()
    const cuenta = cuentas.value.find((c) => c.email === normalizar(email))
    if (cuenta) {
        const hash = await hashPassword(password ?? '', cuenta.sal)
        if (hash === cuenta.hash) return { ok: true, sesion: crearSesion(cuenta) }
    }
    // Mensaje genérico: no revela si el correo existe
    return fallo('Correo o contraseña incorrectos.')
}

export async function iniciarSesionDemo(id) {
    await espera(250)
    const cuenta = CUENTAS_DEMO.find((c) => c.id === id)
    return cuenta
        ? { ok: true, sesion: crearSesion(cuenta) }
        : fallo('Cuenta de demostración no encontrada.')
}

export async function registrar({ nombre, email, password }) {
    await espera()
    const nombreLimpio = nombre?.trim() ?? ''
    const correo = normalizar(email)

    if (nombreLimpio.length < 2) return fallo('Escribe tu nombre (mínimo 2 caracteres).')
    if (!EMAIL_RE.test(correo)) return fallo('Escribe un correo válido.')
    if ((password ?? '').length < 8) return fallo('La contraseña debe tener al menos 8 caracteres.')
    if (emailExiste(correo)) return fallo('Ya existe una cuenta con ese correo.')

    const sal = nuevaSal()
    const cuenta = {
        id: crypto.randomUUID(),
        nombre: nombreLimpio,
        email: correo,
        rol: 'cliente', // siempre cliente: el rol nunca viene del formulario
        sal,
        hash: await hashPassword(password, sal),
        creadaEn: Date.now(),
    }
    cuentas.value.push(cuenta)
    return { ok: true, sesion: crearSesion(cuenta) }
}

export async function cerrarSesion() {
    // Un proveedor real revocaría el token aquí
}