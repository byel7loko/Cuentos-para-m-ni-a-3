/* =========================================================
   MI LIBRO DE HISTORIAS
   CONEXIÓN CON SUPABASE
========================================================= */


/* =========================================================
   1. CONFIGURACIÓN DE SUPABASE
========================================================= */

const SUPABASE_URL = "https://aiqllqehzmlmimqcqffn.supabase.co";

/*
   ========================================================
   PEGA AQUÍ TU CLAVE PÚBLICA DE SUPABASE
   ========================================================

   Ejemplo:

   const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIs...";

   IMPORTANTE:
   Usa la Publishable key / anon.
   NO uses service_role ni Secret key.
*/
const SUPABASE_KEY =sb_publishable_BUs9meQK3P0kAMM2R5yeNQ_QnGvup9X


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   2. VARIABLES
========================================================= */

let historias = [];

let historiasFiltradas = [];

let historiaActual = null;

let paginaActual = 1;

let paginasActuales = [];


/* =========================================================
   3. INICIAR APLICACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Aplicación iniciada");

    await cargarHistorias();

});


/* =========================================================
   4. NAVEGACIÓN
========================================================= */

function mostrarPantalla(id) {

    const pantallas = document.querySelectorAll(".pantalla");

    pantallas.forEach(pantalla => {
        pantalla.classList.remove("activa");
    });

    const pantalla = document.getElementById(id);

    if (pantalla) {
        pantalla.classList.add("activa");
    }

}


function abrirBiblioteca() {

    mostrarPantalla("biblioteca");

    cargarHistorias();

}


function volverPortada() {

    mostrarPantalla("portada");

}


function volverBiblioteca() {

    mostrarPantalla("biblioteca");

    limpiarFormulario();

}


/* =========================================================
   5. CARGAR HISTORIAS DESDE SUPABASE
========================================================= */

async function cargarHistorias() {

    try {

        mostrarMensaje("Cargando historias...");

        const { data, error } = await supabaseClient
            .from("historias")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error("Error al cargar historias:", error);

            mostrarMensaje(
                "No se pudieron cargar las historias."
            );

            return;
        }


        historias = data || [];

        historiasFiltradas = [...historias];

        renderizarHistorias();

        actualizarEstadisticas();

        ocultarMensaje();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Ocurrió un error al conectar con Supabase."
        );

    }

}


/* =========================================================
   6. RENDERIZAR HISTORIAS
========================================================= */

function renderizarHistorias() {

    const listaCuentos =
        document.getElementById("listaCuentos");

    const listaPoemas =
        document.getElementById("listaPoemas");


    if (!listaCuentos || !listaPoemas) {
        return;
    }


    listaCuentos.innerHTML = "";

    listaPoemas.innerHTML = "";


    const cuentos = historiasFiltradas.filter(
        historia =>
            String(historia.tipo).toLowerCase() === "cuento"
    );


    const poemas = historiasFiltradas.filter(
        historia =>
            String(historia.tipo).toLowerCase() === "poema"
    );


    if (cuentos.length === 0) {

        listaCuentos.innerHTML = `
            <div class="sin-historias">
                <p>📖 No hay cuentos todavía.</p>
            </div>
        `;

    } else {

        cuentos.forEach(cuento => {

            listaCuentos.appendChild(
                crearTarjetaHistoria(cuento)
            );

        });

    }


    if (poemas.length === 0) {

        listaPoemas.innerHTML = `
            <div class="sin-historias">
                <p>🌙 No hay poemas todavía.</p>
            </div>
        `;

    } else {

        poemas.forEach(poema => {

            listaPoemas.appendChild(
                crearTarjetaHistoria(poema)
            );

        });

    }

}


/* =========================================================
   7. CREAR TARJETA
========================================================= */

function crearTarjetaHistoria(historia) {

    const tarjeta = document.createElement("article");

    tarjeta.className = "tarjeta-historia";


    const titulo =
        escaparHTML(historia.titulo || "Sin título");

    const autor =
        escaparHTML(historia.autor || "Autor desconocido");

    const descripcion =
        escaparHTML(
            historia.descripcion ||
            "Sin descripción."
        );


    tarjeta.innerHTML = `

        <div class="tarjeta-contenido">

            <div class="tarjeta-icono">
                ${
                    String(historia.tipo).toLowerCase() === "poema"
                        ? "🌙"
                        : "📚"
                }
            </div>

            <div class="tarjeta-texto">

                <h4>
                    ${titulo}
                </h4>

                <p class="tarjeta-autor">
                    ${autor}
                </p>

                <p class="tarjeta-descripcion">
                    ${descripcion}
                </p>

            </div>

        </div>

        <button
            class="boton-leer"
            type="button"
        >
            Leer
        </button>

    `;


    tarjeta
        .querySelector(".boton-leer")
        .addEventListener("click", () => {

            abrirHistoria(historia);

        });


    tarjeta
        .addEventListener("click", evento => {

            if (
                evento.target.closest(".boton-leer")
            ) {
                return;
            }

            abrirHistoria(historia);

        });


    return tarjeta;

}


/* =========================================================
   8. ABRIR HISTORIA
========================================================= */

function abrirHistoria(historia) {

    historiaActual = historia;

    paginaActual = 1;


    const tipo =
        document.getElementById("lectorTipo");

    const titulo =
        document.getElementById("lectorTitulo");

    const autor =
        document.getElementById("lectorAutor");


    if (tipo) {

        tipo.textContent =
            String(historia.tipo).toLowerCase() === "poema"
                ? "POEMA"
                : "CUENTO";

    }


    if (titulo) {

        titulo.textContent =
            historia.titulo || "Sin título";

    }


    if (autor) {

        autor.textContent =
            historia.autor || "Autor desconocido";

    }


    prepararPaginas(historia.texto || "");

    mostrarPagina();

    mostrarPantalla("lector");

}


/* =========================================================
   9. PREPARAR PÁGINAS
========================================================= */

function prepararPaginas(texto) {

    if (!texto.trim()) {

        paginasActuales = [
            "Esta historia todavía no tiene contenido."
        ];

        return;

    }


    /*
       Cada salto de línea doble se considera
       una nueva página.
    */

    paginasActuales = texto
        .split(/\n\s*\n/)
        .map(pagina => pagina.trim())
        .filter(pagina => pagina.length > 0);


    if (paginasActuales.length === 0) {

        paginasActuales = [texto];

    }

}


/* =========================================================
   10. MOSTRAR PÁGINA
========================================================= */

function mostrarPagina() {

    const contenido =
        document.getElementById("lectorContenido");

    const numero =
        document.getElementById("numeroPagina");

    const contador =
        document.getElementById("contadorPaginas");

    const botonAnterior =
        document.getElementById("botonAnterior");

    const botonSiguiente =
        document.getElementById("botonSiguiente");


    if (!paginasActuales.length) {
        return;
    }


    const indice = paginaActual - 1;

    const pagina =
        paginasActuales[indice] || "";


    if (contenido) {

        contenido.innerHTML =
            convertirTextoHTML(pagina);

    }


    if (numero) {

        numero.textContent =
            paginaActual;

    }


    if (contador) {

        contador.textContent =
            `${paginaActual} / ${paginasActuales.length}`;

    }


    if (botonAnterior) {

        botonAnterior.disabled =
            paginaActual <= 1;

    }


    if (botonSiguiente) {

        botonSiguiente.disabled =
            paginaActual >= paginasActuales.length;

    }

}


/* =========================================================
   11. PÁGINA ANTERIOR
========================================================= */

function paginaAnterior() {

    if (paginaActual <= 1) {
        return;
    }


    paginaActual--;

    mostrarPagina();

}


/* =========================================================
   12. PÁGINA SIGUIENTE
========================================================= */

function paginaSiguiente() {

    if (
        paginaActual >=
        paginasActuales.length
    ) {
        return;
    }


    paginaActual++;

    mostrarPagina();

}


/* =========================================================
   13. FORMULARIO
========================================================= */

function abrirFormulario() {

    limpiarFormulario();

    mostrarPantalla("formulario");

}


function limpiarFormulario() {

    const tipo =
        document.getElementById("tipoHistoria");

    const titulo =
        document.getElementById("tituloHistoria");

    const autor =
        document.getElementById("autorHistoria");

    const descripcion =
        document.getElementById("descripcionHistoria");

    const texto =
        document.getElementById("textoHistoria");


    if (tipo) {
        tipo.value = "cuento";
    }

    if (titulo) {
        titulo.value = "";
    }

    if (autor) {
        autor.value = "";
    }

    if (descripcion) {
        descripcion.value = "";
    }

    if (texto) {
        texto.value = "";
    }

}


/* =========================================================
   14. GUARDAR HISTORIA
========================================================= */

async function guardarHistoria() {

    const tipo =
        document.getElementById("tipoHistoria").value;

    const titulo =
        document.getElementById("tituloHistoria").value.trim();

    const autor =
        document.getElementById("autorHistoria").value.trim();

    const descripcion =
        document.getElementById("descripcionHistoria").value.trim();

    const texto =
        document.getElementById("textoHistoria").value.trim();


    /* VALIDACIONES */

    if (!titulo) {

        mostrarMensaje(
            "Escribe un título."
        );

        return;

    }


    if (!texto) {

        mostrarMensaje(
            "Escribe el contenido de la historia."
        );

        return;

    }


    try {

        mostrarMensaje("Guardando historia...");


        const { data, error } =
            await supabaseClient
                .from("historias")
                .insert([
                    {
                        tipo: tipo,
                        titulo: titulo,
                        autor: autor,
                        descripcion: descripcion,
                        texto: texto
                    }
                ])
                .select();


        if (error) {

            console.error(
                "Error al guardar:",
                error
            );


            if (
                error.message &&
                error.message.toLowerCase().includes("row-level security")
            ) {

                mostrarMensaje(
                    "Supabase bloqueó el guardado por las políticas RLS."
                );

            } else {

                mostrarMensaje(
                    "No se pudo guardar la historia."
                );

            }

            return;

        }


        console.log(
            "Historia guardada:",
            data
        );


        mostrarMensaje(
            "¡Historia guardada correctamente! 📖"
        );


        await cargarHistorias();


        setTimeout(() => {

            mostrarPantalla("biblioteca");

            ocultarMensaje();

        }, 1000);


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Ocurrió un error al guardar."
        );

    }

}


/* =========================================================
   15. BUSCAR HISTORIAS
========================================================= */

function buscarHistorias() {

    const input =
        document.getElementById("busqueda");


    if (!input) {
        return;
    }


    const termino =
        input.value
            .trim()
            .toLowerCase();


    if (!termino) {

        historiasFiltradas =
            [...historias];

    } else {

        historiasFiltradas =
            historias.filter(historia => {

                const titulo =
                    String(
                        historia.titulo || ""
                    ).toLowerCase();

                const autor =
                    String(
                        historia.autor || ""
                    ).toLowerCase();

                const descripcion =
                    String(
                        historia.descripcion || ""
                    ).toLowerCase();

                const texto =
                    String(
                        historia.texto || ""
                    ).toLowerCase();


                return (
                    titulo.includes(termino) ||
                    autor.includes(termino) ||
                    descripcion.includes(termino) ||
                    texto.includes(termino)
                );

            });

    }


    renderizarHistorias();

}


/* =========================================================
   16. ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas() {

    const cuentos =
        historias.filter(
            historia =>
                String(historia.tipo).toLowerCase() === "cuento"
        ).length;


    const poemas =
        historias.filter(
            historia =>
                String(historia.tipo).toLowerCase() === "poema"
        ).length;


    const total =
        historias.length;


    const cantidadCuentos =
        document.getElementById("cantidadCuentos");

    const cantidadPoemas =
        document.getElementById("cantidadPoemas");

    const cantidadTotal =
        document.getElementById("cantidadTotal");


    if (cantidadCuentos) {

        cantidadCuentos.textContent =
            cuentos;

    }


    if (cantidadPoemas) {

        cantidadPoemas.textContent =
            poemas;

    }


    if (cantidadTotal) {

        cantidadTotal.textContent =
            total;

    }

}


/* =========================================================
   17. COMPARTIR HISTORIA
========================================================= */

async function compartirHistoria() {

    if (!historiaActual) {
        return;
    }


    const texto =
        `${historiaActual.titulo || "Historia"}

${historiaActual.autor || ""}

${historiaActual.texto || ""}`;


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    historiaActual.titulo ||
                    "Mi historia",

                text:
                    texto

            });

        } else {

            await navigator.clipboard.writeText(
                texto
            );


            mostrarMensaje(
                "Historia copiada al portapapeles."
            );

        }

    } catch (error) {

        console.log(
            "Compartir cancelado:",
            error
        );

    }

}


/* =========================================================
   18. MENSAJES
========================================================= */

function mostrarMensaje(texto) {

    const mensaje =
        document.getElementById("mensaje");


    if (!mensaje) {
        return;
    }


    mensaje.textContent = texto;

    mensaje.classList.add("mostrar");


    clearTimeout(
        window.__mensajeTimeout
    );


    window.__mensajeTimeout =
        setTimeout(() => {

            ocultarMensaje();

        }, 4000);

}


function ocultarMensaje() {

    const mensaje =
        document.getElementById("mensaje");


    if (!mensaje) {
        return;
    }


    mensaje.classList.remove("mostrar");

}


/* =========================================================
   19. CONVERTIR TEXTO
========================================================= */

function convertirTextoHTML(texto) {

    return escaparHTML(texto)
        .replace(/\n/g, "<br>");

}


/* =========================================================
   20. SEGURIDAD
========================================================= */

function escaparHTML(texto) {

    const div =
        document.createElement("div");


    div.textContent =
        texto == null
            ? ""
            : String(texto);


    return div.innerHTML;

}


/* =========================================================
   FIN
========================================================= */
