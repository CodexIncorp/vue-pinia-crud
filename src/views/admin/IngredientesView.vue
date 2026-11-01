<script setup>
import { ref } from 'vue'
import { useIngredientsStore } from '@/stores/ingredients'
import { TIPOS } from '@/utils/catalogo'
import { formatPrice } from '@/utils/format'

const ingredients = useIngredientsStore()
const mensaje = ref('')

function eliminar(i) {
    if (!confirm(`¿Eliminar "${i.nombre}"?`)) return
    const res = ingredients.remove(i.id)
    mensaje.value = res.ok ? '' : res.error
}
</script>

<template>
    <section>
        <div class="bar">
            <h1>Ingredientes</h1>
            <RouterLink class="btn primary" :to="{ name: 'ingrediente-crear' }">Nuevo ingrediente</RouterLink>
        </div>

        <p v-if="mensaje" class="error" role="alert">{{ mensaje }}</p>

        <div v-for="t in TIPOS" :key="t.id">
            <h2>{{ t.plural }}</h2>

            <p v-if="ingredients.byType[t.id].length === 0">Sin ingredientes en esta categoría.</p>

            <ul v-else class="list">
                <li v-for="i in ingredients.byType[t.id]" :key="i.id" :class="{ inactivo: !i.activo }">
                    <span v-if="i.color" class="swatch" :style="{ background: i.color }"></span>
                    <span class="name">{{ i.nombre }}</span>
                    <strong>{{ formatPrice(i.precio) }}</strong>
                    <div class="actions">
                        <button class="btn" @click="ingredients.toggleActive(i.id)">
                            {{ i.activo ? 'Desactivar' : 'Activar' }}
                        </button>
                        <RouterLink class="btn" :to="{ name: 'ingrediente-editar', params: { id: i.id } }">Editar
                        </RouterLink>
                        <button class="btn danger" @click="eliminar(i)">Eliminar</button>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>