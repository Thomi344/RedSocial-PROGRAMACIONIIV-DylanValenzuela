# 💻 GreenPoint - Frontend (Angular)

Aplicación cliente web para la red social GreenPoint. Desarrollada con Angular, esta plataforma está construida bajo los estándares de una **Progressive Web App (PWA)**, permitiendo su instalación y uso con resiliencia de red.

🚀 **Demo en vivo:** [redsocialangular.vercel.app](https://redsocialangular.vercel.app)

## 🚀 Tecnologías Clave

- **Angular:** Framework principal.
- **Service Workers:** Configuración de caché para funcionamiento offline parcial.
- **Chart.js:** Renderizado de gráficos dinámicos para el dashboard administrativo.
- **Tailwind CSS:** Estilado rápido y responsivo.

## ⚙️ Funcionalidades Destacadas (UI/UX)

- **Directivas Personalizadas (DOM Manipulation):** Implementación de atributos propios como el efecto de resaltado al interactuar con publicaciones, auto-enfoque en edición y copiado de enlaces.
- **Pipes Propias (Data Transformation):** Formateo dinámico de datos sin mutar el estado. Incluye cálculo de tiempo relativo ("hace X horas"), truncamiento de textos largos y un censurador de palabras prohibidas.
- **Seguridad por Interceptores:** Manejo automático de tokens JWT en cada petición HTTP, con redirección al login ante respuestas `401 Unauthorized`.
- **Moderación en Cascada:** Interfaz de eliminación de contenido (baja lógica) que oculta publicaciones e hilos de comentarios instantáneamente para administradores.
- **Paginación:** Carga progresiva de publicaciones y comentarios para optimizar el rendimiento del navegador.

## 📦 Instalación y Ejecución

1. Instalar dependencias:
   `npm install` (usar `--legacy-peer-deps` si hay conflictos de versión con PWA).
2. Levantar servidor de desarrollo:
   `ng serve`
3. Abrir en el navegador: `http://localhost:4200`
