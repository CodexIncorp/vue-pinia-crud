<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecetasStore } from '@/stores/recetas'
import { useIngredientsStore } from '@/stores/ingredients'
import { TIPOS, copiarSeleccion } from '@/utils/catalogo'

const props = defineProps({ id: String })
const router = useRouter()
const recetas = useRecetasStore()
const ingredients = useIngredientsStore()

const isEdit = computed(() => Boolean(props.id))
const form = ref({ nombre: '', selecciones: copiarSeleccion() })
const error = ref('')

watch(
  () => props.id,
  (newId) => {
    error.value = ''
    if (newId) {
      const exist = recetas.getById(newId)
      if (exist) {
        form.value = { nombre: exist.nombre, selecciones: copiarSeleccion(exist.selecciones) }
      } else {
        router.replace({ name: 'configuraciones' })
      }
    } else {
      form.value = { nombre: '', selecciones: copiarSeleccion() }
    }
  },
  { immediate: true }
)

// Capas para que el admin también previsualice la configuración
const capasPreview = computed(() => {
  const s = form.value.selecciones
  const pan = ingredients.getById(s.pan)
  const tamano = ingredients.getById(s.tamano)
  const proteina = ingredients.getById(s.proteina)
  const queso = s.queso ? ingredients.getById(s.queso) : null
  const salsas = (s.salsa || []).map((id) => ingredients.getById(id)).filter(Boolean)
  const extras = (s.extra || [])
    .map((id) => ingredients.getById(id))
    .filter(Boolean)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  const capas = []
  const colorPan = pan?.color || '#d9a05b'

  if (pan) capas.push({ uid: 'pan-base', clase: 'pan-base', color: colorPan })
  salsas.slice(0, Math.ceil(salsas.length / 2)).forEach((sl, i) => {
    capas.push({ uid: `s-inf-${i}`, clase: 'salsa', color: sl.color || '#c0392b' })
  })
  const numCarnes = tamano?.carnes || 1
  if (proteina) {
    for (let i = 0; i < numCarnes; i++) {
      capas.push({ uid: `c-${i}`, clase: 'carne', color: proteina.color || '#6e3b1f' })
      if (queso) capas.push({ uid: `q-${i}`, clase: 'queso', color: queso.color || '#f2a900' })
    }
  }
  extras.forEach((ex) => {
    capas.push({ uid: `ex-${ex.id}`, clase: 'extra', color: ex.color || '#58b947' })
  })
  salsas.slice(Math.ceil(salsas.length / 2)).forEach((sl, i) => {
    capas.push({ uid: `s-sup-${i}`, clase: 'salsa', color: sl.color || '#e1b12c' })
  })
  if (pan) capas.push({ uid: 'pan-top', clase: 'pan-top', color: colorPan })

  return capas
})

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

    <div class="admin-grid">
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

      <!-- Mini previsualizador de la receta -->
      <aside class="mini-preview">
        <strong>Vista previa de receta</strong>
        <div class="pila">
          <div
            v-for="c in capasPreview"
            :key="c.uid"
            class="capa"
            :class="c.clase"
            :style="{ backgroundColor: c.color }"
          ></div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.admin-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 680px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }
}

.mini-preview {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  background: #fafafa;
}

.pila {
  min-height: 180px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  padding-top: 1rem;
}

.capa {
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.2);
}

.pan-top {
  width: 140px;
  height: 34px;
  border-radius: 70px 70px 10px 10px;
}

.pan-base {
  width: 136px;
  height: 20px;
  border-radius: 6px 6px 14px 14px;
}

.carne {
  width: 150px;
  height: 16px;
  border-radius: 10px;
}

.queso {
  width: 154px;
  height: 6px;
  border-radius: 3px;
}

.salsa {
  width: 120px;
  height: 5px;
  border-radius: 5px;
}

.extra {
  width: 132px;
  height: 9px;
  border-radius: 5px;
}
</style>