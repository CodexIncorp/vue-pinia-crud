import { defineStore } from 'pinia'
import { persistentRef } from '@/utils/persist'

const SEED = [
    { id: 'c1', nombre: 'Margarita', tamano: 't2', masa: 'm1', salsa: 's1', queso: 'q1', toppings: ['i4'] },
    { id: 'c2', nombre: 'Pastor', tamano: 't2', masa: 'm1', salsa: 's1', queso: 'q2', toppings: ['i8', 'i5', 'i6'] },
    { id: 'c3', nombre: 'Hawaiana', tamano: 't2', masa: 'm2', salsa: 's1', queso: 'q1', toppings: ['i2', 'i5'] },
    { id: 'c4', nombre: 'Pepperoni', tamano: 't2', masa: 'm1', salsa: 's1', queso: 'q1', toppings: ['i1'] },
];

export const usePizzaConfigsStore = defineStore('pizzaConfigs', () => {
    const items = persistentRef('tlaloc:pizzaConfigs:v1', SEED)

    function getById(id) {
        return items.value.find((c) => c.id === id)
    }

    function validate(data, ignoreId = null) {
        const nombre = data.nombre?.trim()
        if (!nombre) return 'El nombre es obligatorio.'
        if (!data.tamano) return 'Elige un tamaño.'
        if (!data.masa) return 'Elige una masa.'
        const repetido = items.value.some(
            (c) => c.id !== ignoreId && c.nombre.trim().toLowerCase() === nombre.toLowerCase()
        )
        if (repetido) return 'Ya existe una pizza con ese nombre.'
        return null
    }

    const normalize = (d) => ({
        nombre: d.nombre.trim(),
        tamano: d.tamano,
        masa: d.masa,
        salsa: d.salsa ?? null,
        queso: d.queso ?? null,
        toppings: [...d.toppings],
    })

    function add(data) {
        const error = validate(data)
        if (error) return { ok: false, error }
        const nueva = { id: crypto.randomUUID(), ...normalize(data) }
        items.value.push(nueva)
        return { ok: true, item: nueva }
    }

    function update(id, data) {
        const actual = getById(id)
        if (!actual) return { ok: false, error: 'No existe la pizza a actualizar.' }
        const error = validate(data, id)
        if (error) return { ok: false, error }
        Object.assign(actual, normalize(data))
        return { ok: true }
    }

    function remove(id) {
        items.value = items.value.filter((c) => c.id !== id)
    }

    // Nombres de las configuraciones que usan un ingrediente (para impedir eliminarlo)
    function useOf(ingredienteId) {
        return items.value
            .filter(
                (c) =>
                    [c.tamano, c.masa, c.salsa, c.queso].includes(ingredienteId) ||
                    c.toppings.includes(ingredienteId),
            )
            .map((c) => c.nombre)
    }

    return { items, getById, add, update, remove, useOf }
});
