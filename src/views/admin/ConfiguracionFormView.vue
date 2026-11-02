<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecetasStore } from '@/stores/recetas'
import { useIngredientsStore } from '@/stores/ingredients'
import { TIPOS, copiarSeleccion } from '@/utils/catalogo'

const props = defineProps({ id: String })
const router = useRouter()
const recetas = useRecetasStore()
const ingredients = useIngredientsStore()

const isEdit = computed(() => !!props.id)
const form = ref({ nombre: '', selecciones: copiarSeleccion() })
const error = ref('')

if (isEdit.value) {
    const exist = recetas.getById(props.id)
    if (exist) form.value = { nombre: exist.nombre, selecciones: copiarSeleccion(exist.selecciones) }
    else router.replace({ name: 'configuraciones' })
}

function guardar() {
    const res = isEdit.value
        ? recetas.update(props.id, form.value)
        : recetas.add(form.value)
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

            <!-- Un control por tipo del catálogo: casillas si es múltiple, select si no -->
            <template v-for="t in TIPOS" :key="t.id">
                <fieldset v-if="t.multiple">
                    <legend>{{ t.plural }}</legend>
                    <label v-for="i in ingredients.byType[t.id]" :key="i.id" class="check">
                        <input v-model="form.selecciones[t.id]" type="checkbox" :value="i.id" />
                        {{ i.nombre }}{{ i.activo ? '' : ' (inactivo)' }}
                    </label>
                </fieldset>

                <label v-else>
                    {{ t.singular }}
                    <select v-model="form.selecciones[t.id]" :required="t.obligatorio">
                        <option v-if="!t.obligatorio" :value="null">Sin {{ t.singular.toLowerCase() }}</option>
                        <option v-else disabled value="">Elige…</option>
                        <option v-for="i in ingredients.byType[t.id]" :key="i.id" :value="i.id">
                            {{ i.nombre }}{{ i.activo ? '' : ' (inactivo)' }}
                        </option>
                    </select>
                </label>
            </template>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <div class="actions">
                <button class="btn primary" type="submit">Guardar</button>
                <RouterLink class="btn" :to="{ name: 'configuraciones' }">Cancelar</RouterLink>
            </div>
        </form>
    </section>
</template>