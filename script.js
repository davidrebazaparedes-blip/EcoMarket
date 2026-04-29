document.addEventListener('DOMContentLoaded', () => {

    const cartIcon = document.getElementById('cart-icon');
    const sidebar = document.getElementById('carrito-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('overlay');
    const totalElemento = document.getElementById('carrito-total');
    const listaCarrito = document.getElementById('carrito-items');

    actualizarContador();

    function toggleSidebar() {
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');

            if (sidebar.classList.contains('active')) {
                renderizarCarrito();
            }
        }
    }

    if (cartIcon) cartIcon.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); });
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    function renderizarCarrito() {
        const listaCarrito = document.getElementById('carrito-items');
        const totalElemento = document.getElementById('carrito-total');

        if (!listaCarrito) return;

        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        listaCarrito.innerHTML = '';
        let totalAcumulado = 0;

        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío.</p>';
            if (totalElemento) totalElemento.textContent = 'S/ 0.00';
            return;
        }

        carrito.forEach((prod, index) => {
            const precioSeguro = Number(prod.precio) || 0;
            const cantidadSegura = Number(prod.cantidad) || 1;

            const subtotal = precioSeguro * cantidadSegura;
            totalAcumulado += subtotal;

            const item = document.createElement('div');
            item.classList.add('cart-item');
            item.innerHTML = `
                <img src="${prod.imagen}" alt="${prod.titulo}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                <div class="item-info" style="flex-grow:1; margin-left:10px;">
                    <h4 style="margin:0; font-size:0.9rem; color:#003035;">${prod.titulo}</h4>
                    <p style="margin:0; font-size:0.8rem; color:#666;">
                        S/ ${precioSeguro.toFixed(2)} x ${cantidadSegura}
                    </p>
                </div>
                <button class="btn-remove" onclick="eliminarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2rem;">&times;</button>
            `;
            listaCarrito.appendChild(item);
        });

        if (totalElemento) {
            totalElemento.textContent = `S/ ${totalAcumulado.toFixed(2)}`;
        }
    }

    window.eliminarDelCarrito = function(index) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContador();
    };

    const botonesAgregar = document.querySelectorAll('.agregar-carrito');

    botonesAgregar.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const card = e.target.closest('.category-card');
            const precioTexto = card.querySelector('.precio-producto').textContent;
            const precioNumerico = parseFloat(precioTexto.replace(/[^\d.]/g, ''));

            const infoProducto = {
                titulo: card.querySelector('h3').textContent,
                imagen: card.querySelector('img').src,
                precio: precioNumerico,
                cantidad: 1
            };

            const existe = carrito.some(prod => prod.titulo === infoProducto.titulo);

            if (existe) {
                carrito = carrito.map(prod => {
                    if (prod.titulo === infoProducto.titulo) {
                        prod.cantidad++;
                    }
                    return prod;
                });
            } else {
                carrito.push(infoProducto);
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            mostrarFeedback(boton);
            actualizarContador();
        });
    });

    function mostrarFeedback(boton) {
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<i class="fas fa-check"></i> ¡Añadido!';
        boton.style.backgroundColor = '#003035';
        boton.disabled = true;

        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.style.backgroundColor = '';
            boton.disabled = false;
        }, 1200);
    }

    function actualizarContador() {
        const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalProductos = carritoActual.reduce((acc, prod) => acc + prod.cantidad, 0);
        const contadorElemento = document.getElementById('cart-count');
        if (contadorElemento) {
            contadorElemento.textContent = totalProductos;
        }
    }

    const btnComprar = document.querySelector('.hero .btn-main');

    if (btnComprar) {
        btnComprar.addEventListener('click', () => {
            window.location.href = 'productos.html';
        });
    }
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = contactForm.querySelector('input[type="text"]').value;
            const mensaje = contactForm.querySelector('textarea').value;
            const telefono = "936795878";
            const textoWA = `Hola EcoMarket! Me contacto desde la web. %0A*Nombre:* ${nombre}%0A*Mensaje:* ${mensaje}`;
            const urlWA = `https://api.whatsapp.com/send?phone=${telefono}&text=${textoWA}`;

            window.open(urlWA, '_blank');

            const contenedorForm = document.querySelector('.contact-form');
            contenedorForm.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #88b04b;"></i>
                    <h2 style="margin-top: 15px; color: #003035;">¡Mensaje Enviado!</h2>
                    <p>Gracias por escribirnos, te responderemos a la brevedad.</p>
                </div>
            `;
        });
    }
    const btnFinalizar = document.querySelector('.btn-checkout');

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

            if (carrito.length === 0) {
                alert("Tu carrito está vacío. ¡Agrega algunos productos orgánicos primero!");
                return;
            }

            let mensajeWA = "¡Hola EcoMarket! 🛒%0AMe gustaría realizar el siguiente pedido:%0A%0A";
            let totalPedido = 0;

            carrito.forEach(prod => {
                const subtotal = prod.precio * prod.cantidad;
                totalPedido += subtotal;
                mensajeWA += `• *${prod.titulo}* x${prod.cantidad} (S/ ${subtotal.toFixed(2)})%0A`;
            });

            mensajeWA += `%0A*Total a pagar: S/ ${totalPedido.toFixed(2)}*%0A%0A¿Podrían confirmarme la disponibilidad?`;

            const telefono = "936795878";
            const urlWA = `https://api.whatsapp.com/send?phone=${telefono}&text=${mensajeWA}`;
            window.open(urlWA, '_blank');

            localStorage.removeItem('carrito');
            location.reload();
        });
    }

});