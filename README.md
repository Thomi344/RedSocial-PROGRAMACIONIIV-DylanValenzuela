# 🌍 GreenPoint - Red Social

[cite_start]GreenPoint es una plataforma social completa y escalable desarrollada como Trabajo Práctico para la materia Programación IV[cite: 1, 4]. [cite_start]La aplicación permite a los usuarios interactuar mediante publicaciones, comentarios y reacciones[cite: 8], con un sólido panel de administración y estadísticas en tiempo real.

Este repositorio es un monorepo que contiene tanto el cliente web como el servidor API REST.

## 🛠️ Arquitectura del Sistema

| Capa | Tecnología Principal | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Angular | [cite_start]Interfaz de usuario (PWA), consumo de API y manejo de estado[cite: 15, 176]. |
| **Backend** | NestJS | [cite_start]Servidor API RESTful, lógica de negocio y autenticación[cite: 16]. |
| **Base de Datos** | MongoDB | [cite_start]Almacenamiento NoSQL estructurado (Mongoose)[cite: 17]. |

## ✨ Características Principales

* [cite_start]**Autenticación Segura:** Sistema de registro y login utilizando JSON Web Tokens (JWT) con vencimiento de 15 minutos y encriptación de contraseñas[cite: 18, 70, 143].
* [cite_start]**Gestión de Publicaciones:** Creación de posteos con imágenes, sistema de "Me gusta" únicos por usuario y caja de comentarios interactiva[cite: 22, 23, 24, 100].
* [cite_start]**Perfiles de Usuario:** Visualización de información personal y feed de las últimas publicaciones realizadas[cite: 9, 89].
* [cite_start]**Panel de Administración:** Dashboard exclusivo para administradores con herramientas de moderación (baja lógica de posteos/usuarios)[cite: 152, 160].
* [cite_start]**Estadísticas Dinámicas:** Gráficos interactivos (torta, barras, líneas) con filtros de fecha para analizar el tráfico de la red social[cite: 174].

## 👨‍💻 Autor
* **Thomas Valenzuela**
