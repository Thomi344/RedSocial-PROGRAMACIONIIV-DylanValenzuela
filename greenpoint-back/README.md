# ⚙️ GreenPoint - Backend API (NestJS)

Servidor API REST desarrollado con NestJS y MongoDB. Actúa como el motor de datos y reglas de negocio para la red social GreenPoint, garantizando respuestas con HTTP Status Codes correctos (`201 Created`, `400 Bad Request`, `401 Unauthorized`).

## 🛠️ Estructura de Módulos

- **Módulo Autenticación:** Emisión de tokens JWT, validación de sesiones, encriptado con Bcrypt y endpoints para refrescar tokens activos.
- **Módulo Usuarios:** CRUD de perfiles, subida de imágenes y gestión de roles (`usuario` / `administrador`).
- **Módulo Publicaciones:** Gestión de posteos, lógica de limitación (un solo "Me gusta" por usuario), y manejo anidado de comentarios con fechas y estados de edición.
- **Módulo Estadísticas:** Endpoints protegidos que procesan consultas de agregación en MongoDB por rangos de fecha para alimentar los gráficos del Front-End.

## 🛡️ Seguridad y Buenas Prácticas

- **Guardias (Guards):** Restricción estricta a rutas. El dashboard y las acciones de baja lógica requieren que el payload del JWT pertenezca a un perfil `administrador`.
- **Bajas Lógicas e Integridad:** Los usuarios y publicaciones no se eliminan físicamente (evitando romper relaciones), sino que se desactivan mediante estados booleanos para ocultarlos del sistema. Se aplicó baja en cascada en la base de datos.
- **Control de Duplicados:** Validación a nivel base de datos para garantizar correos y nombres de usuario únicos.

## 📦 Instalación y Ejecución

1. Configurar variables de entorno (`.env` con la URI de MongoDB y la clave secreta JWT).
2. Instalar dependencias:
   `npm install`
3. Levantar servidor en modo watch:
   `npm run start:dev`
