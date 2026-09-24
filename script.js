/* =========================================================
   CONFIGURACIÓN DE SUPABASE
========================================================= */

const SUPABASE_URL = "https://aiqllqehzmlmimqcqffn.supabase.co";

/*
   PEGA AQUÍ TU CLAVE PÚBLICA

   Ejemplo:
   const SUPABASE_KEY = "sb_publishable_...";
*/

const SUPABASE_KEY = sb_publishable_BUs9meQK3P0kAMM2R5yeNQ_QnGvup9X


/* =========================================================
   CONEXIÓN CON SUPABASE
========================================================= */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let historias = [];
let historiasFiltradas = [];

let historiaActual = null;

let paginasActuales = [];
let paginaActual = 0;


/* =========================================================
   INICIAR APLICACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Aplicación iniciada.");

});


/* =========================================================
   CAMBIAR DE PANTALLA
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


/* =========================================================
   PORTADA
========================================================= */

function abrirBiblioteca() {

    mostrarPantalla("biblioteca");

    cargarHistorias();

}


/* =========================================================
   VOLVER A LA PORTADA
========================================================= */

function volverPortada() {

    mostrarPantalla("portada");

}


/* =========================================================
   VOLVER A LA BIBLIOTECA
========================================================= */

function volverBiblioteca() {

    mostrarPantalla("biblioteca");

    cargarHistorias();

}


/* =========================================================
   CARGAR HISTORIAS DESDE SUPABASE
========================================================= */

async function cargarHistorias() {

    mostrarMensaje("Cargando historias...", "info");

    try {

        const { data, error } = await supabaseClient
            .from("historias")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {

            console.error("Error cargando historias:", error);

            mostrarMensaje(
                "No se pudieron cargar las historias.",
                "error"
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
            "Ocurrió un error al conectar con Supabase.",
            "error"
        );

    }

}


/* =========================================================
   MOSTRAR HISTORIAS
========================================================= */

function renderizarHistorias() {

    const listaCuentos = document.getElementById("listaCuentos");
    const listaPoemas = document.getElementById("listaPoemas");

    if (!listaCuentos || !listaPoemas) {
        return;
    }

    listaCuentos.innerHTML = "";
    listaPoemas.innerHTML = "";

    const cuentos = historiasFiltradas.filter(
        historia => historia.tipo === "cuento"
    );

    const poemas = historiasFiltradas.filter(
        historia => historia.tipo === "poema"
    );


    /* =========================================
       CUENTOS
    ========================================= */

    if (cuentos.length === 0) {

        listaCuentos.innerHTML = `
            <div class="sin-historias">
                <p>📚</p>
                <span>No hay cuentos todavía.</span>
            </div>
        `;

    } else {

        cuentos.forEach(historia => {

            listaCuentos.appendChild(
                crearTarjetaHistoria(historia)
            );

        });

    }


    /* =========================================
       POEMAS
    ========================================= */

    if (poemas.length === 0) {

        listaPoemas.innerHTML = `
            <div class="sin-historias">
                <p>🌙</p>
                <span>No hay poemas todavía.</span>
            </div>
        `;

    } else {

        poemas.forEach(historia => {

            listaPoemas.appendChild(
                crearTarjetaHistoria(historia)
            );

        });

    }

}


/* =========================================================
   CREAR TARJETA DE HISTORIA
========================================================= */

function crearTarjetaHistoria(historia) {

    const tarjeta = document.createElement("article");

    tarjeta.className = "tarjeta-historia";

    const tipoTexto =
        historia.tipo === "poema"
            ? "🌙 Poema"
            : "📚 Cuento";

    const titulo =
        historia.titulo || "Sin título";

    const autor =
        historia.autor || "Autor desconocido";

    const descripcion =
        historia.descripcion || "Sin descripción.";


    tarjeta.innerHTML = `

        <div class="tarjeta-contenido">

            <div class="tarjeta-tipo">
                ${tipoTexto}
            </div>

            <h4>
                ${escaparHTML(titulo)}
            </h4>

            <p class="tarjeta-autor">
                ${escaparHTML(autor)}
            </p>

            <p class="tarjeta-descripcion">
                ${escaparHTML(descripcion)}
            </p>

        </div>

        <button
            class="boton-leer"
            type="button"
        >
            Leer →
        </button>

    `;


    tarjeta.addEventListener("click", () => {

        abrirHistoria(historia);

    });


    return tarjeta;

}


/* =========================================================
   ABRIR UNA HISTORIA
========================================================= */

function abrirHistoria(historia) {

    historiaActual = historia;

    const lectorTipo =
        document.getElementById("lectorTipo");

    const lectorTitulo =
        document.getElementById("lectorTitulo");

    const lectorAutor =
        document.getElementById("lectorAutor");


    if (lectorTipo) {

        lectorTipo.textContent =
            historia.tipo === "poema"
                ? "POEMA"
                : "CUENTO";

    }


    if (lectorTitulo) {

        lectorTitulo.textContent =
            historia.titulo || "Sin título";

    }


    if (lectorAutor) {

        lectorAutor.textContent =
            historia.autor
                ? `Por ${historia.autor}`
                : "Autor desconocido";

    }


    prepararPaginas(historia.texto || "");

    mostrarPantalla("lector");

}


/* =========================================================
   PREPARAR PÁGINAS
========================================================= */

function prepararPaginas(texto) {

    /*
       Separamos las páginas usando líneas vacías.

       Ejemplo:

       Página 1

       Página 2

       Página 3
    */

    paginasActuales = texto
        .split(/\n\s*\n/)
        .map(pagina => pagina.trim())
        .filter(pagina => pagina.length > 0);


    if (paginasActuales.length === 0) {

        paginasActuales = [""];

    }


    paginaActual = 0;

    mostrarPagina();

}


/* =========================================================
   MOSTRAR PÁGINA
========================================================= */

function mostrarPagina() {

    const contenido =
        document.getElementById("lectorContenido");

    const numeroPagina =
        document.getElementById("numeroPagina");

    const contadorPaginas =
        document.getElementById("contadorPaginas");

    const botonAnterior =
        document.getElementById("botonAnterior");

    const botonSiguiente =
        document.getElementById("botonSiguiente");


    if (!contenido) {
        return;
    }


    const texto =
        paginasActuales[paginaActual] || "";


    contenido.innerHTML =
        convertirTextoHTML(texto);


    if (numeroPagina) {

        numeroPagina.textContent =
            paginaActual + 1;

    }


    if (contadorPaginas) {

        contadorPaginas.textContent =
            `${paginaActual + 1} / ${paginasActuales.length}`;

    }


    if (botonAnterior) {

        botonAnterior.disabled =
            paginaActual === 0;

    }


    if (botonSiguiente) {

        botonSiguiente.disabled =
            paginaActual === paginasActuales.length - 1;

    }

}


/* =========================================================
   PÁGINA ANTERIOR
========================================================= */

function paginaAnterior() {

    if (paginaActual > 0) {

        paginaActual--;

        mostrarPagina();

    }

}


/* =========================================================
   PÁGINA SIGUIENTE
========================================================= */

function paginaSiguiente() {

    if (
        paginaActual <
        paginasActuales.length - 1
    ) {

        paginaActual++;

        mostrarPagina();

    }

}


/* =========================================================
   ABRIR FORMULARIO
========================================================= */

function abrirFormulario() {

    limpiarFormulario();

    mostrarPantalla("formulario");

}


/* =========================================================
   LIMPIAR FORMULARIO
========================================================= */

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
   GUARDAR HISTORIA
========================================================= */

async function guardarHistoria() {

    alert("La función guardarHistoria sí está funcionando.");

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


    /* =========================================
       VALIDAR TÍTULO
    ========================================= */

    if (!titulo) {

        mostrarMensaje(
            "Escribe un título.",
            "error"
        );

        return;

    }


    /* =========================================
       VALIDAR CONTENIDO
    ========================================= */

    if (!texto) {

        mostrarMensaje(
            "Escribe el contenido de la historia.",
            "error"
        );

        return;

    }


    mostrarMensaje(
        "Guardando historia...",
        "info"
    );


    try {

        /* =========================================
           COMPROBAR USUARIO
        ========================================= */

        const {
            data: {
                user
            }
        } = await supabaseClient.auth.getUser();


        /*
           La tabla está configurada para que
           cada historia tenga el ID de su propietario.
        */

        if (!user) {

            mostrarMensaje(
                "Necesitas iniciar sesión para guardar historias.",
                "error"
            );

            console.warn(
                "No hay usuario autenticado."
            );

            return;

        }


        /* =========================================
           INSERTAR EN SUPABASE
        ========================================= */

        const { data, error } =
            await supabaseClient
                .from("historias")
                .insert([
                    {
                        tipo: tipo,
                        titulo: titulo,
                        autor: autor,
                        descripcion: descripcion,
                        texto: texto,
                        owner_id: user.id
                    }
                ])
                .select();


        /* =========================================
           COMPROBAR ERROR
        ========================================= */

        if (error) {

            console.error(
                "Error guardando historia:",
                error
            );

            mostrarMensaje(
                "No se pudo guardar la historia.",
                "error"
            );

            return;

        }


        console.log(
            "Historia guardada correctamente:",
            data
        );


        /* =========================================
           ÉXITO
        ========================================= */

        mostrarMensaje(
            "¡Historia guardada correctamente! 📖",
            "success"
        );


        limpiarFormulario();


        setTimeout(() => {

            ocultarMensaje();

            mostrarPantalla("biblioteca");

            cargarHistorias();

        }, 1000);


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        mostrarMensaje(
            "Ocurrió un error al guardar la historia.",
            "error"
        );

    }

}


/* =========================================================
   BUSCAR HISTORIAS
========================================================= */

function buscarHistorias() {

    const input =
        document.getElementById("busqueda");

    if (!input) {
        return;
    }


    const busqueda =
        input.value
            .trim()
            .toLowerCase();


    if (!busqueda) {

        historiasFiltradas =
            [...historias];

    } else {

        historiasFiltradas =
            historias.filter(historia => {

                const titulo =
                    (historia.titulo || "")
                        .toLowerCase();

                const autor =
                    (historia.autor || "")
                        .toLowerCase();

                const descripcion =
                    (historia.descripcion || "")
                        .toLowerCase();

                const texto =
                    (historia.texto || "")
                        .toLowerCase();


                return (
                    titulo.includes(busqueda) ||
                    autor.includes(busqueda) ||
                    descripcion.includes(busqueda) ||
                    texto.includes(busqueda)
                );

            });

    }


    renderizarHistorias();

}


/* =========================================================
   ACTUALIZAR ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas() {

    const cantidadCuentos =
        document.getElementById("cantidadCuentos");

    const cantidadPoemas =
        document.getElementById("cantidadPoemas");

    const cantidadTotal =
        document.getElementById("cantidadTotal");


    const cuentos =
        historias.filter(
            historia =>
                historia.tipo === "cuento"
        ).length;


    const poemas =
        historias.filter(
            historia =>
                historia.tipo === "poema"
        ).length;


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
            historias.length;

    }

}


/* =========================================================
   COMPARTIR HISTORIA
========================================================= */

async function compartirHistoria() {

    if (!historiaActual) {
        return;
    }


    const titulo =
        historiaActual.titulo ||
        "Mi historia";


    const texto =
        historiaActual.descripcion ||
        "Una historia de mi biblioteca.";


    try {

        if (navigator.share) {

            await navigator.share({

                title: titulo,

                text: texto

            });

        } else {

            await navigator.clipboard.writeText(
                `${titulo}\n\n${texto}`
            );

            mostrarMensaje(
                "Texto copiado para compartir.",
                "success"
            );

        }

    } catch (error) {

        console.log(
            "Compartir cancelado.",
            error
        );

    }

}


/* =========================================================
   MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
    texto,
    tipo = "info"
) {

    const mensaje =
        document.getElementById("mensaje");

    if (!mensaje) {
        return;
    }


    mensaje.textContent =
        texto;


    mensaje.className =
        `mensaje ${tipo}`;


    mensaje.classList.add(
        "visible"
    );

}


/* =========================================================
   OCULTAR MENSAJE
========================================================= */

function ocultarMensaje() {

    const mensaje =
        document.getElementById("mensaje");

    if (!mensaje) {
        return;
    }


    mensaje.classList.remove(
        "visible"
    );

}


/* =========================================================
   CONVERTIR TEXTO A HTML
========================================================= */

function convertirTextoHTML(texto) {

    return escaparHTML(texto)
        .replace(/\n/g, "<br>");

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;"); 

}
