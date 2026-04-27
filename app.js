// Inicialización de Auth0
let auth0Client = null;
const initAuth0 = async () => {
  auth0Client = await createAuth0Client({
    domain: "TU_DOMINIO.auth0.com",
    client_id: "TU_CLIENT_ID"
  });
};

initAuth0();

// Carrito
let cart = [];

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", e => {
    const product = e.target.closest(".product");
    const id = product.dataset.id;
    const name = product.dataset.name;
    const price = parseInt(product.dataset.price);

    cart.push({ id, name, price });
    updateCart();
  });
});

function updateCart() {
  document.getElementById("cart-count").textContent = cart.length;
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price}`;
    cartItems.appendChild(li);
    total += item.price;
  });

  document.getElementById("cart-total").textContent = total;
}

// Mostrar/Ocultar carrito
document.getElementById("cart-btn").addEventListener("click", () => {
  const cartSection = document.getElementById("cart");
  cartSection.style.display = cartSection.style.display === "none" ? "block" : "none";
});

// Autenticación
document.getElementById("login-btn").addEventListener("click", async () => {
  await auth0Client.loginWithPopup();
  const user = await auth0Client.getUser();
  document.getElementById("user-info").textContent = `Hola, ${user.name}`;
  document.getElementById("login-btn").style.display = "none";
  document.getElementById("logout-btn").style.display = "inline-block";
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await auth0Client.logout({ returnTo: window.location.origin });
  document.getElementById("user-info").textContent = "";
  document.getElementById("login-btn").style.display = "inline-block";
  document.getElementById("logout-btn").style.display = "none";
});
