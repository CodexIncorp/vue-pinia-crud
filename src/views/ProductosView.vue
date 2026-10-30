<script setup>
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'

const products = useProductsStore();
const cart = useCartStore();

function eliminar(p) {
    if (confirm(`¿Eliminar "${p.nombre}"?`)) products.remove(p.id);
}
</script>

<template>
    <section>
        <div class="bar">
            <h1>Productos</h1>
            <RouterLink class="btn" to="/productos/crear">Nuevo producto</RouterLink>
        </div>

        <p v-if="products.items.length === 0">No hay productos registrados.</p>

        <ul v-else class="list">
            <li v-for="p in products.items" :key="p.id">
                <span class="name">{{ p.nombre }}</span>
                <strong>{{ formatPrice(p.precio) }}</strong>
                <div class="actions">
                    <RouterLink class="btn" :to="{ name: 'producto-editar', params: { id: p.id } }">
                        Editar
                    </RouterLink>
                    <button class="btn danger" @click="eliminar(p)">Eliminar</button>
                    <button class="btn primary" @click="cart.add(p)">Agregar al carrito</button>
                </div>
            </li>
        </ul>
    </section>
</template>
