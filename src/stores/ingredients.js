import { defineStore } from 'pinia'
import { computed } from 'vue'
import { persistentRef } from '@/utils/persist'
import { TIPOS } from '@/utils/catalogo'
import { usePizzaConfigsStore } from './pizzaConfigs'

const SEED = [
    { id: 't1', nombre: 'Chica', tipo: 'tamano', precio: 80, color: null, activo: true },
    { id: 't2', nombre: 'Mediana', tipo: 'tamano', precio: 110, color: null, activo: true },
    { id: 't3', nombre: 'Grande', tipo: 'tamano', precio: 140, color: null, activo: true },

    { id: 'm1', nombre: 'Delgada', tipo: 'masa', precio: 0, color: '#e8c27a', activo: true },
    { id: 'm2', nombre: 'Gruesa', tipo: 'masa', precio: 10, color: '#d9a95b', activo: true },
    { id: 'm3', nombre: 'Orilla rellena', tipo: 'masa', precio: 25, color: '#e0b36a', activo: true },

    { id: 's1', nombre: 'Tomate', tipo: 'salsa', precio: 0, color: '#c0392b', activo: true },
    { id: 's2', nombre: 'Pesto', tipo: 'salsa', precio: 10, color: '#6a8f3a', activo: true },
    { id: 's3', nombre: 'Blanca', tipo: 'salsa', precio: 10, color: '#f3ead3', activo: true },

    { id: 'q1', nombre: 'Mozzarella', tipo: 'queso', precio: 0, color: '#f7e08a', activo: true },
    { id: 'q2', nombre: 'Oaxaca', tipo: 'queso', precio: 10, color: '#fff3b0', activo: true },

    { id: 'i1', nombre: 'Pepperoni', tipo: 'topping', precio: 15, color: '#a93226', activo: true },
    { id: 'i2', nombre: 'Jamón', tipo: 'topping', precio: 12, color: '#f1948a', activo: true },
    { id: 'i3', nombre: 'Champiñones', tipo: 'topping', precio: 10, color: '#d7ccc8', activo: true },
    { id: 'i4', nombre: 'Albahaca', tipo: 'topping', precio: 5, color: '#27ae60', activo: true },
    { id: 'i5', nombre: 'Piña', tipo: 'topping', precio: 10, color: '#f4d03f', activo: true },
    { id: 'i6', nombre: 'Cebolla morada', tipo: 'topping', precio: 8, color: '#8e44ad', activo: true },
    { id: 'i7', nombre: 'Chorizo', tipo: 'topping', precio: 15, color: '#b03a2e', activo: true },
    { id: 'i8', nombre: 'Pastor', tipo: 'topping', precio: 18, color: '#d35400', activo: true },
    { id: 'i9', nombre: 'Aceitunas', tipo: 'topping', precio: 10, color: '#2c3e50', activo: true },
    { id: 'i10', nombre: 'Jalapeño', tipo: 'topping', precio: 8, color: '#1e8449', activo: true },
];

export const useIngredientsStore = defineStore('ingredients', () => {
    const items = persistentRef('tlaloc:ingredients:v1', SEED)

    //getters
    const byType = computed(() =>
        Object.fromEntries(TIPOS.map((t) => [t.id, items.value.filter((i) => i.tipo === t.id)]))
    )
    const activesByType = computed(() =>
        Object.fromEntries(
            TIPOS.map((t) => [t.id, items.value.filter((i) => i.tipo === t.id && i.activo)])
        ),
    )

    function getById(id) {
        return items.value.find((i) => i.id === id)
    }

    // helpers internos
    function validate(data, ignoreId = null) {
        const nombre = data.nombre?.trim()
        if (!nombre) return 'El nombre es obligatorio.'
        const precio = Number(data.precio)
        if (!Number.isFinite(precio) || precio < 0) return 'El precio debe ser un número mayor o igual a cero.'
        if (!TIPOS.some((t) => t.id === data.tipo)) return 'El tipo de ingrediente no es válido.'
        const repetido = items.value.some(
            (i) => i.id !== ignoreId && i.tipo === data.tipo && i.nombre.trim().toLowerCase() === nombre.toLowerCase()
        )
        if (repetido) return 'Ya existe un ingrediente con ese nombre y tipo.'
        return null
    }

    const normalize = (d) => ({
        nombre: d.nombre.trim(),
        tipo: d.tipo,
        precio: Number(d.precio),
        color: d.tipo === 'tamano' ? null : d.color || '#cccccc',
        activo: Boolean(d.activo),
    })

    //actions
    function add(data) {
        const error = validate(data)
        if (error) return { ok: false, error }
        const nuevo = { id: crypto.randomUUID(), ...normalize(data) }
        items.value.push(nuevo)
        return { ok: true, item: nuevo }
    }

    function update(id, data) {
        const actual = getById(id)
        if (!actual) return { ok: false, error: 'No existe el ingrediente a actualizar.' }
        const error = validate(data, id)
        if (error) return { ok: false, error }
        Object.assign(actual, normalize(data))
        return { ok: true }
    }

    function toggleActive(id) {
        const i = getById(id)
        if (i) i.activo = !i.activo
    }

    function remove(id) {
        const uses = usePizzaConfigsStore().useOf(id)   // el store se obtiene dentro de la función para evitar dependencias circulares
        if (uses.length) {
            return {
                ok: false,
                error: `No se puede eliminar: está en ${uses.join(', ')}. Desactívalo o edita esas configuraciones.`,
            }
        }
        items.value = items.value.filter((i) => i.id !== id)
        return { ok: true }
    }

    return { items, byType, activesByType, getById, add, update, toggleActive, remove }
});
