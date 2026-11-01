<script setup>
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const session = useSessionStore()
</script>

<template>
    <section>
        <p v-if="route.query.acceso === 'denegado'" class="error" role="alert">
            Esa sección es solo para administradores.
        </p>
        <h1>Bienvenido a Pizza Tlaloc, {{ session.usuario?.nombre }}</h1>
        <!-- resto del contenido -->
    </section>
</template>