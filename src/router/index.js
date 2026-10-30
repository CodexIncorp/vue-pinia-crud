import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: HomeView },
    {
      path: '/productos',
      name: 'productos',
      component: () => import('@/views/ProductosView.vue'),
    },
    {
      path: '/productos/crear',
      name: 'producto-crear',
      component: () => import('@/views/ProductoFormView.vue'),
    },
    {
      path: '/productos/:id',
      name: 'productos-editar',
      component: () => import('@/views/ProductoFormView.vue'),
    },
    {
      path: '/carrito',
      name: 'carrito',
      component: () => import('@/views/CarritoView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
