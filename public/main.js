/* main.js */

// ---------------------------------------------------------
// 1. IMPORTACIONES
// Traemos las herramientas desde la nube de Google
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, increment, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// ---------------------------------------------------------
// 2. CONFIGURACIÓN (TUS LLAVES)
// Esto conecta el código con TU base de datos específica
// ---------------------------------------------------------
import { firebaseConfig } from "./config.js";

// Iniciamos la conexión
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------------------------------------------------
// 3. EL ENRUTADOR (ROUTER)
// Decide si estamos "Creando" un link o "Visitando" uno
// ---------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const codigoBuscado = params.get("c"); // Busca si hay algo como ?c=xyz

// OPCIÓN A: MODO REDIRECCIÓN (Si alguien entra con un código)
if (codigoBuscado) {
    document.body.innerHTML = "<h2>🔄 Buscando destino...</h2>";

    // Función auto-ejecutable para buscar y redirigir
    (async function iniciarRedireccion() {
        try {
            // Buscamos en la colección 'links' el documento donde 'codigo' == codigoBuscado
            const q = query(collection(db, "links"), where("codigo", "==", codigoBuscado));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Si encontramos el link...
                const docEncontrado = querySnapshot.docs[0];
                const data = docEncontrado.data();
                
                // 1. Sumamos 1 visita en la base de datos
                await updateDoc(doc(db, "links", docEncontrado.id), {
                    clicks: increment(1)
                });

                // 2. Redirigimos al usuario a la web original
                window.location.href = data.destino;
            } else {
                document.body.innerHTML = "<h1>❌ Enlace no encontrado</h1><a href='/'>Crear uno nuevo</a>";
            }
        } catch (error) {
            console.error("Error:", error);
            document.body.innerHTML = "Error de conexión";
        }
    })();
} 

// OPCIÓN B: MODO CREADOR (Si entras a la página principal)
// ... (El código de arriba del MODO REDIRECCIÓN se queda igual) ...

// OPCIÓN B: MODO CREADOR
else {
    const boton = document.getElementById('btnAcortar');
    const inputUrl = document.getElementById('urlLarga');
    const inputAlias = document.getElementById('aliasInput');
    const resultadoDiv = document.getElementById('resultado');

    // Verificamos que los elementos existan antes de agregar eventos
    if (boton && inputUrl && resultadoDiv) {
        
        boton.addEventListener('click', async () => {
            let urlOriginal = inputUrl.value;
            let codigoFinal = inputAlias ? inputAlias.value.trim() : ""; // Validación por si no existe el input

            // 1. Validación de URL
            if (!urlOriginal) return alert("Escribe una URL");
            
            if (!urlOriginal.startsWith('http://') && !urlOriginal.startsWith('https://')) {
                urlOriginal = 'https://' + urlOriginal;
            }

            // Cambiamos el estado del botón (Feedback visual)
            const textoOriginal = boton.innerHTML;
            boton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Acortando...';
            boton.disabled = true;
            resultadoDiv.innerHTML = ""; // Limpiar anterior

            try {
                // 2. Lógica del Alias
                if (codigoFinal) {
                    const q = query(collection(db, "links"), where("codigo", "==", codigoFinal));
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        throw new Error("⚠️ Ese alias ya está ocupado.");
                    }
                } else {
                    codigoFinal = Math.random().toString(36).substring(2, 7);
                }

                // 3. Guardar en Firebase
                await addDoc(collection(db, "links"), {
                    codigo: codigoFinal,
                    destino: urlOriginal,
                    clicks: 0,
                    creado: new Date()
                });

                // 4. Mostrar Resultado con QR
                const urlFinal = `${window.location.origin}${window.location.pathname}?c=${codigoFinal}`;
                
                resultadoDiv.innerHTML = `
                    <div class="alert alert-success mt-3 text-center shadow-sm" role="alert">
                        <h4 class="alert-heading"> ¡Listo!</h4>
                        
                        <a href="${urlFinal}" target="_blank" class="fs-5 fw-bold text-decoration-none text-success text-break">
                            ${urlFinal}
                        </a>
                        
                        <hr>
                        <p class="mb-2">Escanea para compartir:</p>
                        
                        <div id="qrcode" class="d-flex justify-content-center my-3"></div>
                    </div>
                `;

                // 5. Generar el QR (La Magia ✨)
                // Le decimos: "Dibuja en el div 'qrcode' la dirección 'urlFinal'"
                new QRCode(document.getElementById("qrcode"), {
                    text: urlFinal,
                    width: 128,  // Ancho
                    height: 128, // Alto
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });

            } catch (e) {
                console.error(e);
                // Mostrar Error (Estilo Bootstrap Rojo)
                resultadoDiv.innerHTML = `
                    <div class="alert alert-danger mt-3 text-center" role="alert">
                        <i class="bi bi-exclamation-triangle-fill"></i> ${e.message}
                    </div>
                `;
            } finally {
                // Restaurar botón
                boton.innerHTML = textoOriginal;
                boton.disabled = false;
            }
        });
    }
}