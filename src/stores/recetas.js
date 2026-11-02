import { defineStore } from 'pinia'
import { persistentRef } from '@/utils/persist'
import { TIPOS } from '@/utils/catalogo'

// `selecciones` guarda un id por tipo simple (o null) y un arreglo de ids por tipo múltiple.
// Su forma sale de TIPOS: agregar un tipo nuevo no obliga a tocar este archivo.
const SEED = [
    {
        id: 'c1', nombre: 'Clásica',
        selecciones: { tamano: 't1', pan: 'p1', proteina: 'r1', queso: 'q1', salsa: ['s1', 's2'], extra: ['e7', 'e8', 'e6'] },
    },
    {
        id: 'c2', nombre: 'Mexicana',
        selecciones: { tamano: 't2', pan: 'p3', proteina: 'r1', queso: 'q2', salsa: ['s4'], extra: ['e2', 'e4', 'e7'] },
    },
    {
        id: 'c3', nombre: 'Hawaiana',
        selecciones: { tamano: 't1', pan: 'p1', proteina: 'r2', queso: 'q3', salsa: ['s3'], extra: ['e3', 'e1', 'e8'] },
    },
    {
        id: 'c4', nombre: 'BBQ Tocino',
        selecciones: { tamano: 't2', pan: 'p2', proteina: 'r1', queso: 'q1', salsa: ['s5'], extra: ['e1', 'e5'] },
    },
    {
        id: 'c5', nombre: 'Veggie',
        selecciones: { tamano: 't1', pan: 'p2', proteina: 'r3', queso: 'q2', salsa: ['s2', 's3'], extra: ['e2', 'e7', 'e8'] },
    },
];

export const useRecetasStore = defineStore('recetas', () => {
    const items = persistentRef('tlaloc:recetas:v2', SEED)

    function getById(id) {
        return items.value.find((c) => c.id === id)
    }

    function validate(data, ignoreId = null) {
        const nombre = data.nombre?.trim()
        if (!nombre) return 'El nombre es obligatorio.'
        for (const t of TIPOS) {
            if (!t.obligatorio) continue
            const v = data.selecciones?.[t.id]
            const vacio = t.multiple ? !v?.length : !v
            if (vacio) return `Falta elegir: ${t.singular.toLowerCase()}.`
        }
        const repetido = items.value.some(
            (c) => c.id !== ignoreId && c.nombre.trim().toLowerCase() === nombre.toLowerCase()
        )
        if (repetido) return 'Ya existe una configuración con ese nombre.'
        return null
    }

    const normalize = (d) => ({
        nombre: d.nombre.trim(),
        selecciones: Object.fromEntries(
            TIPOS.map((t) => [
                t.id,
                t.multiple ? [...(d.selecciones?.[t.id] ?? [])] : d.selecciones?.[t.id] || null,
            ]),
        ),
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
        if (!actual) return { ok: false, error: 'No existe la configuración a actualizar.' }
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
            .filter((c) => Object.values(c.selecciones).flat().includes(ingredienteId))
            .map((c) => c.nombre)
    }

    return { items, getById, add, update, remove, useOf }
});