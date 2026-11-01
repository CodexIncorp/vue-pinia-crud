<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { destinoSeguro } from '@/utils/navegacion'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const form = ref({ nombre: '', email: '', password: '', confirmacion: '' })
const error = ref('')
const vFocus = { mounted: (el) => el.focus() }

async function crear() {
    error.value = ''
    const res = await session.registrar(form.value)
    if (!res.ok) {
        error.value = res.error
        return
    }
    router.push(destinoSeguro(route.query.redirect))
}
</script>

<template>
    <section class="auth">
        <h1>Crear cuenta</h1>
        <p class="aviso">
            <strong>No uses una contraseña que uses en otros sitios.</strong>
        </p>

        <form @submit.prevent="crear">
            <label>
                Nombre
                <input v-focus v-model="form.nombre" type="text" autocomplete="name" required />
            </label>

            <label>
                Correo electrónico
                <input v-model="form.email" type="email" autocomplete="username" required />
            </label>

            <label>
                Contraseña (mínimo 8 caracteres)
                <input v-model="form.password" type="password" minlength="8" autocomplete="new-password" required />
            </label>

            <label>
                Confirma la contraseña
                <input v-model="form.confirmacion" type="password" autocomplete="new-password" required />
            </label>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <div class="actions">
                <button class="btn primary" type="submit" :disabled="session.cargando">
                    {{ session.cargando ? 'Creando…' : 'Crear cuenta' }}
                </button>
                <RouterLink class="btn" :to="{ name: 'login', query: { redirect: route.query.redirect } }">
                    Ya tengo cuenta
                </RouterLink>
            </div>
        </form>
    </section>
</template>