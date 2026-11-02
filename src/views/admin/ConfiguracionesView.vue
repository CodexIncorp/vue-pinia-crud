<script setup>
import { useRecetasStore } from '@/stores/recetas'
import { useIngredientsStore } from '@/stores/ingredients'
import { TIPOS, PRODUCTO } from '@/utils/catalogo'

const recetas = useRecetasStore()
const ingredients = useIngredientsStore()

// Solo presentación: resuelve un id a su nombre
const nombre = (id) => ingredients.getById(id)?.nombre ?? '(eliminado)'

// Una línea por tipo con lo que eligió la configuración (omite los tipos vacíos)
function lineas(c) {
    return TIPOS.map((t) => {
        const sel = c.selecciones[t.id]
        const ids = t.multiple ? sel : sel ? [sel] : []
        return { id: t.id, etiqueta: ids.length > 1 ? t.plural : t.singular, valor: ids.map(nombre).join(', ') }
    }).filter((l) => l.valor)
}

function eliminar(c) {
    if (confirm(`¿Eliminar la configuración "${c.nombre}"?`)) recetas.remove(c.id)
}
</script>

<template>
    <section>
        <div class="bar">
            <h1>Configuraciones de {{ PRODUCTO.singular }}</h1>
            <RouterLink class="btn primary" :to="{ name: 'configuracion-crear' }">Nueva configuración</RouterLink>
        </div>

        <p v-if="recetas.items.length === 0">No hay configuraciones registradas.</p>

        <ul v-else class="list">
            <li v-for="c in recetas.items" :key="c.id">
                <div class="name">
                    <strong>{{ c.nombre }}</strong>
                    <div v-for="l in lineas(c)" :key="l.id">
                        <small>{{ l.etiqueta }}: {{ l.valor }}</small>
                    </div>
                </div>
                <div class="actions">
                    <RouterLink class="btn" :to="{ name: 'configuracion-editar', params: { id: c.id } }">Editar
                    </RouterLink>
                    <button class="btn danger" @click="eliminar(c)">Eliminar</button>
                </div>
            </li>
        </ul>
    </section>
</template>