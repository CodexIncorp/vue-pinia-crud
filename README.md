# Pizza Tlaloc

Aplicación web de una pizzería donde el **cliente arma su pizza ingrediente por ingrediente y la ve construirse en tiempo real**, y el **administrador** gestiona los ingredientes y las configuraciones (recetas) disponibles. El acceso se realiza mediante un **inicio de sesión simulado (SSO)**.

Construida con **Vue 3 + Vue Router + Pinia** como Single Page Application y publicada en **GitHub Pages**.

> Sitio publicado: `https://CodexIncorp.github.io/vue-pinia-crud/`

---

## Tabla de contenidos

1. [Características](#características)
2. [Roles](#roles)
3. [Autenticación (login simulado)](#autenticación-login-simulado)
4. [Tecnologías](#tecnologías)
5. [Rutas](#rutas)
6. [Modelo de datos](#modelo-de-datos)
7. [Arquitectura y reglas del proyecto](#arquitectura-y-reglas-del-proyecto)
8. [Estructura de carpetas](#estructura-de-carpetas)
9. [Instalación y uso local](#instalación-y-uso-local)
10. [Despliegue](#despliegue)
11. [Flujo de trabajo del equipo](#flujo-de-trabajo-del-equipo)
12. [Limitaciones conocidas](#limitaciones-conocidas)
13. [Mejoras de diseño pendientes](#mejoras-de-diseño-pendientes)
14. [Hoja de ruta](#hoja-de-ruta)

---

## Características

### Acceso
- **Pantalla de login como primera página**: quien no ha iniciado sesión siempre es dirigido a `/login`.
- Inicio de sesión simulado con un proveedor de identidad ficticio (**Tlaloc ID**) y cuentas de demostración.
- El rol (admin o cliente) lo determina la cuenta, no se elige libremente.
- Cierre de sesión desde el menú.

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

> **Los roles y el login son una simulación para la demo.** La sesión se guarda en el navegador (`localStorage`) y el router la usa para proteger las rutas. **No es seguridad real**: el código completo de la aplicación se descarga en el navegador y cualquier persona puede modificar la sesión desde las herramientas del desarrollador. Seguridad real requiere un backend.

---

## Autenticación (login simulado)

Se imita el flujo de un SSO (por ejemplo "Continuar con Google") sin servidor real.

### Flujo

1. El usuario abre el sitio. Si no tiene sesión, el router lo redirige a `/login` y conserva el destino original en `?redirect=`.
2. En `/login` pulsa **Continuar con Tlaloc ID**.
3. Se muestra un **selector de cuentas** simulado (como el de un proveedor de identidad real).
4. Al elegir una cuenta, el servicio `mockIdP` responde (de forma asíncrona, con una pequeña espera para simular la red) con el perfil del usuario y un token simulado.
5. El store `session` guarda al usuario y deriva el rol de la cuenta.
6. El usuario es enviado al destino original o, si no había, a `/`.
7. **Cerrar sesión** limpia la sesión y regresa a `/login`.

Si el usuario ya tiene sesión y entra a `/login`, es enviado a inicio.

### Cuentas de demostración

| Cuenta | Nombre | Rol |
|---|---|---|
| `admin@tlaloc.test` | Admin Tlaloc | admin |
| `cliente@tlaloc.test` | Cliente Demo | cliente |

Son cuentas ficticias, **sin contraseña**. Para agregar más cuentas se edita únicamente `src/services/mockIdP.js`.

### Estructura de la sesión

```js
{
  usuario: { id: 'u1', nombre: 'Admin Tlaloc', email: 'admin@tlaloc.test', rol: 'admin' },
  token: 'a8f3…',          // cadena aleatoria sin valor de seguridad
  expiraEn: 1767225600000  // marca de tiempo; pasada esa hora, la sesión se considera cerrada
}
```

### Reglas de protección de rutas

- **Las rutas son privadas por defecto.** Solo las marcadas con `meta: { public: true }` (hoy, únicamente `/login`) se pueden abrir sin sesión. Así, olvidar una marca nunca deja una ruta abierta.
- Las rutas de administración llevan además `meta: { requiresAdmin: true }`.
- Un cliente que intenta abrir una ruta de admin es redirigido a inicio.

```js
router.beforeEach((to) => {
  const session = useSessionStore() // dentro del guard, no en el nivel superior

  if (!to.meta.public && !session.autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && session.autenticado) {
    return { name: 'inicio' }
  }
  if (to.meta.requiresAdmin && !session.esAdmin) {
    return { name: 'inicio' }
  }
})
```

### Migración a un SSO real

`mockIdP` expone la misma forma que un proveedor real (una función asíncrona que devuelve usuario y token, y otra que cierra sesión).

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
| `/login` | Público | Pantalla de inicio de sesión (primera página al acceder) |
| `/` | Autenticado | Página de bienvenida |
| `/pizzas/armar` | Autenticado | Constructor de pizza con vista previa en vivo |
| `/carrito` | Autenticado | Resumen del pedido, total, quitar ítems y vaciar carrito |
| `/admin/ingredientes` | Admin | Lista de ingredientes |
| `/admin/ingredientes/crear` | Admin | Formulario para crear ingrediente |
| `/admin/ingredientes/:id` | Admin | Formulario para editar ingrediente |
| `/admin/configuraciones` | Admin | Lista de configuraciones de pizza |
| `/admin/configuraciones/crear` | Admin | Formulario para crear configuración |
| `/admin/configuraciones/:id` | Admin | Formulario para editar configuración |

Se usa `createWebHashHistory` (las URLs se ven como `/#/carrito`) porque GitHub Pages solo sirve archivos estáticos y el modo `history` produciría error 404 al recargar. Por lo mismo, la primera página es `/#/login`.

---

## Modelo de datos

**Ingrediente**

```js
{
  id: 'i1',
  nombre: 'Pepperoni',
  tipo: 'topping',      // tamano | masa | salsa | queso | topping
  precio: 15,
  color: '#c0392b',     // usado por la vista previa (null en los tamaños)
  activo: true
}
```

Cada `tipo` corresponde a un control del formulario del cliente:

| Tipo | Control | Selección |
|---|---|---|
| `tamano` | `select` | Una (obligatoria) |
| `masa` | `select` | Una (obligatoria) |
| `salsa` | `select` | Una (opcional, `null` = sin salsa) |
| `queso` | `select` | Una (opcional, `null` = sin queso) |
| `topping` | `checkbox` | Varias |

**Configuración de pizza** (receta del administrador)

```js
{
  id: 'c1',
  nombre: 'Margarita',
  tamano: 't2',
  masa: 'm1',
  salsa: 's1',          // o null
  queso: 'q1',          // o null
  toppings: ['i4']
}
```

**Pizza del cliente / ítem del carrito**

Tiene la misma forma que una configuración, más `cantidad`. Al agregarla al carrito se guarda **una copia** de la selección (para que cambios posteriores del constructor no alteren lo ya agregado).

**Reglas del modelo**

- El `tipo` de un ingrediente **no se puede cambiar** después de crearlo (rompería las configuraciones que lo usan).
- Un ingrediente **en uso** por alguna configuración **no se puede eliminar**; se desactiva (`activo: false`) y el constructor del cliente solo ofrece los activos.
- Los nombres son únicos por categoría (ingredientes) y globalmente (configuraciones).

**Claves de `localStorage`** (con versión; si el modelo cambia, se sube a `:v2`):

| Clave | Contenido |
|---|---|
| `tlaloc:ingredients:v1` | Ingredientes |
| `tlaloc:pizzaConfigs:v1` | Configuraciones |
| `tlaloc:session:v1` | Sesión (usuario, token, expiración) |
| `tlaloc:cart:v1` | Carrito |

---

## Arquitectura y reglas del proyecto

### Reglas obligatorias

1. **Toda la lógica de datos vive en los stores de Pinia.** Los componentes solo leen estado, llaman acciones y presentan. Nada de cálculos de precio, filtrados de negocio ni persistencia dentro de componentes.
2. **Los componentes de visualización son "tontos".** `PizzaPreview` recibe datos por *props* y no modifica estado.
3. **Las acciones de un store que necesiten otro store** lo obtienen **dentro de la acción** (`useCartStore().remove(id)`), nunca en el nivel superior del archivo, para evitar dependencias circulares.
4. **Formulario del cliente:** para la personalización de la pizza solo se permiten `select` y `input type="checkbox"`. Los inputs de texto/número solo son válidos para datos que no son de personalización (por ejemplo, la cantidad).
5. **Persistencia aislada en los stores.** Ningún componente toca `localStorage` directamente (se usa `utils/persist.js`); así, migrar a un backend no obliga a modificar la interfaz.
6. **Las posiciones de los toppings en la vista previa son deterministas** (generador con semilla). Prohibido usar `Math.random()` directo en el render: la pizza se reacomodaría con cada clic.
7. **Todo cambio entra por Pull Request.** No se hace push directo a `main`.
8. **La autenticación solo vive en `services/mockIdP.js` y en el store `session`.** Los componentes y el router consultan `session.autenticado`, `session.esAdmin` y `session.usuario`; nunca leen ni escriben la sesión por su cuenta.
9. **Nada de secretos ni contraseñas reales en el repositorio.** El sitio es estático y público: todo lo que esté en el código lo puede leer cualquiera. Las cuentas de demostración no tienen contraseña.
10. **Las acciones de los stores validan y devuelven `{ ok, error }`;** los componentes solo muestran el mensaje.
11. **Rutas privadas por defecto.** Una ruta pública se declara explícitamente con `meta: { public: true }`.

### Stores

| Store | Responsabilidad |
|---|---|
| `session` | Usuario autenticado, token simulado, rol, `autenticado`, `esAdmin`, iniciar y cerrar sesión |
| `ingredients` | CRUD de ingredientes; getters por tipo (`porTipo`, `activosPorTipo`) |
| `pizzaConfigs` | CRUD de configuraciones; `usosDe(ingredienteId)` |
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
├── services/
│   └── mockIdP.js
├── stores/
│   ├── session.js
│   ├── ingredients.js
│   ├── pizzaConfigs.js
│   ├── builder.js
│   └── cart.js
├── components/
│   └── PizzaPreview.vue
├── utils/
│   ├── catalogo.js
│   ├── persist.js
│   └── format.js
└── views/
    ├── LoginView.vue
    ├── HomeView.vue
    ├── ArmarPizzaView.vue
    ├── CarritoView.vue
    └── admin/
        ├── IngredientesView.vue
        ├── IngredienteFormView.vue
        ├── ConfiguracionesView.vue
        └── ConfiguracionFormView.vue
```

> En `main.js`, Pinia se instala **antes** que el router (`.use(createPinia()).use(router)`), porque el guard consulta el store `session` desde la primera navegación. No cambiar ese orden.

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

Para reiniciar los datos de demostración, borra las claves `tlaloc:*` en DevTools → Application → Local Storage.

---

## Despliegue

El sitio se publica automáticamente en GitHub Pages con GitHub Actions al hacer *merge* a `main` (`.github/workflows/deploy.yml`).

Requisitos de configuración:

- `base: '/NOMBRE-DEL-REPO/'` en `vite.config.js`.
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

Ejemplo: `feat: login simulado con Tlaloc ID`.

---

## Limitaciones conocidas

- **Sin backend:** los datos viven en el `localStorage` de cada navegador; no se comparten entre usuarios ni dispositivos.
- **Login y roles simulados:** no constituyen un mecanismo de seguridad.
- **Un solo carrito por navegador:** el carrito no está ligado al usuario (decisión pendiente, ver abajo).
- **No hay pagos ni envío real de pedidos:** el pedido termina en la vista de resumen.
- La vista previa usa formas SVG simples; las ilustraciones definitivas son una mejora pendiente.
- La interfaz actual es funcional pero básica (ver la siguiente sección).

**Decisión pendiente del equipo:** ¿el carrito se conserva, se vacía o se guarda por usuario al cerrar sesión? Recomendación: guardarlo por usuario (clave `tlaloc:cart:<idUsuario>`).

---

## Mejoras de diseño pendientes

La primera versión prioriza que todo funcione. Estas son las mejoras de diseño y experiencia identificadas, con su prioridad sugerida.

### Notificaciones y mensajes

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| Los errores se muestran en un párrafo dentro de la página | Sistema de **notificaciones tipo toast** (éxito, error, información) con cierre automático y `aria-live`, gestionado por un store `notifications` | Alta |
| No hay confirmación al guardar, agregar al carrito o iniciar sesión | Toast de éxito tras cada acción ("Pizza agregada al carrito") | Alta |
| Se usa `confirm()` nativo del navegador para eliminar | **Modal de confirmación** propio, accesible (foco atrapado, cierre con `Esc`) | Alta |
| El aviso "solo para administradores" viaja en la URL (`?acceso=denegado`) | Mostrarlo como toast y no depender de la URL | Media |
| Eliminar del carrito es definitivo | Opción de **"Deshacer"** en el toast | Baja |

### Formularios

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| Solo se valida al enviar y el error aparece de forma general | **Validación por campo**, mensaje bajo cada input, con `aria-invalid` y `aria-describedby` | Alta |
| El botón "Guardar" siempre está activo | Estado **deshabilitado o de carga** mientras se procesa | Media |
| Inputs con estilos básicos y repetidos | Componentes base reutilizables (`BaseInput`, `BaseSelect`, `BaseCheckbox`) | Media |
| Los toppings son una lista simple de casillas | **Chips o tarjetas** seleccionables con el color del ingrediente y su precio | Media |
| El color se elige con el selector nativo del navegador | Paleta predefinida con vista previa del ingrediente | Baja |
| El precio es un input numérico simple | Campo con prefijo `$` y formato de moneda | Baja |

### Presentación de datos

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| Listas planas con texto | **Tarjetas** (clientes) y **tablas responsivas** (admin) | Alta |
| Sin búsqueda, filtros ni orden | Buscador, filtro por tipo/estado y ordenamiento | Media |
| Los ingredientes se muestran en una sola página larga | **Pestañas por tipo** (tamaño, masa, salsa, queso, topping) | Media |
| Los estados vacíos son solo texto | Ilustración y botón de acción ("Crear el primer ingrediente") | Media |
| No hay estados de carga | **Skeletons** (será necesario al migrar a un backend) | Media |
| El carrito solo permite quitar un ítem completo | Controles **+ / −** de cantidad por ítem | Media |
| El resumen del pedido es una lista | Resumen con desglose por pizza (ingredientes y subtotal) | Media |
| Sin paginación | Paginación si el catálogo crece | Baja |

### Identidad visual

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| CSS global único y colores fijos | **Variables CSS** (design tokens) con la paleta y tipografía de Pizza Tlaloc | Alta |
| Sin logotipo ni identidad | Logotipo, favicon y título de pestaña por ruta | Media |
| Sin iconografía | Conjunto de iconos consistente (acciones, menú, estados) | Media |
| Un solo tema | Modo oscuro opcional | Baja |

### Navegación y estructura

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| Menú horizontal simple | **Menú responsivo** (hamburguesa en móvil) que muestre usuario y rol, con botón de cerrar sesión y los enlaces de admin diferenciados | Alta |
| Una ruta inexistente redirige en silencio a inicio | Página **404** con enlace de regreso | Media |
| Cambios de vista bruscos | Transiciones entre rutas con `<Transition>` | Baja |
| Sin pistas de ubicación en el área de admin | Migas de pan (*breadcrumbs*) | Baja |

### Vista previa de la pizza (función estrella)

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| Toppings representados con círculos de color | **Ilustraciones SVG/PNG por ingrediente** (rodajas, hojas, aceitunas) | Alta |
| Los ingredientes aparecen y desaparecen de golpe | Animaciones de entrada y salida con `<TransitionGroup>` | Alta |
| El cambio de tamaño es instantáneo | Escala animada de la pizza | Media |
| Solo se ve el dibujo | Resumen textual en vivo junto a la pizza (ingredientes elegidos y desglose del precio) | Media |
| Distribución aleatoria con semilla fija | Distribución más natural (sin encimarse, con rotación leve) | Baja |

### Accesibilidad y responsividad

| Situación actual | Mejora propuesta | Prioridad |
|---|---|---|
| Diseño pensado para escritorio | **Enfoque móvil primero**: en pantallas pequeñas, la pizza y el formulario se apilan | Alta |
| La pizza (SVG) no tiene descripción | `role="img"` y `aria-label` que describa la pizza actual | Alta |
| Contraste y foco sin revisar | Revisar contraste de color, **foco visible** y navegación completa con teclado | Alta |
| Animaciones sin control | Respetar `prefers-reduced-motion` | Media |

---

## Hoja de ruta

1. [X] Modelo de datos acordado y stores con datos de muestra
2. [X] CRUD de ingredientes (admin)
3. [X] CRUD de configuraciones de pizza (admin)
4. [ ] **Login simulado (SSO) como primera página** y cierre de sesión
5. [ ] **Guard de rutas** por sesión y por rol (rutas privadas por defecto)
6. [ ] Constructor del cliente con vista previa en tiempo real
7. [ ] Carrito adaptado a pizzas personalizadas y resumen del pedido
8. [ ] Carrito por usuario
9. [ ] Identidad visual de Pizza Tlaloc (paleta, tipografía, logotipo)
10. [ ] Sistema de notificaciones (toasts) y modal de confirmación
11. [ ] Validación por campo y componentes de formulario reutilizables
12. [ ] Rediseño de listas (tarjetas, tablas, pestañas, filtros)
13. [ ] Ilustraciones por ingrediente y animaciones con `<TransitionGroup>`

---

## Equipo

| Integrante | Responsabilidad |
|---|---|
| _Adrik_ | _1, 2, 3, 4, 5, 8_ |
| _Alexis_ | _6, 7, 8, 13_ |
| _Rafa_ | _9, 10, 12_ |
