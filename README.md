# 🌍 GreenPoint - Red Social

GreenPoint es una plataforma social completa y escalable desarrollada como Trabajo Práctico para la materia Programación IV. La aplicación permite a los usuarios interactuar mediante publicaciones, comentarios y reacciones, con un sólido panel de administración y estadísticas en tiempo real.

🚀 **Demo en vivo:** [redsocialangular.vercel.app](https://redsocialangular.vercel.app)

Este repositorio es un monorepo que contiene tanto el cliente web como el servidor API REST.

## 🛠️ Arquitectura del Sistema

| Capa | Tecnología Principal | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Angular | Interfaz de usuario (PWA), consumo de API y manejo de estado. |
| **Backend** | NestJS | Servidor API RESTful, lógica de negocio y autenticación. |
| **Base de Datos** | MongoDB | Almacenamiento NoSQL estructurado (Mongoose). |

## ✨ Características Principales

* **Autenticación Segura:** Sistema de registro y login utilizando JSON Web Tokens (JWT) con vencimiento de 15 minutos y encriptación de contraseñas.
* **Gestión de Publicaciones:** Creación de posteos con imágenes, sistema de "Me gusta" únicos por usuario y caja de comentarios interactiva.
* **Perfiles de Usuario:** Visualización de información personal y feed de las últimas publicaciones realizadas.
* **Panel de Administración:** Dashboard exclusivo para administradores con herramientas de moderación (baja lógica de posteos/usuarios).
* **Estadísticas Dinámicas:** Gráficos interactivos (torta, barras, líneas) con filtros de fecha para analizar el tráfico de la red social.

## 👨‍💻 Autor
* **Thomas Valenzuela**
