<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSessionStore } from '@/stores/session'

const cart = useCartStore()
const session = useSessionStore()
const router = useRouter()

function salir() {
  session.cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="nav">
    <nav>
      <span class="brand">Pizza Tlaloc</span>

      <template v-if="session.autenticado">
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/pizzas/armar">Armar pizza</RouterLink>
        <RouterLink to="/carrito">
          Carrito
          <span v-show="cart.count > 0" class="badge">{{ cart.count }}</span>
        </RouterLink>

        <template v-if="session.esAdmin">
          <RouterLink to="/admin/ingredientes">Ingredientes</RouterLink>
          <RouterLink to="/admin/configuraciones">Configuraciones</RouterLink>
        </template>

        <div class="usuario">
          <span>{{ session.usuario.nombre }} <small>({{ session.rol }})</small></span>
          <button class="btn" @click="salir">Cerrar sesión</button>
        </div>
      </template>
    </nav>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>