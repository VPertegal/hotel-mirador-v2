<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useRoomStore } from '../stores/room';
import { watch } from 'vue';
import { RouterLink } from 'vue-router';
// @ts-ignore TypeScript has no declaration for this Vue component.
import HeaderComponent from '../components/HeaderComponent.vue';
import dayjs from 'dayjs';


const route = useRoute()
const roomStore = useRoomStore()



const bookDetails = computed(() =>
  roomStore.bookings.find(
    booking => String(booking.id_booking) === String(route.params.id_booking)
  )
);

const room = computed(() => {
  if (!bookDetails.value) return undefined;
  return roomStore.getRoom(String(bookDetails.value.room));
});



const breakfastPrice = computed(() => {
  if (bookDetails.value?.breakfast) {
    const count = dayjs(bookDetails.value?.checkout).diff(dayjs(bookDetails.value?.checkin), 'day');
    return count * 10
  }
});

const parkingPrice = computed(() => {
  if (bookDetails.value?.parking) {
    const count = dayjs(bookDetails.value?.checkout).diff(dayjs(bookDetails.value?.checkin), 'day');
    return count * 5
  }
});

const spaPrice = computed(() => {
  if (bookDetails.value?.spa) {
    const count = dayjs(bookDetails.value?.checkout).diff(dayjs(bookDetails.value?.checkin), 'day');
    return count * 20
  }
});

const roomPrice = computed(() => {
  const count = dayjs(bookDetails.value?.checkout).diff(dayjs(bookDetails.value?.checkin), 'day');
  const total = count * (room.value?.roomPrice ?? 0)
  return total

});

const deleteBook = () => {
  if(confirm("¿Seguro que desea eliminar esta reserva?")) {
    if (bookDetails.value?.id_booking !== undefined) {
      roomStore.delBook(bookDetails.value?.id_booking)
    }
  }

}


watch(
  () => route.params.id_booking,
  async () => {
    await roomStore.fetchBooks();
    await roomStore.fetchRooms();
  },
  { immediate: true }
);

</script>
<template>
  <HeaderComponent />
  <h2>Detalles de la reserva</h2>
  <h3 v-if="!bookDetails">
    {{ roomStore.cargando ? 'Cargando reserva...' : 'La reserva no existe' }}
  </h3>
  <div v-else class="book-details-container">
    <table class="table-details">
      <tbody>
      <tr>
    <td class="room-details">

      <h4>Detalles de la habitación</h4>
      <p>Habitación: {{ room?.id }}</p>
      <p>Tipo: {{ room?.roomType }}</p>
      <p>Planta: {{ room?.floor }}</p>
      <p style="color: green;">Check-in: {{ dayjs(bookDetails?.checkin).format("DD/MM/YYYY") }}</p>
      <p style="color: red;">Check-out: {{ dayjs(bookDetails?.checkout).format("DD/MM/YYYY") }}</p>
      <p>Precio por noche: {{ room?.roomPrice }} €</p>

    </td>

    <td class="galery-actions">
      <div v-if="room?.roomType === 'Individual'">
        <img src="../assets/1.png" alt="Habitación individual" height="250px">
      </div>
      <div v-if="room?.roomType === 'Doble'">
        <img src="../assets/2.png" alt="Habitación doble" height="250px">
      </div>
      <div v-if="room?.roomType === 'Triple'">
        <img src="../assets/3.png" alt="Habitación triple" height="250px">
      </div>
     
     
      <RouterLink :to="{ name: 'bookUpdate', params: { id_booking: route.params.id_booking } }">
      <button style="background-color: blue; color: white; border-radius: 5px; ">Modificar</button>
      </RouterLink> 
      
       
      <button v-on:click="deleteBook()" style="background-color: red; color: white; border-radius: 5px; margin-left: 20px; ">Borrar</button>
      

    </td>
    </tr>
    <tr>
      
    <td class="occupant-details">

      <h4>Detalles del cliente</h4>
      <p>Titular de la reserva: {{ bookDetails?.occupant }}</p>
      <p>Pagador: {{ bookDetails.payer }}</p>
      <p>DNI: {{ bookDetails.dni }}</p>
      <p>e-mail: {{ bookDetails.email }} €</p>


    </td>

   

    <td class="service-details">
       <h4>Servicios</h4>
      <div v-if="bookDetails?.breakfast">
        <p>
          Desayunos del día {{ dayjs(bookDetails?.checkin).add(1, 'day').format("DD/MM") }}
          al {{ dayjs(bookDetails?.checkout).format("DD/MM") }}: {{ breakfastPrice }} €
        </p>
      </div>
      <div v-if="bookDetails?.parking">
        <p>
          Parking del día {{ dayjs(bookDetails?.checkin).format("DD/MM") }}
          al {{ dayjs(bookDetails?.checkout).format("DD/MM") }}: {{ parkingPrice }} €
        </p>
      </div>
      <div v-if="bookDetails?.spa">
        <p>
          Spa del día {{ dayjs(bookDetails?.checkin).format("DD/MM") }}
          al {{ dayjs(bookDetails?.checkout).format("DD/MM") }}: {{ spaPrice }} €
        </p>
      </div>
      <p>
        Noche del {{ dayjs(bookDetails?.checkin).format("DD/MM") }}
        al {{ dayjs(bookDetails?.checkout).format("DD/MM") }}: {{ roomPrice }} €
      </p>
      <p style="font-weight: bold;">
        Cuantía total: {{ bookDetails.booking_price }} €
      </p>
    </td>
    </tr>
    </tbody>
    </table>
  </div>


</template>
<style>

h2 {
    text-align: center;
    color: #f8fafc;
    margin-top: 20px;
}

.book-details-container {
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
.table-details {
  width: 100%;
  border-collapse: collapse; /* Elimina espacios entre celdas para que cuadren las columnas */
  text-align: center;
  color: #f8fafc;
}



/* Celdas del cuerpo */
td {
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  border-bottom: 1px solid #1e293b;
}

tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.btn {
  margin-right: 10px;
}
</style>