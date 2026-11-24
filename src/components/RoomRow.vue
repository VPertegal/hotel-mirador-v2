<script setup lang="ts">
import dayjs from 'dayjs';
import type { Room, RoomState } from '../stores/room'

const props = defineProps<{
    room: Room
    dates: string[]
}>()

const getState = (date: string): Partial<RoomState> | undefined => {
    const state = props.room.state?.find((s) => s.reserved_date === date)
    
    // Si no hay estado y es la fecha actual, asumimos que está disponible por defecto
    if (!state && date === dayjs().format('YYYY-MM-DD')) {
        return { available: true, dirty: false, reserved: false }
    }
    
    return state
}

</script>
<template>

    <td class="room-id">
        <RouterLink :to="{ name: 'roomDetails', params: { id: props.room.id } }"> {{ props.room.id }}</RouterLink>
    </td>
    <td>{{ props.room.floor }}</td>
    <td>{{ props.room.roomType }}</td>
    <td v-for="date in props.dates" :key="`${props.room.id}-${date}`">
 <template v-if="getState(date)">
            <p v-if="getState(date)!.available && !getState(date)!.dirty && !getState(date)!.reserved" style="color: green;">Disponible</p>
            <p v-else-if="!getState(date)!.available && !getState(date)!.dirty && !getState(date)!.reserved" style="color: red;">Ocupada</p>
            <p v-else-if="getState(date)!.dirty" style="color: yellow;">Sucia</p>
            <p v-else-if="getState(date)!.reserved" style="color: blue;">Reservada</p>
        </template>
        <!-- Opcional: mostrar un guion o texto si no hay datos para fechas futuras -->
        <span v-else>-</span>
    </td>


</template>
<style></style>

/* ?. (El encadenamiento opcional): Evalúa si room tiene un valor
válido (es decir, que no sea null ni undefined).

Si room existe: Continúa y lee la propiedad.

Si room es null o undefined: Se detiene inmediatamente y devuelve
undefined en lugar de romper el código.*/