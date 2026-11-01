<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePizzaConfigsStore } from '@/stores/pizzaConfigs'
import { useIngredientsStore } from '@/stores/ingredients'

const props = defineProps({ id: String })
const router = useRouter()
const configs = usePizzaConfigsStore()
const ingredients = useIngredientsStore()

const isEdit = computed(() => !!props.id)
const form = ref({ nombre: '', tamano: '', masa: '', salsa: null, queso: null, toppings: [] })
const error = ref('')

const fields = [
    { clave: 'tamano', etiqueta: 'Tamaño', opcional: false },
    { clave: 'masa', etiqueta: 'Masa', opcional: false },
    { clave: 'salsa', etiqueta: 'Salsa', opcional: true },
    { clave: 'queso', etiqueta: 'Queso', opcional: true },
]

if (isEdit.value) {
    const exist = configs.getById(props.id)
    if (exist) form.value = { ...exist, toppings: [...exist.toppings] }
    else router.replace({ name: 'configuraciones' })
}

function guardar() {
    const res = isEdit.value
        ? configs.update(props.id, form.value)
        : configs.add(form.value)
    if (!res.ok) {
        error.value = res.error
        return
    }
    router.push({ name: 'configuraciones' })
}
</script>

<template>
    <section>
        <h1>{{ isEdit ? 'Editar configuración' : 'Crear configuración' }}</h1>

        <form @submit.prevent="guardar">
            <label>
                Nombre
                <input v-model="form.nombre" type="text" required />
            </label>

            <label v-for="c in fields" :key="c.clave">
                {{ c.etiqueta }}
                <select v-model="form[c.clave]" :required="!c.opcional">
                    <option v-if="c.opcional" :value="null">Sin {{ c.etiqueta.toLowerCase() }}</option>
                    <option v-else disabled value="">Elige…</option>
                    <option v-for="i in ingredients.byType[c.clave]" :key="i.id" :value="i.id">
                        {{ i.nombre }}{{ i.activo ? '' : ' (inactivo)' }}
                    </option>
                </select>
            </label>

            <fieldset>
                <legend>Toppings</legend>
                <label v-for="t in ingredients.byType.topping" :key="t.id" class="check">
                    <input v-model="form.toppings" type="checkbox" :value="t.id" />
                    {{ t.nombre }}{{ t.activo ? '' : ' (inactivo)' }}
                </label>
            </fieldset>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <div class="actions">
                <button class="btn primary" type="submit">Guardar</button>
                <RouterLink class="btn" :to="{ name: 'configuraciones' }">Cancelar</RouterLink>
            </div>
        </form>
    </section>
</template>