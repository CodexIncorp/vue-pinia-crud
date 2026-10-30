import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const KEY = 'cart';

export const useCartStore = defineStore('cart', () => {
    //state
    const items = ref(JSON.parse(localStorage.getItem(KEY) ?? '[]'))

    //getters
    const total = computed(() =>
        items.value.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    )
    const count = computed(() =>
        items.value.reduce((acc, i) => acc + i.cantidad, 0)
    )

    //actions
    function add(product) {
        const existing = items.value.find((i) => i.id === product.id)
        if (existing) {
            existing.cantidad++
        } else {
            items.value.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
            })
        }
    }

    function remove(id) {
        items.value = items.value.filter((id) => i.id !== id)
    }

    function clear() {
        items.value = []
    }

    //persistencia
    watch(items, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

    return { items, total, count, add, remove, clear }
});
