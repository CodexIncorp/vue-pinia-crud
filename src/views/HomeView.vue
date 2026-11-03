<script setup>
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { MARCA, PRODUCTO } from '@/utils/catalogo'
import marcaLogo from '@/assets/logo.svg'

const route = useRoute()
const session = useSessionStore()
const equipo = [
  { nombre: 'Rafael de Jesús Balderas Osorio', control: 'Número de control: 24270358' },
  { nombre: 'Alexis Emiliano Morales Jiménez', control: 'Número de control: 24270352' },
  { nombre: 'Adrik Said Soancatl Niño', control: 'Número de control: C24270577' },
]
</script>

<template>
  <section class="home">
    <p v-if="route.query.acceso === 'denegado'" class="error" role="alert">
      Esa sección es solo para administradores.
    </p>

    <div class="home-intro">
      <div class="home-copy">
        <p class="home-eyebrow">Hecha a tu manera</p>
        <h1>Bienvenido a {{ MARCA }}, {{ session.usuario?.nombre }}</h1>
        <p>
          Diseña tu {{ PRODUCTO.singular }} eligiendo tus ingredientes y mira cómo toma forma en tiempo real.
        </p>

        <div class="actions home-actions">
          <RouterLink class="btn primary" to="/armar">
            Armar mi {{ PRODUCTO.singular }}
          </RouterLink>
          <RouterLink class="btn" to="/carrito">
            Ver carrito
          </RouterLink>
          <template v-if="session.esAdmin">
            <RouterLink class="btn" to="/admin/ingredientes">
              Administrar ingredientes
            </RouterLink>
            <RouterLink class="btn" to="/admin/configuraciones">
              Administrar configuraciones
            </RouterLink>
          </template>
        </div>
      </div>
      <div class="home-logo" aria-hidden="true">
        <img :src="marcaLogo" alt="" />
        <span>{{ MARCA }}</span>
      </div>
    </div>

    <section class="about" aria-labelledby="about-title">
      <div class="about-heading">
        <p class="home-eyebrow">Nuestro equipo</p>
        <h2 id="about-title">Sobre nosotros</h2>
        <p>Conoce a las personas detrás de {{ MARCA }}.</p>
      </div>

      <div class="team-list">
        <article v-for="(person, index) in equipo" :key="index" class="team-member">
          <span class="team-number">{{ index + 1 }}</span>
          <div>
            <h3>{{ person.nombre }}</h3>
            <p>{{ person.control }}</p>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.home-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
  border-bottom: 1px solid #e5dfd3;
}

.home-copy {
  max-width: 560px;
}

.home-eyebrow {
  margin: 0 0 0.5rem;
  color: #a63f32;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.home h1 {
  margin: 0;
  color: #203a31;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  line-height: 1.15;
}

.home-copy > p:not(.home-eyebrow) {
  max-width: 48ch;
  color: #555b53;
  line-height: 1.6;
}

.home-actions {
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.home-logo {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  color: #203a31;
  font-weight: 700;
  text-align: center;
}

.home-logo img {
  width: 140px;
  height: 140px;
}

.about {
  padding: 0.5rem 0 1.5rem;
}

.about h2 {
  margin: 0;
  color: #203a31;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.6rem;
}

.about-heading > p:last-child {
  margin: 0.4rem 0 1.25rem;
  color: #555b53;
}

.team-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid #e5dfd3;
  border-radius: 6px;
  background: #fffdf8;
}

.team-number {
  display: grid;
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 50%;
  background: #e8eee8;
  color: #203a31;
  font-weight: 700;
}

.team-member h3 {
  overflow-wrap: anywhere;
  margin: 0;
  color: #203a31;
  font-size: 0.95rem;
}

.team-member p {
  margin: 0.25rem 0 0;
  color: #6a6d65;
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .home-intro {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.25rem 0;
  }

  .home-logo {
    grid-row: 1;
    justify-self: start;
    grid-auto-flow: column;
    align-items: center;
  }

  .home-logo img {
    width: 64px;
    height: 64px;
  }

  .team-list {
    grid-template-columns: 1fr;
  }
}
</style>