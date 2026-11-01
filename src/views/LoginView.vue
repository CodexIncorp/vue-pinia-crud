<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { destinoSeguro } from '@/utils/navegacion'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const form = ref({ email: '', password: '' })
const error = ref('')
const vFocus = { mounted: (el) => el.focus() }

function terminar(res) {
    if (!res.ok) {
        error.value = res.error
        return
    }
    router.push(destinoSeguro(route.query.redirect))
}

async function entrar() {
    error.value = ''
    terminar(await session.iniciarSesion(form.value.email, form.value.password))
}

async function entrarDemo(id) {
    error.value = ''
    terminar(await session.iniciarSesionDemo(id))
}
</script>

<template>
    <section class="auth">
        <h1>Inicia sesión</h1>
        <p class="hint">Entra con tu cuenta <strong>Tlaloc ID</strong> para armar tu pizza.</p>

        <form @submit.prevent="entrar">
            <label>
                Correo electrónico
                <input v-focus v-model="form.email" type="email" autocomplete="username" required />
            </label>

            <label>
                Contraseña
                <input v-model="form.password" type="password" autocomplete="current-password" required />
            </label>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <button class="btn primary" type="submit" :disabled="session.cargando">
                {{ session.cargando ? 'Entrando…' : 'Iniciar sesión' }}
            </button>
        </form>

        <p>
            ¿No tienes cuenta?
            <RouterLink :to="{ name: 'registro', query: { redirect: route.query.redirect } }">
                Crear cuenta
            </RouterLink>
        </p>

        <div class="demo">
            <h2>Acceso rápido de demostración</h2>
            <p class="hint">Cuentas ficticias sin contraseña para probar los roles.</p>
            <div class="actions">
                <button v-for="c in session.cuentasDemo" :key="c.id" class="btn" :disabled="session.cargando"
                    @click="entrarDemo(c.id)">
                    {{ c.nombre }} <small>({{ c.rol }})</small>
                </button>
            </div>
        </div>
    </section>
</template>