import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useCartStore } from './cart'

const KEY = 'products'

const seed = [
    { id: crypto.randomUUID(), nombre: 'Teclado mecánico', precio: 899 },
    { id: crypto.randomUUID(), nombre: 'Mouse inalámbrico', precio: 349.5 },
    { id: crypto.randomUUID(), nombre: 'Monitor 24"', precio: 2899 },
];

export const useProductsStore = defineStore('products', () => {
    const items = ref(JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? seed)

    function getById(id) {
        return items.value.find((p) => p.id === id)
    }

    function add({ nombre, precio }) {
        items.value.push({
            id: crypto.randomUUID(),
            nombre: nombre.trim(),
            precio: Number(precio),
        })
    }

    function update(id, { nombre, precio }) {
        const p = getById(id)
        if (p) {
            p.nombre = nombre.trim()
            p.precio = Number(precio)
        }
    }

    function remove(id) {
        items.value = items.value.filter((p) => p.id !== id)
        useCartStore.remove(id) //coherencia: si se borral producto, sale del carrito
    }

    watch(items, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })
    return { items, getById, add, update }
});
