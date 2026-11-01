<script setup>
import { usePizzaConfigsStore } from '@/stores/pizzaConfigs'
import { useIngredientsStore } from '@/stores/ingredients'

const configs = usePizzaConfigsStore()
const ingredients = useIngredientsStore()

// Solo presentación: resuelve un id a su nombre
const nombre = (id) => ingredients.getById(id)?.nombre ?? '(eliminado)'

function eliminar(c) {
    if (confirm(`¿Eliminar la configuración "${c.nombre}"?`)) configs.remove(c.id)
}
</script>

<template>
    <section>
        <div class="bar">
            <h1>Configuraciones de pizza</h1>
            <RouterLink class="btn primary" :to="{ name: 'configuracion-crear' }">Nueva configuración</RouterLink>
        </div>

        <p v-if="configs.items.length === 0">No hay configuraciones registradas.</p>

        <ul v-else class="list">
            <li v-for="c in configs.items" :key="c.id">
                <div class="name">
                    <strong>{{ c.nombre }}</strong>
                    <div>
                        {{ nombre(c.tamano) }} · {{ nombre(c.masa) }}
                        <template v-if="c.salsa"> · Salsa {{ nombre(c.salsa).toLowerCase() }}</template>
                        <template v-if="c.queso"> · {{ nombre(c.queso) }}</template>
                    </div>
                    <small v-if="c.toppings.length">{{ c.toppings.map(nombre).join(', ') }}</small>
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