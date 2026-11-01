# Pizza Tlaloc

Aplicación web de una pizzería donde el **cliente arma su pizza ingrediente por ingrediente y la ve construirse en tiempo real**, y el **administrador** gestiona los ingredientes y las configuraciones (recetas) disponibles.

Construida con **Vue 3 + Vue Router + Pinia** como Single Page Application y publicada en **GitHub Pages**.

> Sitio publicado: `https://CodexIncorp.github.io/vue-pinia-crud/`

---

## Tabla de contenidos

1. [Características](#características)
2. [Roles](#roles)
3. [Tecnologías](#tecnologías)
4. [Rutas](#rutas)
5. [Modelo de datos](#modelo-de-datos)
6. [Arquitectura y reglas del proyecto](#arquitectura-y-reglas-del-proyecto)
7. [Estructura de carpetas](#estructura-de-carpetas)
8. [Instalación y uso local](#instalación-y-uso-local)
9. [Despliegue](#despliegue)
10. [Flujo de trabajo del equipo](#flujo-de-trabajo-del-equipo)
11. [Limitaciones conocidas](#limitaciones-conocidas)
12. [Hoja de ruta](#hoja-de-ruta)

---

## Características

### Cliente
- Constructor de pizzas con formulario compuesto **solo por `select` y `checkbox`** para todo lo relacionado con la personalización (tamaño, masa, salsa, queso y toppings).
- **Vista previa en tiempo real** (SVG por capas): la pizza se dibuja y se actualiza al instante conforme se eligen ingredientes.
- **Precio en vivo** calculado a partir de la selección.
- Posibilidad de **precargar una configuración** creada por el administrador y modificarla.
- Carrito de compras con pizzas personalizadas, cantidades y total acumulado.
- Vista de **resumen del pedido**.

### Administrador
- CRUD de **ingredientes** (nombre, tipo, precio, color de representación, disponibilidad).
- CRUD de **configuraciones de pizza** (recetas base como "Margarita" o "Pastor").

### Generales
- Navegación SPA con Vue Router.
- Estado global con Pinia; datos persistidos en `localStorage`.
- Uso de directivas de Vue: `v-for`, `v-if`/`v-else`, `v-show`, `v-model`, `v-bind`, `v-on` y una directiva personalizada.

---

## Roles

| Rol | Puede hacer |
|---|---|
| **Cliente** | Ver el menú, personalizar pizzas, agregarlas al carrito y revisar el pedido. |
| **Admin** | Todo lo anterior, además de crear, editar y eliminar ingredientes y configuraciones. |

> ⚠️ **Los roles son una simulación para la demo.** El rol se guarda en el navegador (`localStorage`) y el router lo usa para proteger las rutas `/admin/*`. **No es seguridad real**: cualquier persona puede cambiarlo desde las herramientas del navegador. Seguridad real requiere un backend (ver [Hoja de ruta](#hoja-de-ruta)).

---

## Tecnologías

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vue Router 4](https://router.vuejs.org/) (modo hash)
- [Pinia](https://pinia.vuejs.org/) (stores con sintaxis *setup*)
- [Vite](https://vite.dev/)
- SVG para la visualización de la pizza
- GitHub Actions + GitHub Pages para el despliegue

---

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Todos | Página de bienvenida |
| `/pizzas/armar` | Todos | Constructor de pizza con vista previa en vivo |
| `/carrito` | Todos | Resumen del pedido, total, quitar ítems y vaciar carrito |
| `/admin/ingredientes` | Admin | Lista de ingredientes |
| `/admin/ingredientes/crear` | Admin | Formulario para crear ingrediente |
| `/admin/ingredientes/:id` | Admin | Formulario para editar ingrediente |
| `/admin/configuraciones` | Admin | Lista de configuraciones de pizza |
| `/admin/configuraciones/crear` | Admin | Formulario para crear configuración |
| `/admin/configuraciones/:id` | Admin | Formulario para editar configuración |

Se usa `createWebHashHistory` (las URLs se ven como `/#/carrito`) porque GitHub Pages solo sirve archivos estáticos y el modo `history` produciría error 404 al recargar.

---

## Modelo de datos

**Ingrediente**

```js
{
  id: 'i1',
  nombre: 'Pepperoni',
  tipo: 'topping',      // tamano | masa | salsa | queso | topping
  precio: 15,
  color: '#c0392b',     // usado por la vista previa
  activo: true
}
```

Cada `tipo` corresponde a un control del formulario del cliente:

| Tipo | Control | Selección |
|---|---|---|
| `tamano` | `select` | Una |
| `masa` | `select` | Una |
| `salsa` | `select` | Una |
| `queso` | `select` | Una |
| `topping` | `checkbox` | Varias |

**Configuración de pizza** (receta del administrador)

```js
{
  id: 'c1',
  nombre: 'Margarita',
  tamano: 't2',
  masa: 'm1',
  salsa: 's1',
  queso: 'q1',
  toppings: ['i4']
}
```

**Pizza del cliente / ítem del carrito**

Tiene la misma forma que una configuración, más `cantidad`. Al agregarla al carrito se guarda **una copia** de la selección (para que cambios posteriores del constructor o de los ingredientes no alteren lo ya agregado, salvo el precio si así se define).

---

## Arquitectura y reglas del proyecto

### Reglas obligatorias

1. **Toda la lógica de datos vive en los stores de Pinia.** Los componentes solo leen estado, llaman acciones y presentan. Nada de cálculos de precio, filtrados de negocio ni persistencia dentro de componentes.
2. **Los componentes de visualización son "tontos".** `PizzaPreview` recibe datos por *props* y no modifica estado.
3. **Las acciones de un store que necesiten otro store** lo obtienen **dentro de la acción** (`useCartStore().remove(id)`), nunca en el nivel superior del archivo, para evitar dependencias circulares.
4. **Formulario del cliente:** para la personalización de la pizza solo se permiten `select` y `input type="checkbox"`. Los inputs de texto/número solo son válidos para datos que no son de personalización (por ejemplo, la cantidad).
5. **Persistencia aislada en los stores.** Ningún componente toca `localStorage` directamente; así, migrar a un backend no obliga a modificar la interfaz.
6. **Las posiciones de los toppings en la vista previa son deterministas** (generador con semilla). Prohibido usar `Math.random()` directo en el render: la pizza se reacomodaría con cada clic.
7. **Todo cambio entra por Pull Request.** No se hace push directo a `main`.

### Stores

| Store | Responsabilidad |
|---|---|
| `session` | Rol actual (`admin` / `cliente`) |
| `ingredients` | CRUD de ingredientes; getters por tipo |
| `pizzaConfigs` | CRUD de configuraciones |
| `builder` | Pizza en construcción; getters de precio total y lista de capas |
| `cart` | Ítems del pedido, total, contador, quitar y vaciar |

### Vista previa en tiempo real

SVG por capas, de abajo hacia arriba: **masa → salsa → queso → toppings**. El tamaño escala el radio de la masa. Cada capa es un elemento reactivo que Vue agrega, quita o recolorea según el estado del store `builder`.

### Convenciones de código

- `<script setup>` en todos los componentes.
- `.value` en el script, sin `.value` en el template.
- Nombres de rutas en kebab-case (`ingrediente-editar`) y usados de forma idéntica en `router` y `RouterLink`.
- Nombres de archivos de vistas en PascalCase terminados en `View.vue`.
- Textos de interfaz en español.

---

## Estructura de carpetas

```
src/
├── main.js
├── App.vue
├── assets/main.css
├── router/index.js
├── stores/
│   ├── session.js
│   ├── ingredients.js
│   ├── pizzaConfigs.js
│   ├── builder.js
│   └── cart.js
├── components/
│   └── PizzaPreview.vue
├── utils/format.js
└── views/
    ├── HomeView.vue
    ├── ArmarPizzaView.vue
    ├── CarritoView.vue
    └── admin/
        ├── IngredientesView.vue
        ├── IngredienteFormView.vue
        ├── ConfiguracionesView.vue
        └── ConfiguracionFormView.vue
```

---

## Instalación y uso local

Requisitos: [Node.js](https://nodejs.org/) (versión LTS) y Git.

```bash
git clone https://github.com/CodexIncorp/vue-pinia-crud.git
cd vue-pinia-crud
npm install
npm run dev
```

Otros comandos:

```bash
npm run build     # genera la carpeta dist/ para producción
npm run preview   # sirve localmente el build
```

> Antes de abrir un PR, ejecuta `npm run build` en local: el build revisa todos los imports y detecta errores que `npm run dev` puede pasar por alto.

---

## Despliegue

El sitio se publica automáticamente en GitHub Pages con GitHub Actions al hacer *merge* a `main` (`.github/workflows/deploy.yml`).

Requisitos de configuración:

- `base: '/vue-pinia-repo/'` en `vite.config.js`.
- En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- `package-lock.json` incluido en el repositorio (el workflow usa `npm ci`).

---

## Flujo de trabajo del equipo

1. Actualizar `main`: `git switch main && git pull`.
2. Crear una rama por tarea: `git switch -c feature/nombre-corto`.
3. Hacer commits pequeños y descriptivos.
4. Subir la rama: `git push -u origin feature/nombre-corto`.
5. Abrir un **Pull Request** hacia `main` y solicitar revisión de al menos un compañero.
6. Hacer *merge* y borrar la rama.

**Nombres de ramas:** `feature/…`, `fix/…`, `ci/…`, `docs/…`.

**Mensajes de commit** (prefijos):

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de errores |
| `style:` | Estilos o formato sin cambio de lógica |
| `refactor:` | Reestructuración sin cambio de comportamiento |
| `docs:` | Documentación |
| `ci:` | Workflows y despliegue |

Ejemplo: `feat: store del constructor de pizza`.

---

## Limitaciones conocidas

- **Sin backend:** los datos viven en el `localStorage` de cada navegador; no se comparten entre usuarios ni dispositivos.
- **Roles simulados:** no constituyen un mecanismo de seguridad.
- **No hay pagos ni envío real de pedidos:** el pedido termina en la vista de resumen.
- La vista previa usa formas SVG simples; las ilustraciones definitivas son una mejora pendiente.

---

## Hoja de ruta

1. [ ] Modelo de datos acordado y stores con datos de muestra
2. [ ] CRUD de ingredientes (admin)
3. [ ] CRUD de configuraciones de pizza (admin)
4. [ ] Constructor del cliente con vista previa en tiempo real
5. [ ] Carrito adaptado a pizzas personalizadas y resumen del pedido
6. [ ] Identidad visual de Pizza Tlaloc (paleta, tipografía, logotipo)
7. [ ] Ilustraciones SVG/PNG por ingrediente y animaciones con `<TransitionGroup>`
8. [ ] Guard de rutas por rol

---

## Equipo

| Integrante | Responsabilidad |
|---|---|
| _Adrik_ | _1, 2, 3, 8_ |
| _Alexis_ | _4, 5, 7_ |
| _Rafa_ | _6_ |
