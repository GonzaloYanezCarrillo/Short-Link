# ✂️ LinkShort - URL Shortener & Analytics Platform

![Status](https://img.shields.io/badge/status-live-success) ![License](https://img.shields.io/badge/license-MIT-blue) ![Firebase](https://img.shields.io/badge/backend-firebase-orange)

Una aplicación web **Full Stack Serverless** diseñada para acortar enlaces, gestionar alias personalizados y monitorear el tráfico en tiempo real. Este proyecto implementa una arquitectura segura con autenticación de administradores y generación de códigos QR, utilizando **Firebase** como infraestructura backend.

---

## 🚀 Características Principales

### Para el Usuario Final
* **Acortador de URLs:** Convierte enlaces largos en URLs cortas y manejables.
* **Alias Personalizados:** Permite elegir un nombre específico para el enlace (con validación de disponibilidad en tiempo real).
* **Códigos QR:** Generación automática de códigos QR descargables para compartir enlaces físicamente.
* **Diseño Responsive:** Interfaz moderna y adaptable construida con **Bootstrap 5**.

### Para el Administrador (Backoffice)
* **Panel de Control Seguro:** Dashboard protegido mediante **Autenticación (Login)**.
* **Analytics en Tiempo Real:** Visualización de métricas de visitas por cada enlace.
* **Gestión CRUD:** Capacidad para eliminar enlaces obsoletos o incorrectos directamente desde la base de datos.
* **Seguridad de Rutas:** Protección tanto en Frontend (redirección de intrusos) como en Backend (Reglas de seguridad de Firestore).

---

## 🛠️ Tecnologías Utilizadas

Este proyecto sigue una arquitectura **Serverless** para minimizar costos de infraestructura y maximizar la escalabilidad.

* **Frontend:** HTML5, CSS3 (Bootstrap 5 Framework), JavaScript (ES6 Modules).
* **Backend as a Service (BaaS):** Google Firebase.
* **Base de Datos:** Cloud Firestore (NoSQL).
* **Autenticación:** Firebase Authentication.
* **Hosting:** Firebase Hosting (CDN Global).
* **Librerías Adicionales:** QRCode.js.

---

## 📂 Estructura del Proyecto

El código está organizado bajo el principio de separación de responsabilidades:

```text
/
├── public/
│   ├── index.html        # Landing page (Creación de links + QR)
│   ├── login.html        # Portal de acceso seguro
│   ├── admin.html        # Dashboard de administración (Protegido)
│   ├── styles.css        # Personalizaciones sobre Bootstrap
│   ├── main.js           # Lógica del cliente (Acortar, Validar, QR)
│   ├── admin.js          # Lógica del admin (Auth check, CRUD, Tabla)
│   ├── login.js          # Lógica de autenticación
│   └── config.example.js # Plantilla de configuración (Seguridad)
├── firebase.json         # Configuración de despliegue
├── .gitignore            # Archivos ignorados (Claves API)
└── README.md             # Documentación