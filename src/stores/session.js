import { defineStore } from 'pinia'
import { computed } from 'vue'
import { persistentRef } from '@/utils/persist'
import { ROLES } from '@/utils/catalogo'

export const useSessionStore = defineStore('session', () => {
    const rol = persistentRef('tlaloc:rol:v1', 'cliente')

    const isAdmin = computed(() => rol.value === 'admin')

    function setRol(newRol) {
        if (ROLES.includes(newRol)) rol.value = newRol
    }

    return { rol, isAdmin, setRol }
});
