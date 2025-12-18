/* public/login.js */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// Importamos la autenticación
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { firebaseConfig } from './config.js';

console.log("Login.js cargado");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Iniciamos el servicio de Auth

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (!loginForm) {
    console.error("ERROR CRÍTICO: No encuentro el formulario con id 'loginForm'");
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue sola
    console.log("Intentando iniciar sesión...");

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Email:", email);

    try {
        // Intentamos iniciar sesión
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Inicio de sesión exitoso");
        
        // Si funciona, nos lleva al Admin
        window.location.href = "admin.html";
        
    } catch (error) {
        // Si falla (contraseña mal), mostramos error
        console.error("Error de inicio de sesión:", error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = "❌ Correo o contraseña incorrectos." + error.code;
    }
});