import { defineStore } from 'pinia'
import { computed } from 'vue'
import { persistentRef } from '@/utils/persist'
import { TIPOS, ATRIBUTOS, tipoPorId } from '@/utils/catalogo'
import { useRecetasStore } from './recetas'

// Forma completa de un ingrediente: los atributos que su tipo no usa quedan en null
const BASE = { color: null, orden: null, carnes: null, activo: true }

const SEED = [
    { ...BASE, id: 't1', nombre: 'Sencilla', tipo: 'tamano', precio: 60, carnes: 1 },
    { ...BASE, id: 't2', nombre: 'Doble', tipo: 'tamano', precio: 90, carnes: 2 },
    { ...BASE, id: 't3', nombre: 'Triple', tipo: 'tamano', precio: 120, carnes: 3 },

    { ...BASE, id: 'p1', nombre: 'Brioche', tipo: 'pan', precio: 0, color: '#d9a05b' },
    { ...BASE, id: 'p2', nombre: 'Integral', tipo: 'pan', precio: 5, color: '#a47148' },
    { ...BASE, id: 'p3', nombre: 'Ajonjolí', tipo: 'pan', precio: 5, color: '#e0b36a' },
    { ...BASE, id: 'p4', nombre: 'Sin gluten', tipo: 'pan', precio: 15, color: '#cdb891' },

    { ...BASE, id: 'r1', nombre: 'Res', tipo: 'proteina', precio: 0, color: '#6e3b1f' },
    { ...BASE, id: 'r2', nombre: 'Pollo', tipo: 'proteina', precio: 0, color: '#c98a4b' },
    { ...BASE, id: 'r3', nombre: 'Vegetariana', tipo: 'proteina', precio: 5, color: '#7a5c3a' },

    { ...BASE, id: 'q1', nombre: 'Cheddar', tipo: 'queso', precio: 0, color: '#f2a900' },
    { ...BASE, id: 'q2', nombre: 'Oaxaca', tipo: 'queso', precio: 10, color: '#fff3b0' },
    { ...BASE, id: 'q3', nombre: 'Suizo', tipo: 'queso', precio: 10, color: '#f6ecc4' },

    { ...BASE, id: 's1', nombre: 'Cátsup', tipo: 'salsa', precio: 0, color: '#c0392b' },
    { ...BASE, id: 's2', nombre: 'Mostaza', tipo: 'salsa', precio: 0, color: '#e1b12c' },
    { ...BASE, id: 's3', nombre: 'Mayonesa', tipo: 'salsa', precio: 0, color: '#f5efe0' },
    { ...BASE, id: 's4', nombre: 'Chipotle', tipo: 'salsa', precio: 8, color: '#a04000' },
    { ...BASE, id: 's5', nombre: 'BBQ', tipo: 'salsa', precio: 8, color: '#6e2c00' },

    // `orden`: menor = más abajo en la pila (justo encima de la carne y el queso)
    { ...BASE, id: 'e1', nombre: 'Tocino', tipo: 'extra', precio: 15, color: '#b03a2e', orden: 10 },
    { ...BASE, id: 'e2', nombre: 'Aguacate', tipo: 'extra', precio: 15, color: '#7fa650', orden: 20 },
    { ...BASE, id: 'e3', nombre: 'Piña', tipo: 'extra', precio: 10, color: '#f4d03f', orden: 30 },
    { ...BASE, id: 'e4', nombre: 'Jalapeño', tipo: 'extra', precio: 8, color: '#1e8449', orden: 40 },
    { ...BASE, id: 'e5', nombre: 'Cebolla morada', tipo: 'extra', precio: 5, color: '#8e44ad', orden: 50 },
    { ...BASE, id: 'e6', nombre: 'Pepinillos', tipo: 'extra', precio: 5, color: '#6b8e23', orden: 60 },
    { ...BASE, id: 'e7', nombre: 'Jitomate', tipo: 'extra', precio: 5, color: '#d63c2f', orden: 70 },
    { ...BASE, id: 'e8', nombre: 'Lechuga', tipo: 'extra', precio: 5, color: '#58b947', orden: 80 },
];

export const useIngredientsStore = defineStore('ingredients', () => {
    const items = persistentRef('tlaloc:ingredients:v2', SEED)

    // Los tipos con atributo `orden` se listan de abajo hacia arriba en la pila
    const ordenar = (tipo, lista) =>
        tipo.atributos.includes('orden') ? [...lista].sort((a, b) => a.orden - b.orden) : lista

    //getters
    const byType = computed(() =>
        Object.fromEntries(
            TIPOS.map((t) => [t.id, ordenar(t, items.value.filter((i) => i.tipo === t.id))])
        )
    )
    const activesByType = computed(() =>
        Object.fromEntries(
            TIPOS.map((t) => [t.id, ordenar(t, items.value.filter((i) => i.tipo === t.id && i.activo))])
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
        const tipo = tipoPorId(data.tipo)
        if (!tipo) return 'El tipo de ingrediente no es válido.'
        for (const clave of tipo.atributos) {
            const attr = ATRIBUTOS[clave]
            if (attr.input !== 'number') continue
            const n = Number(data[clave])
            if (!Number.isInteger(n) || n < attr.min) {
                return `"${attr.etiqueta}" debe ser un número entero mayor o igual a ${attr.min}.`
            }
        }
        const repetido = items.value.some(
            (i) => i.id !== ignoreId && i.tipo === data.tipo && i.nombre.trim().toLowerCase() === nombre.toLowerCase()
        )
        if (repetido) return 'Ya existe un ingrediente con ese nombre y tipo.'
        return null
    }

    // Los atributos que el tipo no usa se guardan en null
    const normalize = (d) => {
        const tipo = tipoPorId(d.tipo)
        const atributos = Object.fromEntries(
            Object.entries(ATRIBUTOS).map(([clave, attr]) => {
                if (!tipo.atributos.includes(clave)) return [clave, null]
                return [clave, attr.input === 'number' ? Number(d[clave]) : d[clave] || attr.defecto]
            }),
        )
        return {
            nombre: d.nombre.trim(),
            tipo: d.tipo,
            precio: Number(d.precio),
            ...atributos,
            activo: Boolean(d.activo),
        }
    }

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
        const uses = useRecetasStore().useOf(id)   // el store se obtiene dentro de la función para evitar dependencias circulares
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