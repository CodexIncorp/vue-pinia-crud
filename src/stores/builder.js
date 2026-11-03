import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TIPOS, copiarSeleccion } from '@/utils/catalogo'
import { useIngredientsStore } from './ingredients'
import { useCartStore } from './cart'

export const useBuilderStore = defineStore('builder', () => {
    const selecciones = ref(copiarSeleccion())
    const cantidad = ref(1)
    const recetaActivaId = ref(null)
    const nombreReceta = ref('')

    function iniciarPorDefecto() {
        const ingredients = useIngredientsStore()
        const base = copiarSeleccion()
        for (const t of TIPOS) {
            if (t.obligatorio && !t.multiple) {
                const activos = ingredients.activesByType[t.id]
                if (activos?.length) base[t.id] = activos[0].id
            }
        }
        selecciones.value = base
        cantidad.value = 1
        recetaActivaId.value = null
        nombreReceta.value = ''
    }

    function cargarConfiguracion(receta) {
        if (!receta) return
        const ingredients = useIngredientsStore()
        const copia = copiarSeleccion(receta.selecciones)

        // Si algún ingrediente de la receta fue desactivado por el admin, se filtra o reemplaza
        for (const t of TIPOS) {
            if (t.multiple) {
                copia[t.id] = copia[t.id].filter((id) => ingredients.getById(id)?.activo)
            } else if (copia[t.id] && !ingredients.getById(copia[t.id])?.activo) {
                const reemplazo = ingredients.activesByType[t.id]?.[0]?.id
                copia[t.id] = t.obligatorio ? (reemplazo ?? '') : null
            }
        }

        selecciones.value = copia
        recetaActivaId.value = receta.id
        nombreReceta.value = receta.nombre
    }

    // Se llama cuando el cliente cambia algo a mano: deja de ser la receta cargada
    function personalizar() {
        recetaActivaId.value = null
        nombreReceta.value = ''
    }

    // Ingredientes activos elegidos actualmente
    const elegidos = computed(() => {
        const ingredients = useIngredientsStore()
        const lista = []
        for (const t of TIPOS) {
            const val = selecciones.value[t.id]
            const ids = t.multiple ? (Array.isArray(val) ? val : []) : val ? [val] : []
            for (const id of ids) {
                const ing = ingredients.getById(id)
                if (ing && ing.activo) {
                    lista.push({ ...ing, tipoEtiqueta: t.singular })
                }
            }
        }
        return lista
    })

    const precioUnitario = computed(() =>
        elegidos.value.reduce((acc, ing) => acc + Number(ing.precio || 0), 0)
    )

    const precioTotal = computed(() => precioUnitario.value * cantidad.value)

    // Capas ordenadas de abajo hacia arriba para el visualizador.
    // Recibe una selección cualquiera: la usan el constructor y el formulario de configuraciones.
    //   soloActivos: true  → ignora los ingredientes desactivados (cliente)
    //                false → los muestra (el admin ve la receta completa)
    function capasDe(s, { soloActivos = true } = {}) {
        const ingredients = useIngredientsStore()
        const usable = (i) => Boolean(i) && (!soloActivos || i.activo)

        const pan = ingredients.getById(s.pan)
        const tamano = ingredients.getById(s.tamano)
        const proteina = ingredients.getById(s.proteina)
        const queso = s.queso ? ingredients.getById(s.queso) : null
        const salsas = (s.salsa || []).map((id) => ingredients.getById(id)).filter(usable)
        const extras = (s.extra || [])
            .map((id) => ingredients.getById(id))
            .filter(usable)
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

        const listaCapas = []
        const colorPan = pan?.color || '#d9a05b'

        // 1. Pan inferior (base)
        if (usable(pan)) {
            listaCapas.push({
                uid: `pan-base-${pan.id}`,
                clase: 'capa-pan-base',
                tipoCapa: 'pan-base',
                color: colorPan,
                etiqueta: `Pan ${pan.nombre} (Base)`,
            })
        }

        // 2. Primera mitad de salsas (abajo)
        const mitad = Math.ceil(salsas.length / 2)
        salsas.slice(0, mitad).forEach((salsa, idx) => {
            listaCapas.push({
                uid: `salsa-inf-${salsa.id}-${idx}`,
                clase: 'capa-salsa',
                tipoCapa: 'salsa',
                color: salsa.color || '#c0392b',
                etiqueta: `Salsa ${salsa.nombre}`,
            })
        })

        // 3. Carnes y queso (según el atributo `carnes` del tamaño)
        const numCarnes = tamano?.carnes || 1
        if (usable(proteina)) {
            for (let i = 0; i < numCarnes; i++) {
                listaCapas.push({
                    uid: `carne-${proteina.id}-${i}`,
                    clase: 'capa-carne',
                    tipoCapa: 'proteina',
                    color: proteina.color || '#6e3b1f',
                    etiqueta: `${proteina.nombre} (${i + 1})`,
                })
                if (usable(queso)) {
                    listaCapas.push({
                        uid: `queso-${queso.id}-${i}`,
                        clase: 'capa-queso',
                        tipoCapa: 'queso',
                        color: queso.color || '#f2a900',
                        etiqueta: `Queso ${queso.nombre}`,
                    })
                }
            }
        }

        // 4. Extras ordenados por su atributo `orden`
        extras.forEach((ex) => {
            listaCapas.push({
                uid: `extra-${ex.id}`,
                clase: 'capa-extra',
                tipoCapa: 'extra',
                color: ex.color || '#58b947',
                etiqueta: ex.nombre,
            })
        })

        // 5. Segunda mitad de salsas (arriba)
        salsas.slice(mitad).forEach((salsa, idx) => {
            listaCapas.push({
                uid: `salsa-sup-${salsa.id}-${idx}`,
                clase: 'capa-salsa',
                tipoCapa: 'salsa',
                color: salsa.color || '#e1b12c',
                etiqueta: `Salsa ${salsa.nombre}`,
            })
        })

        // 6. Pan superior (corona)
        if (usable(pan)) {
            listaCapas.push({
                uid: `pan-top-${pan.id}`,
                clase: 'capa-pan-top',
                tipoCapa: 'pan-top',
                color: colorPan,
                etiqueta: `Pan ${pan.nombre} (Corona)`,
                ajonjoli: pan.id === 'p1' || pan.id === 'p3' || pan.nombre.toLowerCase().includes('ajonjolí'),
            })
        }

        return listaCapas
    }

    // Capas de la hamburguesa que se está armando
    const capas = computed(() => capasDe(selecciones.value))

    function validate() {
        for (const t of TIPOS) {
            if (!t.obligatorio) continue
            const v = selecciones.value[t.id]
            const vacio = t.multiple ? !v?.length : !v
            if (vacio) return `Falta elegir: ${t.singular.toLowerCase()}.`
        }
        const cant = Number(cantidad.value)
        if (!Number.isInteger(cant) || cant < 1) {
            return 'La cantidad debe ser un número entero mayor o igual a 1.'
        }
        return null
    }

    function agregarAlCarrito() {
        const error = validate()
        if (error) return { ok: false, error }

        const cart = useCartStore()
        return cart.addCustom({
            nombre: nombreReceta.value ? `Burger ${nombreReceta.value}` : '',
            selecciones: copiarSeleccion(selecciones.value),
            cantidad: Number(cantidad.value),
            precioUnitario: precioUnitario.value,
            resumen: elegidos.value.map((i) => i.nombre),
        })
    }

    return {
        selecciones,
        cantidad,
        recetaActivaId,
        nombreReceta,
        elegidos,
        precioUnitario,
        precioTotal,
        capas,
        capasDe,
        iniciarPorDefecto,
        cargarConfiguracion,
        agregarAlCarrito,
        personalizar,
    }
})