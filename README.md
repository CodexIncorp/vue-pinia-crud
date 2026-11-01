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
- Inicio de sesión simulado con un proveedor de identidad ficticio (**Tlaloc ID**): correo y contraseña, **creación de cuenta propia** y acceso rápido con cuentas de demostración.
- Las cuentas nuevas son siempre de rol cliente; el rol (admin o cliente) lo determina la cuenta, no se elige libremente.
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

Se imita un proveedor de identidad propio, **Tlaloc ID**, sin servidor real. Permite iniciar sesión, **crear una cuenta propia** y entrar con cuentas de demostración.

### Flujo

1. El usuario abre el sitio. Si no tiene una sesión válida, el router lo redirige a `/login` y conserva el destino original en `?redirect=`.
2. En `/login` puede:
   - **Iniciar sesión** con el correo y la contraseña de una cuenta propia.
   - **Crear una cuenta** en `/registro` (nombre, correo y contraseña). La cuenta nueva inicia sesión automáticamente.
   - Usar el **acceso rápido de demostración** (cuentas ficticias sin contraseña).
3. El servicio `mockIdP` valida de forma asíncrona (con una pequeña espera que simula la red) y responde con el perfil y un token simulado.
4. El store `session` guarda la sesión; el rol sale de la cuenta.
5. El usuario es enviado al destino original (validado) o, si no había, a `/`.
6. **Cerrar sesión** borra la sesión y regresa a `/login`.

Un usuario con sesión que abre `/login` o `/registro` es enviado a inicio. Una sesión expirada o corrupta se descarta en la siguiente navegación.

### Cuentas

| Tipo | Cuenta | Rol | Cómo entrar |
|---|---|---|---|
| Demo | `admin@tlaloc.test` (Admin Tlaloc) | admin | Botón de acceso rápido |
| Demo | `cliente@tlaloc.test` (Cliente Demo) | cliente | Botón de acceso rápido |
| Registrada | La que cree cada persona | cliente | Correo y contraseña |

- Las cuentas de demostración están definidas en código y no tienen contraseña; no se pueden usar desde el formulario de correo y contraseña.
- **Nadie puede crear una cuenta admin desde el registro.** El rol lo asigna el servicio, nunca viene del formulario.
- Reglas de registro: nombre de al menos 2 caracteres, correo válido y único (incluidos los de las cuentas demo), contraseña de al menos 8 caracteres y confirmación idéntica.
- El error de inicio de sesión es genérico ("Correo o contraseña incorrectos") para no revelar qué correos existen.

### Almacenamiento de contraseñas

Las contraseñas **nunca se guardan en texto plano**: se almacenan como hash PBKDF2-SHA256 con sal aleatoria (Web Crypto API, que requiere `https` o `localhost`). Es una buena práctica de demostración, pero **no hace segura la aplicación**: la "base de datos" y la lógica viven en el navegador. El formulario de registro advierte que no se use una contraseña real.

### Estructuras de datos

```js
// Cuenta registrada (tlaloc:users:v1)
{ id: 'b1c2…', nombre: 'Ana', email: 'ana@correo.com', rol: 'cliente',
  sal: '9f…', hash: '3a…', creadaEn: 1767225600000 }

// Sesión (tlaloc:session:v1): nunca incluye sal ni hash
{
  usuario: { id: 'b1c2…', nombre: 'Ana', email: 'ana@correo.com', rol: 'cliente' },
  token: 'a8f3…',          // cadena aleatoria sin valor de seguridad
  expiraEn: 1767254400000  // 8 horas después de iniciar sesión
}
```

### Reglas de protección de rutas

- **Las rutas son privadas por defecto.** Solo las marcadas con `meta: { public: true }` (hoy, `/login` y `/registro`) se pueden abrir sin sesión. Así, olvidar una marca nunca deja una ruta abierta.
- `/login` y `/registro` llevan además `guestOnly: true`: un usuario con sesión no puede verlas.
- Las rutas de administración llevan `meta: { requiresAdmin: true }`.
- Un cliente que intenta abrir una ruta de admin es redirigido a inicio.
- El destino de `?redirect=` se valida (debe ser una ruta interna) antes de usarse.

```js
router.beforeEach((to) => {
  const session = useSessionStore() // dentro del guard, no en el nivel superior
  const autenticado = session.validarSesion() // descarta sesiones corruptas o expiradas

  if (!to.meta.public && !autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && autenticado) {
    return { name: 'inicio' }
  }
  if (to.meta.requiresAdmin && !session.esAdmin) {
    return { name: 'inicio', query: { acceso: 'denegado' } }
  }
})
```

### Migración a un SSO real

`mockIdP` expone la misma forma que un proveedor real: funciones asíncronas para iniciar sesión, registrar y cerrar sesión que devuelven `{ ok, sesion | error }`.

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
| `/registro` | Público | Creación de cuenta de cliente |
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
| `tlaloc:users:v1` | Cuentas registradas (con hash de contraseña) |
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
9. **Nada de secretos ni contraseñas reales en el repositorio.** El sitio es estático y público: todo lo que esté en el código lo puede leer cualquiera. Las cuentas de demostración no tienen contraseña y las de las cuentas registradas se guardan solo como hash, jamás en texto plano.
10. **Las acciones de los stores validan y devuelven `{ ok, error }`;** los componentes solo muestran el mensaje.
11. **Rutas privadas por defecto.** Una ruta pública se declara explícitamente con `meta: { public: true }`; las que solo deben verse sin sesión (login y registro) llevan además `guestOnly: true`.
12. **Las cuentas creadas desde el registro son siempre de rol cliente.** El rol lo asigna el servicio de identidad, nunca el formulario.

### Stores

| Store | Responsabilidad |
|---|---|
| `session` | Usuario autenticado, token simulado, rol, `autenticado`, `esAdmin`, `cargando`; acciones `iniciarSesion`, `iniciarSesionDemo`, `registrar`, `cerrarSesion` y `validarSesion` |
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
│   ├── hash.js
│   ├── navegacion.js
│   └── format.js
└── views/
    ├── LoginView.vue
    ├── RegistroView.vue
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
- **Login y roles simulados:** no constituyen un mecanismo de seguridad. Las cuentas y los hashes de contraseña viven en el `localStorage` del navegador: no se comparten entre dispositivos y cualquiera con acceso a ese navegador puede leerlos o modificarlos. No uses contraseñas reales.
- **Sin recuperación de contraseña ni verificación de correo.**
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
| Los campos de contraseña del registro son básicos | Botón para mostrar u ocultar la contraseña e indicador de fortaleza | Media |

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
4. [X] **Login simulado (Tlaloc ID) como primera página**, registro de cuentas y cierre de sesión
5. [X] **Guard de rutas** por sesión y por rol (rutas privadas por defecto)
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
| _Adrik_ | _1, 2, 3, 4, 5_ |
| _Alexis_ | _6, 7, 8, 13_ |
| _Rafa_ | _9, 10, 12_ |
