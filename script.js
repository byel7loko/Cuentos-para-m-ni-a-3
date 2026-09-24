/* =========================================================
   MI LIBRO DE CUENTOS Y POEMAS
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   DATOS INICIALES
   Por ahora está vacío.
   Aquí pondremos tus cuentos y poemas reales después.
========================================================= */

let historias = [];


/* =========================================================
   VARIABLES DEL LECTOR
========================================================= */

let historiaActual = null;

let paginaActual = 0;

let paginasActuales = [];


/* =========================================================
   INICIO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarHistorias();

    mostrarBiblioteca();

});


/* =========================================================
   GUARDAR / CARGAR HISTORIAS
========================================================= */

function cargarHistorias() {

    const guardadas =
        localStorage.getItem("miLibroHistorias");

    if (guardadas) {

        try {

            historias = JSON.parse(guardadas);

        } catch (error) {

            console.error(
                "Error al cargar las historias:",
                error
            );

            historias = [];

        }

    }

}


function guardarDatos() {

    localStorage.setItem(
        "miLibroHistorias",
        JSON.stringify(historias)
    );

}


/* =========================================================
   CAMBIO DE PANTALLAS
========================================================= */

function mostrarPantalla(id) {

    const pantallas =
        document.querySelectorAll(".pantalla");

    pantallas.forEach((pantalla) => {

        pantalla.classList.remove("activa");

    });


    const pantalla =
        document.getElementById(id);

    if (pantalla) {

        pantalla.classList.add("activa");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   PORTADA
========================================================= */

function abrirBiblioteca() {

    mostrarBiblioteca();

}


function volverPortada() {

    mostrarPantalla("portada");

}


/* =========================================================
   BIBLIOTECA
========================================================= */

function mostrarBiblioteca() {

    mostrarPantalla("biblioteca");

    actualizarEstadisticas();

    renderizarHistorias();

}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas() {

    const cuentos =
        historias.filter(
            historia => historia.tipo === "cuento"
        ).length;


    const poemas =
        historias.filter(
            historia => historia.tipo === "poema"
        ).length;


    const total =
        historias.length;


    const elementoCuentos =
        document.getElementById(
            "cantidadCuentos"
        );

    const elementoPoemas =
        document.getElementById(
            "cantidadPoemas"
        );

    const elementoTotal =
        document.getElementById(
            "cantidadTotal"
        );


    if (elementoCuentos) {

        elementoCuentos.textContent =
            cuentos;

    }


    if (elementoPoemas) {

        elementoPoemas.textContent =
            poemas;

    }


    if (elementoTotal) {

        elementoTotal.textContent =
            total;

    }

}


/* =========================================================
   MOSTRAR HISTORIAS
========================================================= */

function renderizarHistorias(lista = historias) {

    const listaCuentos =
        document.getElementById(
            "listaCuentos"
        );

    const listaPoemas =
        document.getElementById(
            "listaPoemas"
        );


    if (!listaCuentos || !listaPoemas) {
        return;
    }


    const cuentos =
        lista.filter(
            historia => historia.tipo === "cuento"
        );


    const poemas =
        lista.filter(
            historia => historia.tipo === "poema"
        );


    listaCuentos.innerHTML =
        crearTarjetas(
            cuentos,
            "cuento"
        );


    listaPoemas.innerHTML =
        crearTarjetas(
            poemas,
            "poema"
        );

}


/* =========================================================
   CREAR TARJETAS
========================================================= */

function crearTarjetas(lista, tipo) {

    if (lista.length === 0) {

        if (tipo === "cuento") {

            return `
                <div class="tarjeta-vacia">
                    📚
                    <br><br>
                    Todavía no hay cuentos.
                    <br>
                    Aquí aparecerán los tuyos.
                </div>
            `;

        }


        return `
            <div class="tarjeta-vacia">
                🌙
                <br><br>
                Todavía no hay poemas.
                <br>
                Aquí aparecerán los tuyos.
            </div>
        `;

    }


    return lista.map((historia) => {

        const indice =
            historias.findIndex(
                item => item.id === historia.id
            );


        const nombreTipo =
            tipo === "cuento"
                ? "Cuento"
                : "Poema";


        return `
            <article
                class="tarjeta-historia"
                onclick="abrirHistoria(${indice})"
            >

                <div>

                    <div class="tipo-tarjeta">
                        ${nombreTipo}
                    </div>

                    <h4>
                        ${escaparHTML(historia.titulo)}
                    </h4>

                    <p class="descripcion-tarjeta">
                        ${escaparHTML(
                            historia.descripcion ||
                            "Una historia para leer."
                        )}
                    </p>

                </div>

                <div class="autor-tarjeta">
                    ✍️
                    ${escaparHTML(
                        historia.autor ||
                        "Autor desconocido"
                    )}
                </div>

            </article>
        `;

    }).join("");

}


/* =========================================================
   BUSCADOR
========================================================= */

function buscarHistorias() {

    const input =
        document.getElementById("busqueda");


    if (!input) {
        return;
    }


    const texto =
        input.value
            .trim()
            .toLowerCase();


    if (!texto) {

        renderizarHistorias();

        return;

    }


    const resultados =
        historias.filter((historia) => {

            const titulo =
                historia.titulo
                    ? historia.titulo.toLowerCase()
                    : "";


            const autor =
                historia.autor
                    ? historia.autor.toLowerCase()
                    : "";


            const descripcion =
                historia.descripcion
                    ? historia.descripcion.toLowerCase()
                    : "";


            const contenido =
                historia.texto
                    ? historia.texto.toLowerCase()
                    : "";


            return (
                titulo.includes(texto) ||
                autor.includes(texto) ||
                descripcion.includes(texto) ||
                contenido.includes(texto)
            );

        });


    renderizarHistorias(resultados);

}


/* =========================================================
   ABRIR UNA HISTORIA
========================================================= */

function abrirHistoria(indice) {

    if (
        indice < 0 ||
        indice >= historias.length
    ) {

        return;

    }


    historiaActual =
        historias[indice];


    prepararPaginas();


    paginaActual = 0;


    mostrarPantalla("lector");


    actualizarLector();

}


/* =========================================================
   PREPARAR PÁGINAS
========================================================= */

function prepararPaginas() {

    if (!historiaActual) {

        paginasActuales = [""];

        return;

    }


    const texto =
        historiaActual.texto || "";


    const parrafos =
        texto
            .split(/\n\s*\n/)
            .map(
                parrafo => parrafo.trim()
            )
            .filter(Boolean);


    if (parrafos.length === 0) {

        paginasActuales = [""];

        return;

    }


    paginasActuales = [];


    /*
       Intentamos que cada página tenga
       una cantidad cómoda de texto.

       Esto no corta las palabras.
    */

    const limiteCaracteres =
        historiaActual.tipo === "poema"
            ? 650
            : 1000;


    let pagina = "";


    parrafos.forEach((parrafo) => {

        if (
            (pagina + "\n\n" + parrafo).length
            <= limiteCaracteres
        ) {

            if (pagina) {

                pagina += "\n\n";

            }

            pagina += parrafo;

        } else {

            if (pagina) {

                paginasActuales.push(
                    pagina
                );

            }


            /*
               Si un párrafo es demasiado largo,
               también lo dividimos.
            */

            if (
                parrafo.length >
                limiteCaracteres
            ) {

                const partes =
                    dividirTexto(
                        parrafo,
                        limiteCaracteres
                    );


                partes.forEach(
                    (parte, indiceParte) => {

                        if (
                            indiceParte <
                            partes.length - 1
                        ) {

                            paginasActuales.push(
                                parte
                            );

                        } else {

                            pagina = parte;

                        }

                    }
                );

            } else {

                pagina = parrafo;

            }

        }

    });


    if (pagina) {

        paginasActuales.push(
            pagina
        );

    }


    if (paginasActuales.length === 0) {

        paginasActuales = [""];

    }

}


/* =========================================================
   DIVIDIR TEXTO
========================================================= */

function dividirTexto(texto, limite) {

    const palabras =
        texto.split(/\s+/);


    const partes = [];

    let actual = "";


    palabras.forEach((palabra) => {

        const posible =
            actual
                ? actual + " " + palabra
                : palabra;


        if (
            posible.length <= limite
        ) {

            actual = posible;

        } else {

            if (actual) {

                partes.push(actual);

            }

            actual = palabra;

        }

    });


    if (actual) {

        partes.push(actual);

    }


    return partes;

}


/* =========================================================
   ACTUALIZAR LECTOR
========================================================= */

function actualizarLector() {

    if (!historiaActual) {
        return;
    }


    const titulo =
        document.getElementById(
            "lectorTitulo"
        );


    const autor =
        document.getElementById(
            "lectorAutor"
        );


    const contenido =
        document.getElementById(
            "lectorContenido"
        );


    const tipo =
        document.getElementById(
            "lectorTipo"
        );


    const numeroPagina =
        document.getElementById(
            "numeroPagina"
        );


    const contador =
        document.getElementById(
            "contadorPaginas"
        );


    if (titulo) {

        titulo.textContent =
            historiaActual.titulo ||
            "Sin título";

    }


    if (autor) {

        autor.textContent =
            historiaActual.autor
                ? `Por ${historiaActual.autor}`
                : "Autor desconocido";

    }


    if (tipo) {

        tipo.textContent =
            historiaActual.tipo === "poema"
                ? "POEMA"
                : "CUENTO";

    }


    if (contenido) {

        contenido.textContent =
            paginasActuales[paginaActual] || "";

    }


    if (numeroPagina) {

        numeroPagina.textContent =
            paginaActual + 1;

    }


    if (contador) {

        contador.textContent =
            `${paginaActual + 1} / ${paginasActuales.length}`;

    }


    actualizarBotonesLector();

}


/* =========================================================
   BOTONES DEL LECTOR
========================================================= */

function actualizarBotonesLector() {

    const anterior =
        document.getElementById(
            "botonAnterior"
        );


    const siguiente =
        document.getElementById(
            "botonSiguiente"
        );


    if (anterior) {

        anterior.disabled =
            paginaActual <= 0;

    }


    if (siguiente) {

        siguiente.disabled =
            paginaActual >=
            paginasActuales.length - 1;

    }

}


/* =========================================================
   PÁGINA ANTERIOR
========================================================= */

function paginaAnterior() {

    if (paginaActual <= 0) {

        return;

    }


    paginaActual--;

    actualizarLector();

}


/* =========================================================
   PÁGINA SIGUIENTE
========================================================= */

function paginaSiguiente() {

    if (
        paginaActual >=
        paginasActuales.length - 1
    ) {

        return;

    }


    paginaActual++;

    actualizarLector();

}


/* =========================================================
   VOLVER A LA BIBLIOTECA
========================================================= */

function volverBiblioteca() {

    mostrarBiblioteca();

}


/* =========================================================
   FORMULARIO
========================================================= */

function abrirFormulario() {

    limpiarFormulario();

    mostrarPantalla("formulario");

}


function limpiarFormulario() {

    const tipo =
        document.getElementById(
            "tipoHistoria"
        );


    const titulo =
        document.getElementById(
            "tituloHistoria"
        );


    const autor =
        document.getElementById(
            "autorHistoria"
        );


    const descripcion =
        document.getElementById(
            "descripcionHistoria"
        );


    const texto =
        document.getElementById(
            "textoHistoria"
        );


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
   GUARDAR HISTORIA DESDE EL FORMULARIO
========================================================= */

function guardarHistoria() {

    const tipo =
        document.getElementById(
            "tipoHistoria"
        ).value;


    const titulo =
        document.getElementById(
            "tituloHistoria"
        ).value.trim();


    const autor =
        document.getElementById(
            "autorHistoria"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "descripcionHistoria"
        ).value.trim();


    const texto =
        document.getElementById(
            "textoHistoria"
        ).value.trim();


    if (!titulo) {

        mostrarMensaje(
            "Escribe un título."
        );

        return;

    }


    if (!texto) {

        mostrarMensaje(
            "Escribe el contenido."
        );

        return;

    }


    const nuevaHistoria = {

        id:
            Date.now(),

        tipo:
            tipo,

        titulo:
            titulo,

        autor:
            autor || "Autor desconocido",

        descripcion:
            descripcion,

        texto:
            texto,

        fecha:
            new Date().toISOString()

    };


    historias.push(
        nuevaHistoria
    );


    guardarDatos();


    mostrarMensaje(
        "Historia guardada correctamente 📖"
    );


    setTimeout(() => {

        mostrarBiblioteca();

    }, 500);

}


/* =========================================================
   ELIMINAR HISTORIA
========================================================= */

function eliminarHistoria(indice) {

    if (
        indice < 0 ||
        indice >= historias.length
    ) {

        return;

    }


    const historia =
        historias[indice];


    const confirmar =
        confirm(
            `¿Quieres eliminar "${historia.titulo}"?`
        );


    if (!confirmar) {

        return;

    }


    historias.splice(
        indice,
        1
    );


    guardarDatos();


    mostrarBiblioteca();


    mostrarMensaje(
        "Historia eliminada."
    );

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
        historiaActual.texto ||
        "";


    const datos = {

        title:
            titulo,

        text:
            `${titulo}\n\n${texto}`,

        url:
            window.location.href

    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                datos
            );

            return;

        }


        await copiarAlPortapapeles(
            `${titulo}\n\n${texto}`
        );


        mostrarMensaje(
            "Historia copiada para compartir 📋"
        );

    } catch (error) {

        /*
           El usuario puede cancelar
           la ventana de compartir.
        */

        console.log(
            "Compartir cancelado."
        );

    }

}


/* =========================================================
   COPIAR AL PORTAPAPELES
========================================================= */

async function copiarAlPortapapeles(texto) {

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        await navigator.clipboard.writeText(
            texto
        );

        return;

    }


    const area =
        document.createElement(
            "textarea"
        );


    area.value = texto;

    area.style.position =
        "fixed";

    area.style.left =
        "-9999px";


    document.body.appendChild(
        area
    );


    area.select();


    document.execCommand(
        "copy"
    );


    area.remove();

}


/* =========================================================
   MENSAJES
========================================================= */

let temporizadorMensaje = null;


function mostrarMensaje(texto) {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (!mensaje) {

        return;

    }


    mensaje.textContent =
        texto;


    mensaje.classList.add(
        "mostrar"
    );


    clearTimeout(
        temporizadorMensaje
    );


    temporizadorMensaje =
        setTimeout(() => {

            mensaje.classList.remove(
                "mostrar"
            );

        }, 2500);

}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    (evento) => {

        const lector =
            document
                .getElementById("lector")
                ?.classList
                .contains("activa");


        if (!lector) {
            return;
        }


        if (
            evento.key ===
            "ArrowRight"
        ) {

            paginaSiguiente();

        }


        if (
            evento.key ===
            "ArrowLeft"
        ) {

            paginaAnterior();

        }


        if (
            evento.key ===
            "Escape"
        ) {

            volverBiblioteca();

        }

    }
);


/* =========================================================
   DESLIZAR EN EL TELÉFONO
========================================================= */

let posicionInicioX = 0;

let posicionInicioY = 0;


document.addEventListener(
    "touchstart",
    (evento) => {

        if (
            !evento.touches ||
            !evento.touches[0]
        ) {

            return;

        }


        posicionInicioX =
            evento.touches[0].clientX;


        posicionInicioY =
            evento.touches[0].clientY;

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    (evento) => {

        const lector =
            document
                .getElementById("lector")
                ?.classList
                .contains("activa");


        if (!lector) {
            return;
        }


        if (
            !evento.changedTouches ||
            !evento.changedTouches[0]
        ) {

            return;

        }


        const posicionFinalX =
            evento.changedTouches[0].clientX;


        const posicionFinalY =
            evento.changedTouches[0].clientY;


        const diferenciaX =
            posicionFinalX -
            posicionInicioX;


        const diferenciaY =
            posicionFinalY -
            posicionInicioY;


        /*
           Solo consideramos el movimiento
           si es principalmente horizontal.
        */

        if (
            Math.abs(diferenciaX) < 60 ||
            Math.abs(diferenciaX) <
            Math.abs(diferenciaY)
        ) {

            return;

        }


        if (diferenciaX < 0) {

            paginaSiguiente();

        } else {

            paginaAnterior();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }


    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   DATOS DE EJEMPLO
   NO SE UTILIZAN.
   
   Cuando me pases tus cuentos y poemas,
   los podremos colocar aquí si quieres
   que vengan incluidos desde el inicio.
========================================================= */


/*
   Ejemplo de cómo agregaremos posteriormente
   tus historias:

   {
       id: 1,

       tipo: "cuento",

       titulo: "Título del cuento",

       autor: "Nombre del autor",

       descripcion: "Descripción",

       texto: `
       Aquí irá todo el cuento.

       Segundo párrafo.

       Tercer párrafo.
       `,

       fecha: "2026-09-24"
   }
*/


/* =======================================================
   FIN DEL SCRIPT
========================================================= */
