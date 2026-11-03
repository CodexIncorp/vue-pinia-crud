# Tlaloc Burger

Aplicación web de una hamburguesería donde el **cliente arma su hamburguesa ingrediente por ingrediente y la ve construirse en tiempo real**, y el **administrador** gestiona los ingredientes y las configuraciones (recetas) disponibles. El acceso se realiza mediante un **inicio de sesión simulado (SSO)**.

Construida con **Vue 3 + Vue Router + Pinia** como Single Page Application y publicada en **GitHub Pages**.

> Nombre de marca provisional: está en una sola constante (`MARCA` en `utils/catalogo.js`). El repositorio y la URL de publicación conservan por ahora el nombre anterior.
>
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

---

## Características

### Acceso
- **Pantalla de login como primera página**: quien no ha iniciado sesión siempre es dirigido a `/login`.
- Inicio de sesión simulado con un proveedor de identidad ficticio (**Tlaloc ID**): correo y contraseña, **creación de cuenta propia** y acceso rápido con cuentas de demostración.
- Las cuentas nuevas son siempre de rol cliente; el rol (admin o cliente) lo determina la cuenta, no se elige libremente.
- Cierre de sesión desde el menú.

### Cliente
- Constructor de hamburguesas con formulario compuesto **solo por `select` y `checkbox`** para todo lo relacionado con la personalización (tamaño, pan, proteína, queso, salsas y extras). Los controles se generan a partir de `TIPOS`: `select` para los tipos de selección única y casillas para los múltiples.
- **Vista previa en tiempo real** (SVG, vista lateral): la hamburguesa es una pila vertical de capas que crece y se actualiza al instante conforme se eligen ingredientes.
- **Precio en vivo** calculado a partir de la selección.
- Posibilidad de **precargar una configuración** creada por el administrador y modificarla.
- Carrito de compras con hamburguesas personalizadas, cantidades y total acumulado.
- Vista de **resumen del pedido**.

### Administrador
- CRUD de **ingredientes** (nombre, tipo, precio, color de representación, disponibilidad).
- CRUD de **configuraciones de hamburguesa** (recetas base como "Clásica" o "Mexicana").

### Generales
- Navegación SPA con Vue Router.
- Estado global con Pinia; datos persistidos en `localStorage`.
- Uso de directivas de Vue: `v-for`, `v-if`/`v-else`, `v-show`, `v-model`, `v-bind`, `v-on` y una directiva personalizada.

---

## Roles

| Rol | Puede hacer |
|---|---|
| **Cliente** | Ver el menú, personalizar hamburguesas, agregarlas al carrito y revisar el pedido. |
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
- SVG para la visualización de la hamburguesa
- GitHub Actions + GitHub Pages para el despliegue

---

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Pantalla de inicio de sesión (primera página al acceder) |
| `/registro` | Público | Creación de cuenta de cliente |
| `/` | Autenticado | Página de bienvenida |
| `/armar` | Autenticado | Constructor de hamburguesa con vista previa en vivo |
| `/carrito` | Autenticado | Resumen del pedido, total, quitar ítems y vaciar carrito |
| `/admin/ingredientes` | Admin | Lista de ingredientes |
| `/admin/ingredientes/crear` | Admin | Formulario para crear ingrediente |
| `/admin/ingredientes/:id` | Admin | Formulario para editar ingrediente |
| `/admin/configuraciones` | Admin | Lista de configuraciones de hamburguesa |
| `/admin/configuraciones/crear` | Admin | Formulario para crear configuración |
| `/admin/configuraciones/:id` | Admin | Formulario para editar configuración |

Se usa `createWebHashHistory` (las URLs se ven como `/#/carrito`) porque GitHub Pages solo sirve archivos estáticos y el modo `history` produciría error 404 al recargar. Por lo mismo, la primera página es `/#/login`.

---

## Modelo de datos

**El esquema vive en `utils/catalogo.js` (`TIPOS`).** Los formularios, las validaciones y los stores se derivan de esa lista: no hay campos de producto escritos a mano en ellos. Cambiar de tema, o agregar un tipo, es editar `TIPOS` y el seed.

```js
export const TIPOS = [
  { id: 'tamano',   singular: 'Tamaño',   plural: 'Tamaños',   multiple: false, obligatorio: true,  atributos: ['carnes'] },
  { id: 'pan',      singular: 'Pan',      plural: 'Panes',     multiple: false, obligatorio: true,  atributos: ['color'] },
  { id: 'proteina', singular: 'Proteína', plural: 'Proteínas', multiple: false, obligatorio: true,  atributos: ['color'] },
  { id: 'queso',    singular: 'Queso',    plural: 'Quesos',    multiple: false, obligatorio: false, atributos: ['color'] },
  { id: 'salsa',    singular: 'Salsa',    plural: 'Salsas',    multiple: true,  obligatorio: false, atributos: ['color'] },
  { id: 'extra',    singular: 'Extra',    plural: 'Extras',    multiple: true,  obligatorio: false, atributos: ['color', 'orden'] },
]
```

| Campo de `TIPOS` | Efecto |
|---|---|
| `multiple` | `false` → `select` (un ingrediente) · `true` → casillas (varios) |
| `obligatorio` | La configuración no se puede guardar sin elegirlo (en tipos múltiples, al menos uno) |
| `atributos` | Datos extra que lleva el ingrediente de ese tipo (ver abajo) |

**Ingrediente**

```js
{
  id: 'e7',
  nombre: 'Jitomate',
  tipo: 'extra',        // tamano | pan | proteina | queso | salsa | extra
  precio: 5,
  color: '#d63c2f',     // usado por la vista previa (null si el tipo no lo usa)
  orden: 70,            // solo extras: posición en la pila, menor = más abajo (null en los demás)
  carnes: null,         // solo tamaños: número de carnes (1, 2, 3…) (null en los demás)
  activo: true
}
```

Los atributos que un tipo no usa se guardan como `null`, de modo que todos los ingredientes tienen la misma forma.

| Tipo | Control | Selección | Atributos |
|---|---|---|---|
| `tamano` | `select` | Una (obligatoria): sencilla, doble, triple | `carnes` |
| `pan` | `select` | Una (obligatoria) | `color` |
| `proteina` | `select` | Una (obligatoria): res, pollo, vegetariana | `color` |
| `queso` | `select` | Una (opcional, `null` = sin queso) | `color` |
| `salsa` | casillas | Varias (opcionales) | `color` |
| `extra` | casillas | Varios (opcionales): vegetales y otros | `color`, `orden` |

**Configuración de hamburguesa** (receta del administrador)

```js
{
  id: 'c1',
  nombre: 'Clásica',
  selecciones: {
    tamano: 't1',            // tipo simple: un id (null si es opcional y no se eligió)
    pan: 'p1',
    proteina: 'r1',
    queso: 'q1',
    salsa: ['s1', 's2'],     // tipo múltiple: arreglo de ids (puede ir vacío)
    extra: ['e7', 'e8', 'e6'],
  },
}
```

`copiarSeleccion()` (en `utils/catalogo.js`) crea o copia una selección con esta forma; sirve tanto para el formulario de configuraciones como para el futuro `builder`.

**Hamburguesa del cliente / ítem del carrito**

Tiene la misma forma que una configuración (`selecciones`), más `cantidad`. Al agregarla al carrito se guarda **una copia** de la selección (para que cambios posteriores del constructor no alteren lo ya agregado).

**Reglas del modelo**

- El `tipo` de un ingrediente **no se puede cambiar** después de crearlo (rompería las configuraciones que lo usan).
- Un ingrediente **en uso** por alguna configuración **no se puede eliminar**; se desactiva (`activo: false`) y el constructor del cliente solo ofrece los activos.
- Los nombres son únicos por categoría (ingredientes) y globalmente (configuraciones).
- **El orden importa:** la posición de un extra en la pila es una propiedad del ingrediente (`orden`), no de la selección. Los listados de extras salen ordenados de abajo hacia arriba.
- **Algunos ingredientes se repiten:** el tamaño fija cuántas carnes lleva (`carnes`); la proteína elegida aparece esa cantidad de veces en la pila y el pan genera dos capas (inferior y superior). La selección solo guarda **un** id de proteína y de pan; la repetición la resuelve el `builder`.

**Claves de `localStorage`** (con versión; si el modelo cambia, se sube la versión):

| Clave | Contenido |
|---|---|
| `tlaloc:ingredients:v2` | Ingredientes |
| `tlaloc:recetas:v2` | Configuraciones |
| `tlaloc:session:v1` | Sesión (usuario, token, expiración) |
| `tlaloc:users:v1` | Cuentas registradas (con hash de contraseña) |
| `tlaloc:cart:v1` | Carrito |

> Las claves `tlaloc:ingredients:v1` y `tlaloc:pizzaConfigs:v1` quedaron obsoletas: la app ya no las lee. Se pueden borrar en DevTools. La sesión y las cuentas siguen en `v1` porque no dependen del producto.

---

## Arquitectura y reglas del proyecto

### Reglas obligatorias

1. **Toda la lógica de datos vive en los stores de Pinia.** Los componentes solo leen estado, llaman acciones y presentan. Nada de cálculos de precio, filtrados de negocio ni persistencia dentro de componentes.
2. **Los componentes de visualización son "tontos".** `HamburguesaPreview` recibe datos por *props* y no modifica estado.
3. **Las acciones de un store que necesiten otro store** lo obtienen **dentro de la acción** (`useCartStore().remove(id)`), nunca en el nivel superior del archivo, para evitar dependencias circulares.
4. **Formulario del cliente:** para la personalización de la hamburguesa solo se permiten `select` y `input type="checkbox"`. Los inputs de texto/número solo son válidos para datos que no son de personalización (por ejemplo, la cantidad).
5. **Persistencia aislada en los stores.** Ningún componente toca `localStorage` directamente (se usa `utils/persist.js`); así, migrar a un backend no obliga a modificar la interfaz.
6. **El orden de las capas en la vista previa es determinista:** sale del `orden` de cada ingrediente y de las reglas del `builder`. Prohibido usar `Math.random()` en el render: la pila se reacomodaría con cada clic.
7. **Todo cambio entra por Pull Request.** No se hace push directo a `main`.
8. **La autenticación solo vive en `services/mockIdP.js` y en el store `session`.** Los componentes y el router consultan `session.autenticado`, `session.esAdmin` y `session.usuario`; nunca leen ni escriben la sesión por su cuenta.
9. **Nada de secretos ni contraseñas reales en el repositorio.** El sitio es estático y público: todo lo que esté en el código lo puede leer cualquiera. Las cuentas de demostración no tienen contraseña y las de las cuentas registradas se guardan solo como hash, jamás en texto plano.
10. **Las acciones de los stores validan y devuelven `{ ok, error }`;** los componentes solo muestran el mensaje.
11. **Rutas privadas por defecto.** Una ruta pública se declara explícitamente con `meta: { public: true }`; las que solo deben verse sin sesión (login y registro) llevan además `guestOnly: true`.
12. **Las cuentas creadas desde el registro son siempre de rol cliente.** El rol lo asigna el servicio de identidad, nunca el formulario.
13. **El esquema del producto sale de `TIPOS`.** Stores, formularios y validaciones recorren `TIPOS`; no se escriben a mano nombres de tipos (`'pan'`, `'extra'`…) salvo en el `builder` y la vista previa, que sí dependen del producto. Los textos de marca y producto salen de `MARCA` y `PRODUCTO`.

### Stores

| Store | Responsabilidad |
|---|---|
| `session` | Usuario autenticado, token simulado, rol, `autenticado`, `esAdmin`, `cargando`; acciones `iniciarSesion`, `iniciarSesionDemo`, `registrar`, `cerrarSesion` y `validarSesion` |
| `ingredients` | CRUD de ingredientes; getters por tipo (`byType`, `activesByType`; los tipos con `orden` salen ordenados) |
| `recetas` | CRUD de configuraciones; `useOf(ingredienteId)` |
| `builder` | Hamburguesa en construcción; getters de precio total y pila de capas ordenada |
| `cart` | Ítems del pedido, total, contador, quitar y vaciar |

### Vista previa en tiempo real

Vista **lateral** en SVG: una pila vertical que crece conforme se eligen ingredientes. El `builder` entrega la pila ya ordenada, de abajo hacia arriba:

1. **Pan inferior** (el pan elegido).
2. **Carnes**: la proteína elegida repetida `carnes` veces (según el tamaño), con el **queso entre ellas** (y sobre la última).
3. **Extras**, ordenados por su `orden` ascendente.
4. **Salsas**.
5. **Pan superior** (mismo pan).

Cada capa es un elemento reactivo que Vue agrega, quita o recolorea según el estado del store `builder`, y puede animarse con `<TransitionGroup>`. Como la pila es determinista, no hay generador de posiciones.

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
│   ├── recetas.js
│   ├── builder.js
│   └── cart.js
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
    ├── ArmarView.vue
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

- `base: '/vue-pinia-crud/'` en `vite.config.js`.
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
