<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSessionStore } from '@/stores/session'
import { ROLES } from '@/utils/catalogo'

const cart = useCartStore()
const session = useSessionStore()
const route = useRoute()
const router = useRouter()

function cambiarRol(e) {
  session.setRol(e.target.value)
  // Si estaba en una ruta de admin y deja de serlo, sácalo de ahí
  if (!session.isAdmin && route.meta.requiresAdmin) router.replace('/')
}
</script>

<template>
  <header class="nav">
    <nav>
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/pizzas/armar">Armar pizza</RouterLink>
      <RouterLink to="/carrito">
        Carrito
        <span v-show="cart.count > 0" class="badge">{{ cart.count }}</span>
      </RouterLink>

      <template v-if="session.isAdmin">
        <RouterLink to="/admin/ingredientes">Ingredientes</RouterLink>
        <RouterLink to="/admin/configuraciones">Configuraciones</RouterLink>
      </template>

      <label class="rol">
        Rol:
        <select :value="session.rol" @change="cambiarRol">
          <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
        </select>
      </label>
    </nav>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>