import { defineStore } from 'pinia'
import { computed } from 'vue'
import { persistentRef } from '@/utils/persist'
import { TIPOS, copiarSeleccion, PRODUCTO } from '@/utils/catalogo'
import { useSessionStore } from './session'

export const useCartStore = defineStore('cart', () => {
    // Mapa reactivo de referencias persistentes por id de usuario: tlaloc:cart:<idUsuario>
    const cacheUsuarios = new Map()

    function obtenerRefUsuario() {
        const session = useSessionStore()
        const userId = session.usuario?.id ?? 'invitado'
        const key = `tlaloc:cart:${userId}`
        if (!cacheUsuarios.has(key)) {
            cacheUsuarios.set(key, persistentRef(key, []))
        }
        return cacheUsuarios.get(key)
    }

    // state reactivo al usuario autenticado actual
    const items = computed({
        get: () => obtenerRefUsuario().value,
        set: (val) => {
            obtenerRefUsuario().value = val
        },
    })

    // getters
    const total = computed(() =>
        items.value.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    )
    const count = computed(() =>
        items.value.reduce((acc, i) => acc + i.cantidad, 0)
    )

    function generarFirma(selecciones) {
        return TIPOS.map((t) => {
            const v = selecciones?.[t.id]
            return Array.isArray(v) ? [...v].sort().join(',') : (v ?? '')
        }).join('|')
    }

    // actions
    function addCustom({ nombre, selecciones, cantidad = 1, precioUnitario, resumen = [] }) {
        const firma = generarFirma(selecciones)
        const existing = items.value.find((i) => i.firma && i.firma === firma)

        if (existing) {
            existing.cantidad += cantidad
            existing.precio = precioUnitario
        } else {
            const tituloBase =
                nombre?.trim() ||
                `${PRODUCTO.singular.charAt(0).toUpperCase() + PRODUCTO.singular.slice(1)} personalizada`

            items.value.push({
                id: crypto.randomUUID(),
                firma,
                nombre: tituloBase,
                detalles: resumen.join(', '),
                selecciones: copiarSeleccion(selecciones),
                precio: Number(precioUnitario),
                cantidad: Number(cantidad),
            })
        }
        return { ok: true }
    }

    function add(product) {
        const existing = items.value.find((i) => i.id === product.id)
        if (existing) {
            existing.cantidad++
        } else {
            items.value.push({
                id: product.id ?? crypto.randomUUID(),
                nombre: product.nombre,
                detalles: product.detalles ?? '',
                selecciones: product.selecciones ? copiarSeleccion(product.selecciones) : null,
                precio: Number(product.precio),
                cantidad: Number(product.cantidad ?? 1),
            })
        }
        return { ok: true }
    }

    function decrement(id) {
        const existing = items.value.find((i) => i.id === id)
        if (!existing) return
        if (existing.cantidad > 1) {
            existing.cantidad--
        } else {
            remove(id)
        }
    }

    function remove(id) {
        items.value = items.value.filter((i) => i.id !== id)
    }

    function clear() {
        items.value = []
    }

    return { items, total, count, addCustom, add, decrement, remove, clear }
})