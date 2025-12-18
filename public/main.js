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
    const inputAlias = document.getElementById('codigoPersonalizado'); // <--- NUEVO
    const resultadoDiv = document.getElementById('resultado');

    boton.addEventListener('click', async () => {
        let urlOriginal = inputUrl.value;
        let codigoFinal = inputAlias.value.trim(); // .trim() quita espacios vacíos

        // 1. Validación de URL
        if (!urlOriginal.startsWith('http://') && !urlOriginal.startsWith('https://')) {
            urlOriginal = 'https://' + urlOriginal;
        }
        if (urlOriginal.length < 5) return alert("URL muy corta");

        boton.innerText = "Verificando...";
        boton.disabled = true;
        resultadoDiv.innerHTML = ""; // Limpiar mensajes anteriores

        try {
            // 2. Lógica del Alias (El Cerebro Nuevo)
            if (codigoFinal) {
                // A) Si el usuario escribió un alias, verificamos si existe
                // Hacemos una consulta (Query) a la base de datos
                const q = query(collection(db, "links"), where("codigo", "==", codigoFinal));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    // ¡Ups! Ya encontraron documentos con ese código
                    throw new Error("⚠️ Ese nombre ya está en uso. ¡Elige otro!");
                }
                // Si pasamos aquí, el nombre está libre :)
                
            } else {
                // B) Si no escribió nada, generamos uno aleatorio
                codigoFinal = Math.random().toString(36).substring(2, 7);
            }

            // 3. Guardamos en Firebase (Igual que antes, pero con codigoFinal)
            await addDoc(collection(db, "links"), {
                codigo: codigoFinal, // Aquí va el nombre (custom o random)
                destino: urlOriginal,
                clicks: 0,
                creado: new Date()
            });

            // 4. Mostrar Resultado
            const urlFinal = `${window.location.origin}${window.location.pathname}?c=${codigoFinal}`;
            
            resultadoDiv.innerHTML = `
                <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <p style="color: #155724;">✅ ¡Enlace creado!</p>
                    <a href="${urlFinal}" target="_blank" style="font-weight: bold; font-size: 1.2em;">${urlFinal}</a>
                </div>
            `;

        } catch (e) {
            console.error(e);
            // Mostramos el error en rojo (útil para cuando el nombre está repetido)
            resultadoDiv.innerHTML = `<p style="color: red; font-weight: bold;">${e.message}</p>`;
        } finally {
            boton.innerText = "Acortar";
            boton.disabled = false;
        }
    });
}