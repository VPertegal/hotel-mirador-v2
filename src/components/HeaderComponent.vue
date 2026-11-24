<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const session = ref(null)
let authListener = null

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
  authListener = listener.subscription
})

onUnmounted(() => {
  authListener?.unsubscribe()
})

const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    alert('No se pudo cerrar sesión: ' + error.message)
    return
  }

  await router.replace({ name: 'Signin' })
}

</script>
<template>
    <header class="header">
    

          
            <div v-if="session">
    <p>Conectado como {{ session.user.email }}</p>
    <button @click="signOut">Cerrar sesión</button>
  </div>
        
        <h1>Hotel Mirador</h1>

        <nav class="nav-list">
           
        <ul class="list">
<!--Se usa la etiqueta a para enlaces fuera de nuestra web.
Para enlaces dentro: RouterLink-->
            <li><RouterLink class="link" to="/principal">Inicio</RouterLink></li>
            <li><RouterLink class="link" to="/rooms">Habitaciones</RouterLink></li>
            <li><RouterLink class="link" to="/bookinghistory">Reservas</RouterLink></li>
        </ul>
        </nav>
    </header>
</template>
<style>
.header {
    background-color: gray;
    color: black;
    text-align: center;
    padding: 20px;
    .nav-list {
        .list {
            display: flex;
            justify-content: space-around;
            list-style-type: none;
            .link {
                color: black;
                text-decoration: none;
            
                }
            }
        
    }
    
}
.link:hover {
    font-weight: bold;
}
</style>