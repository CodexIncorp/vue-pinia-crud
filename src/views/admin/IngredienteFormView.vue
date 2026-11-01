<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useIngredientsStore } from '@/stores/ingredients'
import { TIPOS } from '@/utils/catalogo'

const props = defineProps({ id: String })
const router = useRouter()
const ingredients = useIngredientsStore()

const isEdit = computed(() => !!props.id)
const form = ref({ nombre: '', tipo: 'topping', precio: 0, color: '#cccccc', activo: true })
const error = ref('')

if (isEdit.value) {
    const exist = ingredients.getById(props.id)
    if (exist) form.value = { ...exist }
    else router.replace({ name: 'ingredientes' })
}

function save() {
    const res = isEdit.value
        ? ingredients.update(props.id, form.value)
        : ingredients.add(form.value)
    if (!res.ok) {
        error.value = res.error
        return
    }
    router.push({ name: 'ingredientes' })
}
</script>

<template>
    <section>
        <h1>{{ isEdit ? 'Editar ingrediente' : 'Crear ingrediente' }}</h1>

        <form @submit.prevent="save">
            <label>
                Nombre
                <input v-model="form.nombre" type="text" required />
            </label>

            <label>
                Tipo
                <select v-model="form.tipo" :disabled="isEdit">
                    <option v-for="t in TIPOS" :key="t.id" :value="t.id">{{ t.singular }}</option>
                </select>
            </label>

            <label>
                Precio
                <input v-model.number="form.precio" type="number" min="0" step="0.01" required />
            </label>

            <label v-if="form.tipo !== 'tamano'">
                Color (para la vista previa)
                <input v-model="form.color" type="color" />
            </label>

            <label class="check">
                <input v-model="form.activo" type="checkbox" />
                Disponible para los clientes
            </label>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <div class="actions">
                <button class="btn primary" type="submit">Guardar</button>
                <RouterLink class="btn" :to="{ name: 'ingredientes' }">Cancelar</RouterLink>
            </div>
        </form>
    </section>
</template>