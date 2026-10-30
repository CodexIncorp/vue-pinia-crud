<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const props = defineProps({ id: String });
console.log('id:', props.id);
const router = useRouter();
const products = useProductsStore();

const isEdit = computed(() => !!props.id);

const form = ref({ nombre: '', precio: 0 });

if (isEdit.value) {
    const exist = products.getById(props.id);
    if (exist) {
        form.value = { nombre: exist.nombre, precio: exist.precio }
    } else {
        router.replace('/productos') //id inexistente
    }
}

function save() {
    if (isEdit.value) products.update(props.id, form.value);
    else products.add(form.value);
    router.push('/productos');
}
</script>

<template>
    <section>
        <h1>{{ isEdit ? 'Editar producto' : 'Crear producto' }}</h1>
        <form @submit.prevent="save">
            <label>
                Nombre
                <input v-model="form.nombre" type="text" required />
            </label>

            <label>
                Precio
                <input v-model="form.precio" type="number" min="0" step="0.01" required />
            </label>

            <div class="actions">
                <button class="btn primary" type="submit">Guardar</button>
                <RouterLink class="btn" to="/productos">Cancelar</RouterLink>
            </div>
        </form>
    </section>
</template>
