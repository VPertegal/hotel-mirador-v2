<script setup lang="ts">




import { ref } from 'vue'
import { supabase } from '../supabase'

const email = ref('')
const loading = ref(false)
const message = ref('')
const errorMsg = ref('')

const handlePasswordlessAuth = async () => {
  loading.value = true
  message.value = ''
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: new URL("/principal", window.location.origin).toString(),
      // shouldCreateUser: true por defecto; cámbialo a false para bloquear nuevos registros
    },
  })

  loading.value = false

  if (error) {
    errorMsg.value = error.message
  } else {
    message.value = 'Revisa tu correo: te enviamos un enlace de confirmación.'
  }
}

</script>

<template>

   

        <h2>Acceso a Hotel Mirador</h2>
    <div class="form-container"> 
    <form @submit.prevent="handlePasswordlessAuth">
        <section class="form-section">
        <label class="labels">Correo electrónico: </label>
        <input type="email" name="email" id="email" v-model="email" required>
        <br>
      
        </section>
        <section class="form-btn">
        <button type="submit" :disabled="loading" style="background-color: blue; color: white; border-radius: 5px; ">{{ loading ? 'Enviando...' : 'Continuar sin contraseña' }}</button>
         <p v-if="message">{{ message }}</p>
          <p v-if="errorMsg">{{ errorMsg }}</p>
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