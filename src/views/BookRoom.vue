<script setup lang="ts">

import { computed, reactive, ref, watch } from 'vue';
// @ts-ignore TypeScript has no declaration for this Vue component.
import HeaderComponent from '../components/HeaderComponent.vue';
import { useRoomStore } from '../stores/room.ts';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import router from '../router/index.ts';




const route = useRoute()
const roomStore = useRoomStore()
const checkinDay = ref('')
const checkoutDay = ref('')
const occupant = ref('')
const dni = ref('')


const booking = reactive({
    occupant: occupant,
    payer: "",
    dni: dni,
    birthday: "",
    email: "",
    mobile: "",
  
    checkin: checkinDay,
    checkout: checkoutDay,
    breakfast: false,
    parking: false,
    spa: false,
    booking_price: 0,
})

const state = reactive({
    reserved_date: checkinDay,
    reserved_checkout: checkoutDay,
    available: false,
    dirty: false,
    reserved: true,
    occupant: occupant,
    dni: dni,
})

const roomID = computed(() => String(route.params.id));
const room = computed(() => roomStore.getRoom(roomID.value));

watch(
  roomID,
  async (id) => {
    if (!roomStore.getRoom(id)) {
      await roomStore.fetchRooms();
    }
  },
  { immediate: true }
);

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
    
     const idBooking = await roomStore.bookDetails( roomID.value, {...booking})
     if (!idBooking) return;

   for (let i = 0; i < totalDays; i++) {
  const reservedDate = dayjs(booking.checkin)
    .add(i, "day")
    .format("YYYY-MM-DD");

  const saved = await roomStore.bookRoom(roomID.value, {
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
  () => route.params.id,
   async () => { 
       await roomStore.fetchRooms()
    },
  { immediate: true,
   }
);

</script>
<template>
    <HeaderComponent />
    <h2>Reserva para la habitación {{ room?.id }}</h2>
    <div class="form-container"> 
    <form @submit.prevent="funSubmit">
        <section class="form-section">
        
        <br>
        <label class="labels">Titular de la reserva: </label>
        <input type="text" name="occupant" id="occupant" v-model="occupant" required>
        <br>
        <label class="labels">Pagador: </label>
        <input type="text" name="payer" id="payer" v-model="booking.payer" required>
        <br>
        <label class="labels">DNI: </label>
        <input type="text" name="dni" id="dni" v-model="dni" required>
        <br>
        <label class="labels">Fecha de nacimiento: </label>
        <input type="date" name="birthday" id="birthday" v-model="booking.birthday" required>
        <br>
        <label class="labels">Email: </label>
        <input type="email" name="email" id="email" v-model="booking.email" required>
        <br>
        <label class="labels">Móvil: </label>
        <input type="phone" name="mobile" id="mobile" v-model="booking.mobile" required>
        <br>
        <label class="labels"> 
            <p>Habitación: {{ room?.id }} </p>
            <p>Planta: {{ room?.floor }} </p>
            <p>Tipo de habitación: {{ room?.roomType }} </p>
            <p>Precio de la habitación: {{ room?.roomPrice }} €</p>
        </label>
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
        <p >Precio total de la reserva: {{ total()  }} €</p>

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