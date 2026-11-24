# Diferencias entre `hotel-mirador` y `hotel-mirador-v2`

Esta comparación toma como referencia la rama `main` de `VPertegal/hotel-mirador` en el commit base `0d1a399`.

## Resumen

`hotel-mirador` parte de la plantilla inicial de Vue 3, TypeScript y Vite. `hotel-mirador-v2` la convierte en una aplicación de gestión de habitaciones y reservas conectada a Supabase.

## Cambios principales

- **Persistencia y datos:** se añade Supabase para consultar habitaciones y reservas, registrar reservas y actualizar sus estados por fecha. Pinia centraliza los datos y las operaciones de la aplicación.
- **Habitaciones:** se incorporan listados con información de planta y tipo, disponibilidad por fechas, filtros y vistas de detalle.
- **Reservas:** se añade el flujo para crear reservas, calcular el precio según las noches y los servicios opcionales, consultar el historial y los detalles, modificar y cancelar reservas.
- **Acceso de usuarios:** se añaden pantallas de acceso y registro por enlace enviado al correo electrónico, además de mostrar la sesión y permitir cerrarla.
- **Navegación:** el router incluye rutas para inicio, habitaciones, reservas, detalles de una reserva y su modificación.
- **Interfaz:** se agregan componentes para mostrar y filtrar habitaciones, junto con imágenes para los tipos de habitación.
- **Ejecución en contenedor:** se incorporan cambios a Dockerfile y Docker Compose para compilar y servir la aplicación.

## Configuración necesaria

La aplicación obtiene la URL y la clave publicable de Supabase de estas variables de entorno:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

El archivo local `.env.local` no forma parte del repositorio. Antes de ejecutar la aplicación hay que configurar esas variables y disponer en Supabase de las tablas y políticas que usa la aplicación.
