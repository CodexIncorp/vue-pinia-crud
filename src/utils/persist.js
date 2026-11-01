import { ref, watch } from 'vue'

export function persistentRef(key, fallback) {
    let initial = structuredClone(fallback);
    try {
        const raw = localStorage.getItem(key);
        if (raw !== null) initial = JSON.parse(raw);
    } catch {
        // datos corruptos o localStorage no disponible: se usa valor por defecto
    }

    const state = ref(initial);

    watch(
        state,
        (v) => {
            try {
                localStorage.setItem(key, JSON.stringify(v));
            } catch {
                // cuota llena o modo privado: la app sigue funcionando sin persistir
            }
        },
        { deep: true },
    );

    return state;
}