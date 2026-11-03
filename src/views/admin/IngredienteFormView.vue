<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIngredientsStore } from '@/stores/ingredients'
import { TIPOS, ATRIBUTOS, tipoPorId } from '@/utils/catalogo'

const props = defineProps({ id: String })
const router = useRouter()
const ingredients = useIngredientsStore()

const isEdit = computed(() => Boolean(props.id))
const defectos = Object.fromEntries(
  Object.entries(ATRIBUTOS).map(([clave, a]) => [clave, a.defecto])
)
const form = ref({ nombre: '', tipo: 'extra', precio: 0, activo: true, ...defectos })
const error = ref('')

// Atributos que pide el tipo elegido (color, orden, carnes…), tomados de TIPOS
const atributos = computed(() =>
  tipoPorId(form.value.tipo).atributos.map((clave) => ({ clave, ...ATRIBUTOS[clave] }))
)

// Sincronizar formulario si cambia el parámetro :id de la ruta
watch(
  () => props.id,
  (newId) => {
    error.value = ''
    if (newId) {
      const exist = ingredients.getById(newId)
      if (exist) {
        form.value = { ...defectos, ...exist }
      } else {
        router.replace({ name: 'ingredientes' })
      }
    } else {
      form.value = { nombre: '', tipo: 'extra', precio: 0, activo: true, ...defectos }
    }
  },
  { immediate: true }
)

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

      <label v-for="a in atributos" :key="a.clave">
        {{ a.etiqueta }}<small v-if="a.ayuda"> ({{ a.ayuda }})</small>
        <input v-if="a.input === 'color'" v-model="form[a.clave]" type="color" />
        <input v-else v-model.number="form[a.clave]" type="number" :min="a.min" step="1" required />
      </label>

      <!-- Vista previa de cómo se verá la capa de este ingrediente -->
      <div v-if="atributos.some((a) => a.clave === 'color')" class="preview-ing">
        <small>Vista previa de la capa:</small>
        <div class="muestra-capa" :style="{ backgroundColor: form.color }">
          <span>{{ form.nombre || 'Ingrediente' }}</span>
        </div>
      </div>

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

<style scoped>
.preview-ing {
  margin: 0.5rem 0;
  padding: 0.75rem;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.muestra-capa {
  width: 200px;
  height: 22px;
  border-radius: 10px;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>