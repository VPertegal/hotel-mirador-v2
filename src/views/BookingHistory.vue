<script setup lang="ts">
// @ts-ignore TypeScript has no declaration for this Vue component.
import HeaderComponent from '../components/HeaderComponent.vue';
import { computed, watch } from 'vue';
import { useRoomStore } from '../stores/room'; // Ajusta la ruta según la ubicación de tu store
import dayjs from 'dayjs';


const roomStore = useRoomStore();



// Propiedad computada para extraer todas las reservas de forma aplanada
const historicalBookings = computed(() => {
    const bookings: Array<{ id: string; id_booking: number; roomType: string;  reserved_date: string; reserved_checkout: string | null | undefined; occupant: string, dni: string | null | undefined }> = [];
    // Recorremos las habitaciones de la store
    roomStore.rooms.forEach(room => {
        // Recorremos el array 'state' de cada habitación
        room.state.forEach(day => {
            // Si está reservado, lo añadimos a nuestra lista histórica
            if (day.reserved && day.reserved_date) {

               
                
                bookings.push({
                    id: room.id,
                    roomType: room.roomType,
                    reserved_date: day.reserved_date,
                    reserved_checkout: day.reserved_checkout,
                    occupant: day.occupant || 'Sin nombre',
                    dni: day.dni,
                    id_booking: day.id_booking
                    
                });
                

            }
        });
    });

    const seenDnis = new Set<string>();

    return bookings
        .sort((a, b) => (a.dni ?? '').localeCompare(b.dni ?? ''))
        .filter(booking => {
            const dni = booking.dni?.trim().toUpperCase();

            // Si no hay DNI, conserva la entrada; no las agrupa entre sí.
            if (!dni) return true;

            if (seenDnis.has(dni)) return false;
            seenDnis.add(dni);
            return true;
        });


});

watch( 

   historicalBookings,

    async () => { 
       await roomStore.fetchRooms()
       await roomStore.fetchBooks()
    },
    
    

 { immediate: true}

);

</script>
<template>
    <HeaderComponent />
    <h2>Histórico de reservas</h2>
    
<h4 v-if="historicalBookings.length === 0"> No existen reservas </h4>
    <ul class="booking-list" v-for="(booking, index) in historicalBookings" :key="index">
        
        <li class="booking-item">
            
            <div class="booking-details">
            <h4>Ocupante: {{ booking.occupant }}</h4>
            <h4>DNI: {{ booking.dni }}</h4>
            <p >Habitación: {{ booking.id }}</p>
            <p>Tipo: {{ booking.roomType }}</p>
            <p style="color: green">Check-in: {{ dayjs(booking.reserved_date).format("DD/MM/YYYY") }}</p>
            <p style="color: red;">Check-out: {{ dayjs(booking.reserved_checkout).format("DD/MM/YYYY") }}</p>
            </div>
            <div class="booking-actions">
            <p class="details-button"> <RouterLink :to ="{name: 'bookDetails', params: { id_booking: booking.id_booking }}"> Detalles</RouterLink> </p>
            </div>
            
        </li>

    </ul>
    
</template>
<style>

h2 {
    text-align: center;
    color: #f8fafc;
    margin-top: 20px;
}

.booking-list {
    list-style-type: none; /* Elimina los puntos de la lista */}
    .booking-item {
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

        .booking-details {
            flex: 1;
            margin-right: 20px;
        }
        .booking-actions {
            display: flex;
            align-items: center;
        }
    }

    .delete-button {
        background-color: transparent;
        border: none;
        img {
            width: 30px;
            height: 30px;
        }

        img:hover {
            filter: brightness(0.8);
            width: 35px;
            height: 35px;
            cursor: pointer;
        }
    }


</style>