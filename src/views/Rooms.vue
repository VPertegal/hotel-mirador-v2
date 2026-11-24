<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted } from 'vue'
import RoomRow from '../components/RoomRow.vue';

import { useRoomStore } from '../stores/room';
// @ts-ignore TypeScript has no declaration for this Vue component.
import HeaderComponent from '../components/HeaderComponent.vue';
import FilterComponent from '../components/FilterComponent.vue';


const roomStore = useRoomStore()

const roomDates = computed(() => {
  const dates = new Set<string>()
  const today = dayjs().format('YYYY-MM-DD')
  // Añadir siempre el día actual
  dates.add(today)

  roomStore.rooms.forEach((room) => {
    room.state?.forEach((state) => {
      if (state.reserved_date && (state.reserved_date >= today)) dates.add(state.reserved_date)
      roomStore.rooms.sort((a, b) => {
       if (a.id > b.id) {
                        return 1;
                    }
                    if (a.id < b.id) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
    })
    })
  })

  // Ordenar para que la visualización sea coherente
  return [...dates].sort((a, b) => dayjs(a).isBefore(dayjs(b)) ? -1 : 1)
})

onMounted(() => {

  void roomStore.fetchRooms()
})

</script>
<template>
    <HeaderComponent />
    
   <FilterComponent />
   <div class="div-tbl">
    <table>
        <thead>
  <tr> <!-- Abre una fila para la cabecera -->
    <th>Habitación</th>
    <th>Piso</th> 
    <th>Tipo</th>
    <th v-for="date in roomDates" :key="date">
      {{ dayjs(date).format("DD/MM/YYYY") }}
    </th>
  </tr>
</thead>
        <tbody>
            <tr v-for="room in roomStore.filteredRooms" :key="room.id">
                <RoomRow :room="room" :dates="roomDates"></RoomRow>
            </tr>
        </tbody>
    </table>
    </div>
</template>
<style>

/* Contenedor principal que alinea y limita el ancho de la tabla con el header */
.div-tbl {
  width: 100%;
  max-width: 1300px;
  margin: 30px auto; /* Centra la tabla horizontalmente */
  overflow-x: auto;  /* Permite scroll horizontal si la pantalla es pequeña */
  background-color: #0f172a;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid #334155;
}

/* Estilo nativo y correcto para la tabla */
table {
  width: 100%;
  border-collapse: collapse; /* Elimina espacios entre celdas para que cuadren las columnas */
  text-align: center;
  color: #f8fafc;
}

/* Cabecera */
thead {
  background-color: #1e293b;
  border-bottom: 2px solid #334155;
}

th {
  padding: 1rem 1.5rem;
  font-size: 0.8rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94a3b8;
}

/* Celdas del cuerpo */
td {
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  border-bottom: 1px solid #1e293b;
}

/* Alternancia de colores elegante para tema oscuro */
tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.02);
}

tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

</style>