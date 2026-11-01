import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { persistentRef } from '@/utils/persist'
import { ROLES } from '@/utils/catalogo'
import * as idp from '@/services/mockIdP'

// Valida la forma de lo guardado: protege contra datos corruptos o alterados
const sesionValida = (s) =>
    !!s &&
    typeof s.token === 'string' &&
    typeof s.expiraEn === 'number' &&
    !!s.usuario?.id &&
    ROLES.includes(s.usuario.rol)

export const useSessionStore = defineStore('session', () => {
    const sesion = persistentRef('tlaloc:session:v1', null)
    const cargando = ref(false)

    // getters
    const usuario = computed(() => (sesionValida(sesion.value) ? sesion.value.usuario : null))
    const autenticado = computed(() => usuario.value !== null)
    const rol = computed(() => usuario.value?.rol ?? null)
    const esAdmin = computed(() => rol.value === 'admin')
    const cuentasDemo = idp.cuentasDemo

    // Lo usa el guard: un computed no detecta el paso del tiempo, esta acción sí
    function validarSesion() {
        if (!sesionValida(sesion.value) || Date.now() >= sesion.value.expiraEn) {
            sesion.value = null
            return false
        }
        return true
    }

    async function ejecutar(operacion) {
        if (cargando.value) return { ok: false, error: 'Espera un momento…' }
        cargando.value = true
        try {
            const res = await operacion()
            if (!res.ok) return { ok: false, error: res.error }
            sesion.value = res.sesion
            return { ok: true }
        } catch {
            return { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
        } finally {
            cargando.value = false
        }
    }

    const iniciarSesion = (email, password) => ejecutar(() => idp.iniciarSesion(email, password))
    const iniciarSesionDemo = (id) => ejecutar(() => idp.iniciarSesionDemo(id))

    function registrar(datos) {
        if (datos.password !== datos.confirmacion) {
            return Promise.resolve({ ok: false, error: 'Las contraseñas no coinciden.' })
        }
        return ejecutar(() => idp.registrar(datos))
    }

    async function cerrarSesion() {
        const token = sesion.value?.token
        sesion.value = null // la sesión se borra de inmediato
        await idp.cerrarSesion(token).catch(() => { })
    }

    return {
        sesion, cargando, usuario, autenticado, rol, esAdmin, cuentasDemo,
        validarSesion, iniciarSesion, iniciarSesionDemo, registrar, cerrarSesion,
    }
})