<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useIngredientsStore } from '@/stores/ingredients'
import { useRecetasStore } from '@/stores/recetas'
import { useBuilderStore } from '@/stores/builder'
import { TIPOS, PRODUCTO } from '@/utils/catalogo'
import { formatPrice } from '@/utils/format'

const router = useRouter()
const ingredients = useIngredientsStore()
const recetas = useRecetasStore()
const builder = useBuilderStore()

const error = ref('')

if (!builder.selecciones.tamano || !builder.selecciones.pan) {
  builder.iniciarPorDefecto()
}

const descripcionAria = computed(() =>
  builder.capas.length
    ? 'Hamburguesa en capas: ' + builder.capas.map((c) => c.etiqueta).join(', ')
    : 'Hamburguesa sin ingredientes'
)

function elegirReceta(receta) {
  error.value = ''
  builder.cargarConfiguracion(receta)
}

function confirmarArmado() {
  error.value = ''
  const res = builder.agregarAlCarrito()
  if (!res.ok) {
    error.value = res.error
    return
  }
  router.push({ name: 'carrito' })
}
</script>

<template>
  <section class="armador-page">
    <div class="bar">
      <h1>Armar {{ PRODUCTO.singular }}</h1>
      <strong class="precio-badge">{{ formatPrice(builder.precioTotal) }}</strong>
    </div>

    <!-- Recetas rápidas preconfiguradas por el admin -->
    <div v-if="recetas.items.length" class="presets">
      <span>Cargar configuración base:</span>
      <div class="preset-btns">
        <button
          v-for="r in recetas.items"
          :key="r.id"
          type="button"
          class="btn"
          :class="{ primary: builder.recetaActivaId === r.id }"
          @click="elegirReceta(r)"
        >
          {{ r.nombre }}
        </button>
        <button type="button" class="btn" @click="builder.iniciarPorDefecto()">
          Reiniciar
        </button>
      </div>
    </div>

    <div class="armador-grid">
      <!-- COLUMNA IZQUIERDA: Solo select y checkbox para personalización (Regla 4) -->
      <form class="controles-panel" @submit.prevent="confirmarArmado">
        <template v-for="t in TIPOS" :key="t.id">
          <fieldset v-if="t.multiple" class="grupo-ing">
            <legend>{{ t.plural }}</legend>
            <div class="opciones-grid">
              <label
                v-for="i in ingredients.activesByType[t.id]"
                :key="i.id"
                class="opcion-card"
                :class="{ seleccionada: builder.selecciones[t.id].includes(i.id) }"
              >
                <input
                  v-model="builder.selecciones[t.id]"
                  type="checkbox"
                  :value="i.id"
                  @change="builder.recetaActivaId = null"
                />
                <span v-if="i.color" class="dot" :style="{ background: i.color }"></span>
                <span class="ing-info">
                  <strong>{{ i.nombre }}</strong>
                  <small>{{ i.precio > 0 ? `+${formatPrice(i.precio)}` : 'Incluido' }}</small>
                </span>
              </label>
            </div>
          </fieldset>

          <label v-else class="select-label">
            <span>
              {{ t.singular }}
              <small v-if="t.obligatorio">(Obligatorio)</small>
            </span>
            <select
              v-model="builder.selecciones[t.id]"
              :required="t.obligatorio"
              @change="builder.recetaActivaId = null"
            >
              <option v-if="!t.obligatorio" :value="null">
                Sin {{ t.singular.toLowerCase() }} ($0.00)
              </option>
              <option v-else disabled value="">Elige…</option>
              <option
                v-for="i in ingredients.activesByType[t.id]"
                :key="i.id"
                :value="i.id"
              >
                {{ i.nombre }} ({{ i.precio > 0 ? `+${formatPrice(i.precio)}` : 'Incluido' }})
              </option>
            </select>
          </label>
        </template>

        <label class="select-label">
          Cantidad
          <input v-model.number="builder.cantidad" type="number" min="1" step="1" required />
        </label>

        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <button class="btn primary btn-comprar" type="submit">
          Agregar al carrito · {{ formatPrice(builder.precioTotal) }}
        </button>
      </form>

      <!-- COLUMNA DERECHA: Visualizador de Capas en Vivo -->
      <aside class="preview-panel">
        <h2>Vista previa en vivo</h2>
        <p class="hint">Las capas se apilan en el orden real de preparación</p>

        <div class="escenario-burger" role="img" :aria-label="descripcionAria">
          <TransitionGroup name="apilar" tag="div" class="pila-burger">
            <div
              v-for="capa in builder.capas"
              :key="capa.uid"
              class="capa"
              :class="capa.clase"
              :style="{ '--color-capa': capa.color }"
              :title="capa.etiqueta"
            >
              <div v-if="capa.ajonjoli" class="semillas">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <span class="capa-tag">{{ capa.etiqueta }}</span>
            </div>
          </TransitionGroup>
          <div class="plato"></div>
        </div>

        <div class="resumen-capas">
          <strong>Desglose ({{ builder.elegidos.length }} ingredientes):</strong>
          <ul>
            <li v-for="ing in builder.elegidos" :key="ing.id">
              <span><small>{{ ing.tipoEtiqueta }}:</small> {{ ing.nombre }}</span>
              <span>{{ formatPrice(ing.precio) }}</span>
            </li>
          </ul>
          <p class="unitario">
            Precio unitario: <strong>{{ formatPrice(builder.precioUnitario) }}</strong>
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.armador-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.precio-badge {
  font-size: 1.4rem;
  padding: 0.35rem 0.85rem;
  background: #111;
  color: #fff;
  border-radius: 6px;
}

.presets {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.preset-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.armador-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .armador-grid {
    grid-template-columns: 1fr;
  }
}

.controles-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.select-label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
}

.select-label select,
.select-label input {
  padding: 0.55rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.grupo-ing {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.85rem;
}

.opciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.opcion-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s, background-color 0.15s;
}

.opcion-card.seleccionada {
  border-color: #111;
  background-color: #f3f4f6;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

.ing-info {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.preview-panel {
  position: sticky;
  top: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1.25rem;
  background: #fafafa;
  text-align: center;
}

.escenario-burger {
  min-height: 290px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 2rem 1rem 1rem;
}

.pila-burger {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  width: 100%;
  max-width: 280px;
  gap: 3px;
}

.capa {
  position: relative;
  background-color: var(--color-capa, #ccc);
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capa-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
  white-space: nowrap;
}

.capa:hover .capa-tag {
  opacity: 1;
}

.capa-pan-top {
  width: 210px;
  height: 52px;
  border-radius: 105px 105px 14px 14px;
  margin-bottom: 2px;
}

.capa-pan-base {
  width: 205px;
  height: 28px;
  border-radius: 8px 8px 22px 22px;
  margin-top: 2px;
}

.capa-carne {
  width: 225px;
  height: 24px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.capa-queso {
  width: 232px;
  height: 9px;
  border-radius: 4px;
}

.capa-salsa {
  width: 185px;
  height: 7px;
  border-radius: 10px;
}

.capa-extra {
  width: 200px;
  height: 13px;
  border-radius: 8px;
}

.semillas {
  position: absolute;
  top: 10px;
  width: 75%;
  display: flex;
  justify-content: space-around;
  pointer-events: none;
}

.semillas span {
  width: 8px;
  height: 4px;
  background: #fff8dc;
  border-radius: 50%;
  transform: rotate(-15deg);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.semillas span:nth-child(even) {
  transform: rotate(20deg) translateY(5px);
}

.plato {
  width: 260px;
  height: 12px;
  background: #d1d5db;
  border-radius: 0 0 40px 40px;
  margin-top: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.12);
}

.apilar-enter-active,
.apilar-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.apilar-enter-from,
.apilar-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.85);
}

.resumen-capas {
  margin-top: 1rem;
  text-align: left;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  font-size: 0.9rem;
}

.resumen-capas ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.resumen-capas li {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
  border-bottom: 1px dashed #eee;
}

.unitario {
  margin: 0.5rem 0 0;
  text-align: right;
}

.btn-comprar {
  padding: 0.85rem;
  font-size: 1.05rem;
}
</style>