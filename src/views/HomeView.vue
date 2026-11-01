<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <section>
        <p v-if="route.query.acceso === 'denegado'" class="error" role="alert">
            Esa sección es solo para administradores.
        </p>
        <h1>Bienvenido a Pizza Tlaloc</h1>
        <!-- resto del contenido -->
    </section>
</template>