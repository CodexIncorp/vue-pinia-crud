<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'

const cart = useCartStore()
const pedidoExitoso = ref(false)

function finalizarCompra() {
  pedidoExitoso.value = true
  cart.clear()
}
</script>

<template>
  <section>
    <h1>Resumen del pedido</h1>

    <div
      v-if="pedidoExitoso"
      class="aviso"
      style="padding: 1rem; border: 1px solid #4caf50; border-radius: 8px; margin-bottom: 1rem;"
    >
      <strong>¡Pedido enviado a cocina!</strong> Tu hamburguesa se está preparando.
      <div style="margin-top: 0.75rem;">
        <RouterLink class="btn primary" to="/armar">Armar otra hamburguesa</RouterLink>
      </div>
    </div>

    <p v-else-if="cart.items.length === 0">
      Tu carrito está vacío.
      <RouterLink to="/armar">Ir a armar hamburguesa</RouterLink>
    </p>

    <template v-else>
      <ul class="list">
        <li v-for="i in cart.items" :key="i.id">
          <span class="name">{{ i.nombre }}</span>
          <strong>{{ formatPrice(i.precio * i.cantidad) }}</strong>
          <div class="actions">
            <button class="btn" @click="cart.decrement(i.id)">-</button>
            <span>{{ i.cantidad }}</span>
            <button class="btn" @click="cart.add(i)">+</button>
            <button class="btn danger" @click="cart.remove(i.id)">Quitar</button>
          </div>
        </li>
      </ul>

      <p class="total">
        Total: <strong>{{ formatPrice(cart.total) }}</strong>
      </p>
      <div class="actions">
        <button class="btn primary" @click="finalizarCompra">Confirmar pedido</button>
        <button class="btn danger" @click="cart.clear()">Vaciar carrito</button>
      </div>
    </template>
  </section>
</template>