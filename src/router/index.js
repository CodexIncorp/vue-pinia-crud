import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const ADMIN = { requiresAdmin: true }
const PUBLIC = { public: true, guestOnly: true }

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: HomeView },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: PUBLIC,
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('@/views/RegistroView.vue'),
      meta: PUBLIC,
    },
    {
      path: '/admin/ingredientes',
      name: 'ingredientes',
      component: () => import('@/views/admin/IngredientesView.vue'),
      meta: ADMIN,
    },
    {
      path: '/admin/ingredientes/crear',
      name: 'ingrediente-crear',
      component: () => import('@/views/admin/IngredienteFormView.vue'),
      meta: ADMIN,
    },
    {
      path: '/admin/ingredientes/:id',
      name: 'ingrediente-editar',
      component: () => import('@/views/admin/IngredienteFormView.vue'),
      props: true,
      meta: ADMIN,
    },
    {
      path: '/admin/configuraciones',
      name: 'configuraciones',
      component: () => import('@/views/admin/ConfiguracionesView.vue'),
      meta: ADMIN,
    },
    {
      path: '/admin/configuraciones/crear',
      name: 'configuracion-crear',
      component: () => import('@/views/admin/ConfiguracionFormView.vue'),
      meta: ADMIN,
    },
    {
      path: '/admin/configuraciones/:id',
      name: 'configuracion-editar',
      component: () => import('@/views/admin/ConfiguracionFormView.vue'),
      props: true,
      meta: ADMIN,
    },
    {
      path: '/carrito',
      name: 'carrito',
      component: () => import('@/views/CarritoView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// guard por rol
import { useSessionStore } from '@/stores/session'

router.beforeEach((to) => {
  const session = useSessionStore()
  const autenticado = session.validarSesion()

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

export default router
