/* public/admin.js */

// 1. IMPORTACIONES: Traemos las herramientas de la caja de herramientas de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
// 2. CONFIGURACIÓN: Las llaves de tu casa
import { firebaseConfig } from "./config.js";   

// Iniciamos la conexión
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Iniciamos el servicio de Auth

// 3. REFERENCIAS: Le ponemos "apodos" a los elementos del HTML para usarlos aquí
const tabla = document.getElementById('tabla-cuerpo');
const loading = document.getElementById('loading');


// ------------------------------------------------------
// 🛡️ EL GUARDIA DE SEGURIDAD (PROTECCIÓN DE RUTA)
// ------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ✅ SI HAY USUARIO:
        console.log("Usuario autenticado:", user.email);
        // Recién ahora cargamos los datos confidenciales
        cargarDatos(); 
        agregarBotonLogout(); // (Opcional) Agregamos botón de salir
    } else {
        // ❌ NO HAY USUARIO:
        console.warn("Intruso detectado. Redirigiendo...");
        window.location.href = "login.html";
    }
});

// ------------------------------------------------------
// FUNCIÓN A: CARGAR DATOS (READ)
// ------------------------------------------------------
async function cargarDatos() {
    tabla.innerHTML = ""; // Limpiamos la mesa antes de poner los platos nuevos
    try {
        // Pedido a la base de datos: "Dame los links ordenados por clicks"
        const q = query(collection(db, "links"), orderBy("clicks", "desc"));
        
        // Esperamos (await) a que llegue la información
        const querySnapshot = await getDocs(q);
        
        loading.style.display = 'none'; // Ocultamos el cartel de "Cargando..."

        // Por cada documento que llegó...
        querySnapshot.forEach((documento) => {
            const data = documento.data(); // Sacamos los datos (url, clicks, etc)
            const id = documento.id;       // Sacamos el ID único (ej: 8f7s8d7f)

            // Construimos la fila de la tabla (HTML)
            // Nota el botón: tiene un atributo secreto 'data-id' con el ID del link
            const fila = `
                <tr id="fila-${id}">
                    <td><a href="index.html?c=${data.codigo}" target="_blank"><b>${data.codigo}</b></a></td>
                    <td>${data.destino.substring(0, 30)}...</td>
                    <td class="clicks-col">${data.clicks}</td>
                    <td style="text-align: center;">
                        <button class="btn-borrar" data-id="${id}">Eliminar</button>
                    </td>
                </tr>
            `;
            // Inyectamos la fila en el HTML
            tabla.innerHTML += fila;
        });

        if (querySnapshot.empty) {
            loading.innerText = "No hay links creados.";
            loading.style.display = 'block';
        }

    } catch (error) {
        console.error("Error:", error);
        loading.innerText = "Error cargando datos.";
    }
}

// ------------------------------------------------------
// FUNCIÓN EXTRA: BOTÓN DE CERRAR SESIÓN
// ------------------------------------------------------
function agregarBotonLogout() {
    // Buscamos el título o header y le pegamos un botón de salir
    const header = document.querySelector('h1'); // Busca el <h1>Panel de Control</h1>
    
    // Creamos botón dinámicamente si no existe
    if (!document.getElementById('btn-logout')) {
        const btnLogout = document.createElement('button');
        btnLogout.id = 'btn-logout';
        btnLogout.innerText = "Cerrar Sesión 🔒";
        btnLogout.style.marginLeft = "20px";
        btnLogout.style.fontSize = "0.6em";
        btnLogout.style.backgroundColor = "#666";
        btnLogout.style.padding = "5px 10px";
        
        // Lógica de Salir
        btnLogout.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = "login.html";
        });

        header.appendChild(btnLogout);
    }
}

// ------------------------------------------------------
// FUNCIÓN B: ELIMINAR (DELETE)
// ------------------------------------------------------
// Usamos un truco: Escuchamos clics en TODA la tabla
tabla.addEventListener('click', async (e) => {
    
    // Preguntamos: ¿Lo que clickeaste tiene la clase 'btn-borrar'?
    if (e.target.classList.contains('btn-borrar')) {
        
        // Si sí, recuperamos el ID secreto que guardamos en el atributo 'data-id'
        const idParaBorrar = e.target.getAttribute('data-id');
        
        if (confirm("¿Seguro que quieres borrarlo?")) {
            try {
                // 1. Borrar de la Nube (Firebase)
                await deleteDoc(doc(db, "links", idParaBorrar));
                
                // 2. Borrar de la Pantalla (DOM)
                const filaVisual = document.getElementById(`fila-${idParaBorrar}`);
                filaVisual.remove();
                
                alert("Eliminado.");
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }
});

// Arrancamos el motor
cargarDatos();