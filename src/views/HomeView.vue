<script setup>
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { MARCA, PRODUCTO } from '@/utils/catalogo'

const route = useRoute()
const session = useSessionStore()
</script>

<template>
  <section class="home">
    <p v-if="route.query.acceso === 'denegado'" class="error" role="alert">
      Esa sección es solo para administradores.
    </p>

    <h1>Bienvenido a {{ MARCA }}, {{ session.usuario?.nombre }}</h1>
    <p>
      Diseña tu {{ PRODUCTO.singular }} eligiendo el pan, proteínas, quesos, salsas y extras con vista previa en capas.
    </p>

    <div class="actions" style="margin-top: 1.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <RouterLink class="btn primary" to="/armar">
        Armar mi {{ PRODUCTO.singular }}
      </RouterLink>
      <RouterLink class="btn" to="/carrito">
        Ver carrito
      </RouterLink>
      <template v-if="session.esAdmin">
        <RouterLink class="btn" to="/admin/ingredientes">
          Administrar Ingredientes
        </RouterLink>
        <RouterLink class="btn" to="/admin/configuraciones">
          Administrar Configuraciones
        </RouterLink>
      </template>
    </div>
  </section>
</template>