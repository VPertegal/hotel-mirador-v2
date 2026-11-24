
<script setup lang="ts">

import { computed, reactive, ref, watch } from 'vue';
// @ts-ignore TypeScript has no declaration for this Vue component.
import HeaderComponent from '../components/HeaderComponent.vue';
import { useRoomStore } from '../stores/room.ts';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import router from '../router/index.ts';

const bookDetails = computed(() =>
  roomStore.bookings.find(
    booking => String(booking.id_booking) === String(route.params.id_booking)
  )
);

const room = computed(() => {
  const roomId = selectedRoomId.value || bookDetails.value?.room
  return roomId ? roomStore.getRoom(roomId) : undefined
})


const route = useRoute()
const roomStore = useRoomStore()

//Se guardan los valores en constantes para que v-model los coja como predefinidos y los 
//muestre en el formulario por defecto
const occupant = ref(bookDetails.value?.occupant)
const payer = ref(bookDetails.value?.payer)
const dni = ref(bookDetails.value?.dni)
const birthday = ref(bookDetails.value?.birthday)
const email = ref(bookDetails.value?.email)
const mobile = ref(bookDetails.value?.mobile)
const checkinDay = ref(bookDetails.value?.checkin)
const checkoutDay = ref(bookDetails.value?.checkout)


const selectedRoomId = ref('')


const booking = reactive({
    occupant: occupant,
    payer: payer,
    dni: dni,
    birthday: birthday,
    email: email,
    mobile: mobile,
    checkin: checkinDay,
    checkout: checkoutDay,
    breakfast: false,
    parking: false,
    spa: false,
    booking_price: 0,
})

const state = reactive({
    room: selectedRoomId,
    reserved_date: checkinDay,
    reserved_checkout: checkoutDay,
    available: false,
    dirty: false,
    reserved: true,
    occupant: occupant,
    dni: dni,
})




const total = () => {

    const totalDays = dayjs(booking.checkout).diff(booking.checkin, 'days')
    const breakfastPrice = 10
    const parkingPrice = 5
    const spaPrice = 20
    const roomPrice = room.value?.roomPrice ?? 0

    let totalPrice = roomPrice * totalDays

    if(!totalDays) {
        return 0
    }

    if (booking.breakfast) {
        totalPrice += breakfastPrice * totalDays
    }
    if (booking.parking) {
        totalPrice += parkingPrice * totalDays
    }
    if (booking.spa) {
        totalPrice += spaPrice * totalDays
    }

    booking.booking_price = totalPrice

    return totalPrice

}




const  funSubmit = async () => {

    const bookDate = dayjs(booking.checkin)
    const today = dayjs()
   // const adult = dayjs(dayjs()).diff(booking.birthday, 'year')

    if(bookDate.isBefore(today, 'day')) {
        alert ("No se puede seleccionar un día inferior al día de hoy")
        return;
    

    } else if (bookDate.isAfter(booking.checkout)) 
    {
        alert("El check-in es posterior al check-out")
        return;
    } /*else if (adult < 18) 
    {
        alert("Fecha de nacimiento incorrecta: has de ser mayor de edad")
        return;
    } */
 else {

    

     const totalDays = dayjs(booking.checkout).diff(booking.checkin, 'days')
    
    const currentBookingId = bookDetails.value?.id_booking
    if (currentBookingId === undefined) return;

  

    const idBooking = await roomStore.bookUpdate(currentBookingId, selectedRoomId.value, {...booking})
     if (!idBooking) return;

   for (let i = 0; i < totalDays; i++) {
  const reservedDate = dayjs(booking.checkin)
    .add(i, "day")
    .format("YYYY-MM-DD");

  const saved = await roomStore.bookRoom(selectedRoomId.value, {
    ...state,
    id_booking: idBooking,
    reserved_date: reservedDate,
  });

  if (!saved) return;
}

router.push({ path: "/rooms" });
    
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

watch(bookDetails, (booking) => {
  if (booking) selectedRoomId.value = booking.room
}, { immediate: true })

watch(bookDetails, details => {
  if (!details) return

  selectedRoomId.value = details.room
  occupant.value = details.occupant
  payer.value = details.payer
  dni.value = details.dni
  checkinDay.value = details.checkin
  checkoutDay.value = details.checkout
  booking.breakfast = details.breakfast
  booking.parking = details.parking
  booking.spa = details.spa
}, { immediate: true })

</script>
<template>
    <HeaderComponent />
    <h2>Actualizar reserva {{ bookDetails?.id_booking }} para la habitación {{ room?.id }}</h2>
    <div class="form-container"> 
    <form @submit.prevent="funSubmit">
        <section class="form-section">
        
        <br>
        <label class="labels">Titular de la reserva: </label>
        <input type="text" name="occupant" id="occupant" v-model="occupant" required >
        <br>
        <label class="labels">Pagador: </label>
        <input type="text" name="payer" id="payer" v-model="payer" required>
        <br>
        <label class="labels">DNI: </label>
        <input type="text" name="dni" id="dni" v-model="dni" required>
        <br>
        <label class="labels">Fecha de nacimiento: </label>
        <input type="date" name="birthday" id="birthday" v-model="birthday" required>
        <br>
        <label class="labels">Email: </label>
        <input type="email" name="email" id="email" v-model="email" required>
        <br>
        <label class="labels">Móvil: </label>
        <input type="phone" name="mobile" id="mobile" v-model="mobile" required>
        <br>
        <div class="filter-room">
        <label class="labels" for="roomId">Habitación:</label>
<select id="roomId" v-model="selectedRoomId">
  <option disabled value="">Selecciona una habitación</option>
  <option
    v-for="roomOption in roomStore.rooms"
    :key="roomOption.id"
    :value="roomOption.id"
  >
    {{ roomOption.id }}
  </option>
</select>
        <label class="labels"> 
            <p>Planta: {{ room?.floor }} </p>
            <p>Tipo de habitación: {{ room?.roomType }} </p>
            <p>Precio de la habitación: {{ room?.roomPrice }} €</p>
        </label>
    </div>
        <br>
        <label class="labels">Check-In: </label>
        <input type="date" name="checkin" id="checkin" v-model="checkinDay" required>
        <br>
        <label class="labels">Check-Out: </label>
        <input type="date" name="checkout" id="checkout" v-model="booking.checkout" required>
        <br>
        <label class="labels">Breakfast: </label>
        <input type="checkbox" name="breakfast" id="breakfast" v-model="booking.breakfast">
        <p v-if="booking.breakfast" style="color: white;">Precio del desayuno: 10 € / día</p>
        <br>
        <label class="labels">Parking: </label>
        <input type="checkbox" name="parking" id="parking" v-model="booking.parking">
        <p v-if="booking.parking" style="color: white;">Precio del parking: 5 € / día</p>
        <br>
        <label class="labels">Spa: </label>
        <input type="checkbox" name="spa" id="spa" v-model="booking.spa">
        <p v-if="booking.spa" style="color: white;">Precio del spa: 20 € / día</p>
        <br>
        <p v-if="booking.breakfast || booking.parking || booking.spa" style="color: white;">Precio total de la reserva por día: {{ (room?.roomPrice ?? 0) + (booking.breakfast ? 10 : 0) + (booking.parking ? 5 : 0) + (booking.spa ? 20 : 0) }} €</p>
        <p >Precio total de la reserva: {{ total() }} €</p>

        </section>
        <section class="form-btn">
        <button style="background-color: blue; color: white; border-radius: 5px; ">Reserva</button>
        </section>
    </form>
    </div>

</template>
<style>
.form-container {
     background-color: #0f172a;
    border: 1px solid #334155;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    margin: 20px auto;
    padding: 20px;
    max-width: 600px;
    color: #f8fafc;
    display: flex;
    justify-content: space-between;

.form-section {
    text-align: left;
    margin-top: 20px;
    margin-bottom: 20px;
    
    .labels {
       
        margin: 10px;
        color: white;
    }
.form-btn {
    text-align: center;
    }
}
}
</style>