<script setup lang="ts">

import { useRoomStore } from '../stores/room';
const roomStore = useRoomStore();

const handleFilter = (e: Event) => {
    e.preventDefault(); // Evita que el formulario recargue la página
    // Los valores ya están en roomStore.filters gracias a v-model
};

</script> 
<template>
<form @submit="handleFilter" class="filter-form">
        <label class="labels">Planta:</label>
        <input v-model="roomStore.filters.floor" list="floors">
         <datalist id="floors">
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
        </datalist>
        
        <label class="labels">Tipo:</label>
        <input v-model="roomStore.filters.roomType" list="roomTypes">
        <datalist id="roomTypes">
            <option value="Individual"></option>
            <option value="Doble"></option>
            <option value="Triple"></option>
        </datalist>

        <label class="labels">Disponible:</label>
        <input name="available" type="checkbox" v-model="roomStore.filters.available">

        <label class="labels">Sucia:</label>
        <input name="dirty" type="checkbox" v-model="roomStore.filters.dirty">
      
    </form>
</template>

<style>
.filter-form {
    
    margin-top: 20px;
    margin-bottom: 20px;
    .labels {
       
        margin: 10px;
        color: white;
    }

    .filter-btn {
        margin-left: 10px;
    }
}

</style>