// Constantes compartidas

// Identidad del producto: lo único que cambia en la interfaz si el tema cambia
export const MARCA = 'Tlaloc Burger'
export const PRODUCTO = { singular: 'hamburguesa', plural: 'hamburguesas' }

// Atributos opcionales que puede tener un ingrediente según su tipo.
// Un tipo declara cuáles usa en `atributos`; el formulario y el store los derivan de aquí.
export const ATRIBUTOS = {
    color: { etiqueta: 'Color (para la vista previa)', input: 'color', defecto: '#cccccc' },
    orden: { etiqueta: 'Orden en la pila', ayuda: 'menor = más abajo', input: 'number', defecto: 0, min: 0 },
    carnes: { etiqueta: 'Número de carnes', input: 'number', defecto: 1, min: 1 },
}

// Esquema del producto. Los formularios, las validaciones y los stores se derivan de esta lista:
// cambiar de tema (o agregar un tipo) es, casi siempre, editar solo este arreglo y el seed.
//   multiple:     false = un solo ingrediente (select) · true = varios (casillas)
//   obligatorio:  la configuración no se puede guardar sin elegirlo
//   atributos:    datos extra del ingrediente (ver ATRIBUTOS)
export const TIPOS = [
    { id: 'tamano', singular: 'Tamaño', plural: 'Tamaños', multiple: false, obligatorio: true, atributos: ['carnes'] },
    { id: 'pan', singular: 'Pan', plural: 'Panes', multiple: false, obligatorio: true, atributos: ['color'] },
    { id: 'proteina', singular: 'Proteína', plural: 'Proteínas', multiple: false, obligatorio: true, atributos: ['color'] },
    { id: 'queso', singular: 'Queso', plural: 'Quesos', multiple: false, obligatorio: false, atributos: ['color'] },
    { id: 'salsa', singular: 'Salsa', plural: 'Salsas', multiple: true, obligatorio: false, atributos: ['color'] },
    { id: 'extra', singular: 'Extra', plural: 'Extras', multiple: true, obligatorio: false, atributos: ['color', 'orden'] },
];

export const ROLES = ['cliente', 'admin'];

export const tipoPorId = (id) => TIPOS.find((t) => t.id === id)

// Copia una selección { [tipo]: id | id[] } con la forma que dicta TIPOS.
// Sin argumento devuelve una selección vacía lista para usarse con v-model:
// un tipo múltiple es [], uno obligatorio es '' (opción "Elige…") y uno opcional es null.
export function copiarSeleccion(origen = {}) {
    return Object.fromEntries(
        TIPOS.map((t) => {
            const v = origen[t.id]
            if (t.multiple) return [t.id, Array.isArray(v) ? [...v] : []]
            return [t.id, v ?? (t.obligatorio ? '' : null)]
        }),
    )
}