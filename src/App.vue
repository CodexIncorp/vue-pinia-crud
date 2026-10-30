<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore();
</script>

<template>
  <header class="nav">
    <nav>
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/productos">Productos</RouterLink>
      <RouterLink to="/carrito">
        Carrito
        <span v-show="cart.count > 0" class="badge">{{ cart.count }}</span>
      </RouterLink>
    </nav>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>
