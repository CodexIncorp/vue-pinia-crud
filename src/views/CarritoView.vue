<script setup>
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'

const cart = useCartStore();
</script>

<template>
    <section>
        <h1>Resumen del pedido</h1>

        <p v-if="cart.items.length === 0">
            Tu carrito está vacío.
            <RouterLink to="/productos">Ir a productos</RouterLink>
        </p>

        <template v-else>
            <ul class="list">
                <li v-for="i in cart.items" :key="i.id">
                    <span class="name">{{ i.nombre }}×{{ i.cantidad }}</span>
                    <strong>{{ formatPrice(i.precio * i.cantidad) }}</strong>
                    <button class="btn danger" @click="cart.remove(i.id)">Quitar</button>
                </li>
            </ul>

            <p class="total">Total: <strong>{{ formatPrice(cart.total) }}</strong></p>
            <button class="btn danger" @click="cart.clear()">Vaciar carrito</button>
        </template>
    </section>
</template>
