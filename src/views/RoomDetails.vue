<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { useRoomStore } from '../stores/room';
import { watch } from 'vue';
import dayjs from 'dayjs';
// @ts-ignore TypeScript has no declaration for this Vue component.
import HeaderComponent from '../components/HeaderComponent.vue';

const route = useRoute()
const roomStore = useRoomStore()
const name = ref("")
const dni = ref("")

// Obtenemos la habitación de forma reactiva
const room = computed(() => roomStore.getRoom(route.params.id.toString()));

// El orden de room_states no está garantizado; seleccionamos el estado de hoy.
const roomState = computed(() => {
    if (!room.value) return undefined;

    return room.value.state?.find(
        (state) => state.reserved_date === dayjs().format('YYYY-MM-DD')
    ) || {
        available: true,
        dirty: false,
        reserved: false,
        occupant: '',
        dni: "",
        idBooking: null,
    };
});


watch(
    () => route.params.id,
    () => {
        name.value = ""
        dni.value = ""
        if (!room.value) void roomStore.fetchRooms()
    },
    { immediate: true }
)



</script>
<template>
    <HeaderComponent />
    <h2>Detalles de la habitación</h2>
    <h3 v-if="!roomState">
        {{ roomStore.cargando ? 'Cargando habitación...' : 'La habitación no existe' }}
    </h3>
    <div v-else class="room-details-container">

        <section class="room-details">


            <h4>Habitación: {{ route.params.id }}</h4>

            <p>Planta: {{ room?.floor }}</p>
            <p>Tipo: {{ room?.roomType }}</p>
            <p v-if="roomState.available">Estado: Disponible</p>
            <p v-else-if="!roomState.available && !roomState.dirty"> Estado: No disponible <br>
                Ocupada por: {{ roomState.occupant }}
            </p>
            <p v-else>Estado: Sucia</p>
        </section>

        <section class="booking-actions">
            <div v-if="roomState.available">
                <form class="formu" @submit.prevent="roomStore.checkIn(route.params.id.toString(), name, dni)">
                    <label class="labels">Nombre: </label>
                    <input type="text" placeholder="Inserte nombre" v-model="name" required>
                    <br>
                    <label class="labels">DNI: </label>
                    <input type="text" placeholder="Inserte DNI" v-model="dni" required>
                    <br>
                    <button style="background-color: green; color: white; border-radius: 5px;" >Check-in</button>
                </form>
            </div>
            <div v-if="!roomState.available && !roomState.dirty">

                <button v-on:click="roomStore.checkOut(route.params.id.toString())" style="background-color: red; color: white; border-radius: 5px;">Check-out</button>

            </div>
            <div v-if="roomState.dirty">
                <button v-on:click="roomStore.clean(route.params.id.toString())" style="background-color: yellow; color: black; border-radius: 5px;">Limpiar</button>
            </div>
            <div>
                <p>
               
                    <RouterLink :to="{ name: 'bookRoom', params: { id: route.params.id } }"> <button style="background-color: blue; color: white; border-radius: 5px;">Reservar habitación </button>
                    </RouterLink>
                </p>
            </div>
        </section>
    </div>


</template>
<style>
.room-details-container {
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

    .room-details {
        flex: 1;
        margin-right: 20px;
        text-align: left;
    }

    .booking-actions {
        text-align: right;
        .formu {
            
            margin-top: 20px;
            margin-bottom: 20px;

            .labels {

                margin: 10px;
                color: white;
            }

        }
    }
}
</style>

/* ! (Operador de aserción no nula):
Este es un operador exclusivo de TypeScript. Le dice al compilador:
"Confía en mí, sé que room existe y no es null ni undefined en este momento".

¿Por qué se pone? Porque métodos como .find() a veces pueden no encontrar
nada y devolver undefined. Si TypeScript fuera estricto, se quejaría si intentas
leer propiedades de algo que podría ser undefined. Con el ! le quitas esa advertencia.*/