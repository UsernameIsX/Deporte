document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", () => {
    alert("Aquí iría la lógica de inicio de sesión.");
    // Ejemplo: redirigir a otra página
    // window.location.href = "login.html";
    });
});

// Aquí pegamos las llaves que nos dio Auth0 en el Dashboard
const auth0Config = {
    domain: "dev-0amwgx56x45lz7qg.us.auth0.com",
    clientId: "XSVf6w9gS6UuJmBiuXulDiMz7GS6RiDL", 
    authorizationParams: {
        // Redirigimos al usuario a nuestro Live Server tras iniciar sesión
        redirect_uri: window.location.origin 
    }
};

// Variable global para almacenar el cliente de Auth0
let auth0Client = null;

// Esta función arranca apenas carga la página
window.onload = async () => {
    // Inicializamos el SDK de Auth0 que importamos en el HTML
    auth0Client = await auth0.createAuth0Client(auth0Config);

    // Revisamos si el usuario acaba de volver de la página de inicio de sesión de Auth0
    // Auth0 envía un código ("code" y "state") en la URL
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        // Procesamos el inicio de sesión y limpiamos la URL
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }

    // Actualizamos la interfaz gráfica (botones y mensajes)
    updateUI();
};

// ==========================================
// 3. LÓGICA DE INTERFAZ GRÁFICA (UI)
// ==========================================
async function updateUI() {
    // Le preguntamos a Auth0: "¿Este usuario está conectado?"
    const isAuthenticated = await auth0Client.isAuthenticated();

    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
    const appContent = document.getElementById("app-content");
    const mensajeBienvenida = document.getElementById("mensaje-bienvenida");

    if (isAuthenticated) {
        
        btnLogin.style.display = "none";
        btnLogout.style.display = "inline-block";
        appContent.style.display = "block"; 

        const user = await auth0Client.getUser();
        mensajeBienvenida.innerText = `Bienvenido(a) ${user.name}`;
    } else {
        
        btnLogin.style.display = "inline-block";
        btnLogout.style.display = "none";
        appContent.style.display = "none";
        mensajeBienvenida.innerText = "";
    }
}

// ==========================================
// 4. EVENTOS DE LOS BOTONES
// ==========================================
// Botón Iniciar Sesión
document.getElementById("btn-login").addEventListener("click", async () => {
    // Redirige a la página segura de Auth0
    await auth0Client.loginWithRedirect();
});

// Botón Cerrar Sesión
document.getElementById("btn-logout").addEventListener("click", () => {
    // Cierra la sesión en Auth0 y devuelve al usuario a nuestra página
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
});

// ==========================================
// 5. BASE DE DATOS LOCAL (El Catálogo)
// ==========================================
const productos = [ // Cambiado a plural para evitar errores
    { id: 1, categoria: "Ropa", nombre: "polera", descripcion: "Equipo Ulpo", precio: 18000, icono: "👕" },
    { id: 2, categoria: "Calzado", nombre: "Zapatillas", descripcion: "Marca AIDO", precio: 35000, icono: "👟" },
    { id: 3, categoria: "Gorros", nombre: "Jockey", descripcion: "Marca Stone", precio: 9000, icono: "🧢" },
];

// ==========================================
// 6. ESTADO DE LA ORDEN
// ==========================================
let ordenproductos = JSON.parse(sessionStorage.getItem("orden_productos")) || [];

// ==========================================
// 7. RENDERIZADO (Pintar en pantalla)
// ==========================================
function renderizarCatalogo() {
    const contenedor = document.getElementById("lista-productos");
    if (!contenedor) return;
    contenedor.innerHTML = ""; 

    productos.forEach(prod => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "productos-card";
        tarjeta.innerHTML = `
            <div style="font-size: 3rem;">${prod.icono}</div>
            <h3>${prod.nombre}</h3>
            <span class="categoria">${prod.categoria}</span>
            <p>${prod.descripcion}</p>
            <p class="precio">Copago: $${prod.precio.toLocaleString('es-CL')}</p>
            <button onclick="agregarAOrden(${prod.id})">Agregar a la lista</button>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function renderizarOrden() {
    const listaOrden = document.getElementById("items-carrito"); // ID único para el carrito
    const spanTotal = document.getElementById("total-copago");
    const btnAgendar = document.getElementById("btn-agendar");
    
    if (!listaOrden) return;
    listaOrden.innerHTML = "";
    let total = 0;

    if (ordenproductos.length === 0) {
        listaOrden.innerHTML = "<li>No hay productos seleccionados.</li>";
        if (btnAgendar) btnAgendar.disabled = true;
    } else {
        ordenproductos.forEach((item, index) => {
            total += item.precio;
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.nombre} - $${item.precio.toLocaleString('es-CL')}
                <button onclick="eliminarDeOrden(${index})" style="background: red; color: white; border: none; cursor: pointer; margin-left: 10px;">X</button>
            `;
            listaOrden.appendChild(li);
        });
        if (btnAgendar) btnAgendar.disabled = false;
    }

    if (spanTotal) spanTotal.innerText = total.toLocaleString('es-CL');
}

// ==========================================
// 8. FUNCIONALIDAD DEL "CARRITO"
// ==========================================
window.agregarAOrden = (idBuscado) => {
    // Corregido: usamos la constante global 'productos' y evitamos el sombreado de variables
    const productoEncontrado = productos.find(p => p.id === idBuscado);
    
    if (productoEncontrado) {
        ordenproductos.push(productoEncontrado);
        sessionStorage.setItem("orden_productos", JSON.stringify(ordenproductos));
        renderizarOrden();
    }
};

window.eliminarDeOrden = (index) => {
    ordenproductos.splice(index, 1);
    sessionStorage.setItem("orden_productos", JSON.stringify(ordenproductos));
    renderizarOrden();
};

// ==========================================
// 9. LÓGICA DE NAVEGACIÓN Y FORMULARIO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    renderizarCatalogo();
    renderizarOrden();

    const btnAgendar = document.getElementById("btn-agendar");
    const checkoutSection = document.getElementById("checkout-section");
    const formCheckout = document.getElementById("form-checkout");

    if (btnAgendar) {
        btnAgendar.addEventListener("click", () => {
            document.getElementById("encabezado-catalogo").style.display = "none";
            document.getElementById("lista-productos").style.display = "none";
            document.getElementById("orden-productos").style.display = "none";
            checkoutSection.style.display = "block";
        });
    }

    document.getElementById("btn-cancelar")?.addEventListener("click", () => {
        document.getElementById("encabezado-catalogo").style.display = "block";
        document.getElementById("lista-productos").style.display = "grid";
        document.getElementById("orden-productos").style.display = "block";
        checkoutSection.style.display = "none";
    });

    formCheckout?.addEventListener("submit", (evento) => {
        evento.preventDefault();
        
        const correo = document.getElementById("input-correo").value;
        const telefono = document.getElementById("input-telefono").value;
        let esValido = true;

        if (!correo.includes("@") || !correo.includes(".")) {
            document.getElementById("error-correo").style.display = "block";
            esValido = false;
        } else {
            document.getElementById("error-correo").style.display = "none";
        }

        const regexNumeros = /^\d+$/; 
        if (!regexNumeros.test(telefono) || telefono.length < 8) {
            document.getElementById("error-telefono").style.display = "block";
            esValido = false;
        } else {
            document.getElementById("error-telefono").style.display = "none";
        }

        if (esValido) finalizarAgendamiento();
    });
});

function finalizarAgendamiento() {
    document.getElementById("checkout-section").style.display = "none";
    const resumenDiv = document.getElementById("resumen-final");
    
    let htmlResumen = `<ul>`;
    let total = 0;
    ordenproductos.forEach(item => {
        htmlResumen += `<li>${item.nombre} - $${item.precio.toLocaleString('es-CL')}</li>`;
        total += item.precio;
    });
    htmlResumen += `</ul><hr><strong>Total Pagado: $${total.toLocaleString('es-CL')}</strong>`;
    resumenDiv.innerHTML = htmlResumen;

    document.getElementById("mensaje-exito").style.display = "block";

    // SEGURIDAD: Limpiar datos
    sessionStorage.removeItem("orden_productos");
    ordenproductos = [];
}