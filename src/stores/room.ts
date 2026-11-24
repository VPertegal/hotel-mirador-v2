import { defineStore } from "pinia";
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { supabase } from "../supabase"; // Asegúrate de tener tu cliente configurado
import router from "../router";

export interface RoomState {
  date: string;
  reserved_date?: string | null;
  reserved_checkout?: string | null;
  available: boolean;
  dirty: boolean;
  reserved: boolean;
  occupant?: string | null;
  dni?: string | null;
  id_booking: number;
}

export interface Bookings {
  occupant: string;
  payer: string;
  dni: string;
  birthday: string;
  email: string;
  mobile: string;
  id_booking: number;
  room: string;
  checkin: string;
  checkout: string;
  breakfast: boolean;
  parking: boolean;
  spa: boolean;
  booking_price: number;
}

export interface Room {
  id: string;
  floor: string;
  roomType: string;
  roomPrice: number;
  state: RoomState[];
  bookings: Bookings[];
}

export const useRoomStore = defineStore("room", () => {
  // 1. Estados reactivos globales
  const rooms = ref<Room[]>([]);
  const bookings = ref<Bookings[]>([]);
  const cargando = ref(false);
  const dateTH = ref(new Set([dayjs().format("YYYY-MM-DD")]));
  const filters = ref({
    floor: "",
    roomType: "",
    available: false,
    dirty: false,
    roomID: "",
  });

  // 2. FUNCIÓN: Obtener todas las habitaciones y sus estados desde la API
  const fetchRooms = async () => {
    cargando.value = true;
    try {
      // Traemos las habitaciones junto con su relación de estados (room_states)
      const { data, error } = await supabase.from("rooms").select(`
            id,
            floor,
            roomType:room_type,
            roomPrice:room_price,
            state:room_states (*),
            bookings:bookings (*)
          `);

      if (error) throw error;
      rooms.value = data || [];
    } catch (err: any) {
      console.error("Error al cargar habitaciones:", err.message);
    } finally {
      cargando.value = false;
    }
  };

  // 3. FUNCIÓN: Buscar una habitación localmente o forzar fetch si no está
  const getRoom = (roomID: string) => {
    return rooms.value.find((room) => room.id === roomID);
  };

  // Buscar la reserva
  const getBooking = (bookingID: string) => {
    return rooms.value.find((book) =>
      book.bookings.find((id) => id.id_booking.toString() === bookingID),
    );
  };

  //Consulta de la reserva
  const fetchBooks = async () => {
    cargando.value = true;
    try {
      // Traemos las habitaciones junto con su relación de estados (room_states)
      const { data, error } = await supabase.from("bookings").select(`
              id_booking,
              occupant,
              payer,
              dni,
              birthday,
              email,
              mobile,              
              room,
              checkin,
              checkout,
              breakfast,
              parking,
              spa,
                booking_price
          `);

      if (error) throw error;
      bookings.value = data || [];
    } catch (err: any) {
      console.error("Error al cargar la reserva:", err.message);
    } finally {
      cargando.value = false;
    }
  };

  // FUNCIÓN: Check-in

  const checkIn = async (roomID: string, name: string, dni: string) => {
    const today = dayjs().format("YYYY-MM-DD");
    try {
      // Actualizamos el estado de la habitación para marcarla como ocupada
      const { error } = await supabase.from("room_states").upsert(
        {
          room_id: roomID,
          reserved_date: today, // Clave única junto a room_id
          date: today,
          available: false,
          reserved: false,
          occupant: name,
          dni: dni,
          dirty: false,
        },
        { onConflict: "room_id, reserved_date" },
      );

      if (error) throw error;

      alert("Se realizó el check-in");
      await fetchRooms(); // Sincronizamos de nuevo
      router.push({ path: "/rooms" });
    } catch (err: any) {
      console.error("Error al realizar check-in:", err.message);
    }
  };

  // FUNCIÓN: Checkout

  const checkOut = async (roomID: string) => {
    const today = dayjs().format("YYYY-MM-DD");
    try {
      // Actualizamos el estado de la habitación para marcarla como sucia
      const { error } = await supabase.from("room_states").upsert(
        {
          room_id: roomID,
          reserved_date: today, // Clave única junto a room_id
          date: today,
          available: false,
          reserved: false,
          occupant: "",
          dni: "",
          dirty: true,
        },
        { onConflict: "room_id, reserved_date" },
      );

      if (error) throw error;

      alert("Se realizó el check-out");
      await fetchRooms(); // Sincronizamos de nuevo
      router.push({ path: "/rooms" });
    } catch (err: any) {
      console.error("Error al realizar check-out:", err.message);
    }
  };

  // FUNCIÓN: Limpiar

  const clean = async (roomID: string) => {
    const today = dayjs().format("YYYY-MM-DD");
    try {
      // Actualizamos el estado de la habitación para marcarla como sucia
      const { error } = await supabase.from("room_states").upsert(
        {
          room_id: roomID,
          reserved_date: today, // Clave única junto a room_id
          date: today,
          available: true,
          reserved: false,
          occupant: "",
          dni: "",
          dirty: false,
        },
        { onConflict: "room_id, reserved_date" },
      );

      if (error) throw error;

      alert("Se realizó la limpieza");
      await fetchRooms(); // Sincronizamos de nuevo
      router.push({ path: "/rooms" });
    } catch (err: any) {
      console.error("Error al realizar check-out:", err.message);
    }
  };

  // 5. FUNCIÓN: Reservar habitación (Interactúa con la Base de Datos y controla el estado
  // de la habitación) Crea nuevos estados

  const bookRoom = async (roomID: string, stateData: any): Promise<boolean> => {
    const room = rooms.value.find((item) => item.id === roomID);

    if (!room) return false;

    const dateAlreadyReserved = room.state.some(
      (state) => state.reserved_date === stateData.reserved_date,
    );

    if (dateAlreadyReserved) {
      alert("Ya existe una reserva para esa fecha");
      return false;
    }

    try {
      const { error } = await supabase.from("room_states").upsert(
        {
          room_id: roomID,
          id_booking: stateData.id_booking,
          date: dayjs().format("YYYY-MM-DD"),
          reserved_date: stateData.reserved_date,
          reserved_checkout: stateData.reserved_checkout,
          available: stateData.available,
          dirty: stateData.dirty,
          reserved: stateData.reserved,
          occupant: stateData.occupant,
          dni: stateData.dni,
        },
        { onConflict: "room_id, reserved_date" },
      );

      if (error) throw error;

      await fetchRooms();
      return true;
    } catch (err: any) {
      alert("No se pudo realizar la reserva: " + err.message);
      return false;
    }
  };

  // Función de detalles de reserva crea un detalle de reserva nuevo

  const bookDetails = async (roomID: string, bookingData: any) => {
    const IDfind = rooms.value.find((room) => room.id === roomID);
    if (IDfind) {
      const checkinFind = IDfind.bookings.findIndex(
        (bookings) => bookings.checkin === bookingData.checkin,
      );

      const checkoutFind = IDfind.bookings.findIndex(
        (bookings) => bookings.checkout === bookingData.checkout,
      );

      if (checkinFind !== -1 || checkoutFind !== -1) {
        alert("Ya existe una reserva para esas fechas");
        return;
      } else {
        try {
          // Guardamos o actualizamos el estado de ese día específico en Supabase usando upsert
          const { data, error } = await supabase
            .from("bookings")
            .insert(
              {
                occupant: bookingData.occupant,
                payer: bookingData.payer,
                dni: bookingData.dni,
                birthday: bookingData.birthday || null,
                email: bookingData.email,
                mobile: bookingData.mobile,
                room: roomID,
                checkin: bookingData.checkin,
                checkout: bookingData.checkout,
                breakfast: bookingData.breakfast,
                parking: bookingData.parking,
                spa: bookingData.spa,
                booking_price: bookingData.booking_price,
              },
              {},
            )
            .select("id_booking")
            .single();
          if (error) throw error;

          alert("Se realizó la reserva correctamente");

          await fetchRooms(); // Recargamos los datos para mantener la store sincronizada
          return data.id_booking;
        } catch (err: any) {
          alert("No se pudo realizar la reserva: " + err.message);
        }
      }
    }
  };

  // FUNCIÓN: Modificar reserva

  const bookUpdate = async (
    bookID: number,
    roomID: string,
    bookingData: any,
  ) => {
    const bookIDfind = bookings.value.find(
      (book) => book.id_booking === bookID,
    );
    if (!bookIDfind) {
      alert("No existe la reserva");
      return;
    }

    const IDfind = rooms.value.find((room) => room.id === roomID);
    if (IDfind) {
      const hasConflict = IDfind.bookings.some(
        (existing) =>
          existing.id_booking !== bookID &&
          bookingData.checkin < existing.checkout &&
          bookingData.checkout > existing.checkin,
      );

      if (hasConflict) {
        alert(
          "Ya existe una reserva para esas fechas en la habitación elegida",
        );
        return;
      } else {
        try {
          await delState(bookID); // siguiente función
          // Guardamos o actualizamos el estado de ese día específico en Supabase usando upsert
          const { data, error } = await supabase
            .from("bookings")
            .update(
              {
                occupant: bookingData.occupant,
                payer: bookingData.payer,
                dni: bookingData.dni,
                birthday: bookingData.birthday || null,
                email: bookingData.email,
                mobile: bookingData.mobile,
                room: roomID,
                checkin: bookingData.checkin,
                checkout: bookingData.checkout,
                breakfast: bookingData.breakfast,
                parking: bookingData.parking,
                spa: bookingData.spa,
                booking_price: bookingData.booking_price,
              },
              {},
            )
            .eq("id_booking", bookID)
            .select("id_booking")
            .single();
          if (error) throw error;

          alert("Se actualizó la reserva correctamente");

          await fetchRooms(); // Recargamos los datos para mantener la store sincronizada
          return data.id_booking;
        } catch (err: any) {
          alert("No se pudo realizar la reserva: " + err.message);
        }
      }
    }
  };

  // FUNCIÓN: Borrar estado para crear unos nuevos

  const delState = async (id_booking: number) => {
    try {
      // Actualizamos el estado en la base de datos para dejarlo libre
      const { error } = await supabase
        .from("room_states")
        .delete()
        .eq("id_booking", id_booking);

      if (error) throw error;

      alert("Se borró el estado de la reserva nº" + id_booking);

      await fetchRooms(); // Sincronizamos de nuevo
    } catch (err: any) {
      alert("Error al borrar la reserva: " + err.message);
    }
  };

  // 6. FUNCIÓN: Borrar / Cancelar reserva
  const delBook = async (id_booking: number) => {
    try {
      // Actualizamos el estado en la base de datos para dejarlo libre
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id_booking", id_booking);

      if (error) throw error;

      alert("Se borró la reserva nº" + id_booking);
      router.push("/bookinghistory");
      await fetchRooms(); // Sincronizamos de nuevo
    } catch (err: any) {
      alert("Error al borrar la reserva: " + err.message);
    }
  };

  // 7. Propiedad computada de filtrado (idéntica a la tuya)
  const filteredRooms = computed(() => {
    return rooms.value.filter((room) => {
      const matchesFloor =
        !filters.value.floor || room.floor === filters.value.floor;
      const matchesType =
        !filters.value.roomType ||
        room.roomType.toLocaleLowerCase() ===
          filters.value.roomType.toLocaleLowerCase();
      const currentState = room.state?.find(
        (state) => state.reserved_date === dayjs().format("YYYY-MM-DD"),
      );

      const matchesAvailable =
        !filters.value.available ||
        currentState?.available === filters.value.available ||
        currentState === undefined;

      const matchesDirty =
        !filters.value.dirty || currentState?.dirty === filters.value.dirty;

      return matchesFloor && matchesType && matchesAvailable && matchesDirty;
    });
  });

  return {
    clean,
    checkIn,
    checkOut,
    rooms,
    bookings,
    cargando,
    dateTH,
    filters,
    filteredRooms,
    fetchRooms,
    getRoom,
    bookRoom,
    bookDetails,
    bookUpdate,
    delState,
    delBook,
    getBooking,
    fetchBooks,
  };
});
