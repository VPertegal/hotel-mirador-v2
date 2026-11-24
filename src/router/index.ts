import { createRouter, createWebHistory } from 'vue-router';
import Principal from '../views/Principal.vue';
import Rooms from '../views/Rooms.vue';
import RoomDetails from '../views/RoomDetails.vue';
import BookRoom from '../views/BookRoom.vue';
import BookingHistory from '../views/BookingHistory.vue';
import Signup from '../views/Signup.vue';
import Signin from '../views/Signin.vue';
import BookDetails from '../views/BookDetails.vue';
import BookUpdate from '../views/BookUpdate.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [

     {
        path: "/",
        name: "Signin",
        component: Signin
    },
    {
        path: "/principal",
        name: "Principal",
        component: Principal
    },
    {
        path: "/rooms",
        name: "Rooms",
        component: Rooms
    },
    {
        path: "/rooms/:id",
        name: "roomDetails",
        component: RoomDetails
    },
    {
        path: "/rooms/:id/bookroom",
        name: "bookRoom",
        component: BookRoom
    },
    {
        path:"/bookinghistory",
        name: "bookingHistory",
        component: BookingHistory
    },

    {
        path:"/bookinghistory/:id_booking",
        name: "bookDetails",
        component: BookDetails
    },

    {
        path:"/bookinghistory/:id_booking/bookupdate",
        name: "bookUpdate",
        component: BookUpdate
    },

    {
        path: "/signup",
        name: "signup",
        component: Signup
    }
]

})

export default router;