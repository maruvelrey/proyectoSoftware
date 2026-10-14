const API_URL = '/api/productos';
let currentProducts = [];
let selectedProductId = null;
let pendingAction = null;
let currentFormMode = 'ADD';
let uploadedBase64Image = '';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=Sin+Imagen';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function handleLogin(e) {
    e.preventDefault();

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (user === 'MVelasquez' && pass === '123456') {
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('loginView').classList.remove('active');
        document.getElementById('mainHeader').style.display = 'flex';
        switchView('productosNav');
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    document.getElementById('mainHeader').style.display = 'none';
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('loginView').classList.add('active');
    document.getElementById('loginError').style.display = 'none';
}

function switchView(target) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));

    if (target === 'productosNav') {
        document.getElementById('productosView').classList.add('active');
        document.getElementById('nav-prod').classList.add('active');
        showProductsList();
        fetchProducts();
    } else if (target === 'referenciaNav') {
        document.getElementById('referenciaView').classList.add('active');
        document.getElementById('nav-ref').classList.add('active');
    }
}

async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        currentProducts = await res.json();
        renderProductsList();
    } catch (err) {
        console.error('Error al conectar con la API:', err);
    }
}

function renderProductsList() {
    const list = document.getElementById('productsList');
    list.innerHTML = '';
    if (currentProducts.length === 0) {
        list.innerHTML = '<p>No hay productos registrados en la tienda.</p>';
        return;
    }
    currentProducts.forEach(prod => {
        const imgSrc = (prod.imagenUrl && prod.imagenUrl.trim().length > 5) ? prod.imagenUrl : DEFAULT_IMAGE;
        list.innerHTML += `
      <div class="history-item">
        <div class="history-item-info">
          <img src="${imgSrc}" alt="${prod.nombre}" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
          <div>
            <h4>${prod.nombre.toUpperCase()}</h4>
            <p style="color:#666; font-size:14px;">Precio: $${prod.precio}</p>
          </div>
        </div>
        <button class="btn-action btn-view" style="padding:8px 18px; font-size:14px;" onclick="viewProductDetail(${prod.id})">
          <i class="fa-solid fa-cart-shopping"></i> VER
        </button>
      </div>
    `;
    });
}

function viewProductDetail(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;

    selectedProductId = product.id;
    document.getElementById('displayName').innerText = product.nombre.toUpperCase();
    document.getElementById('displayPrice').innerText = `$${product.precio}`;

    const imgSrc = (product.imagenUrl && product.imagenUrl.trim().length > 5) ? product.imagenUrl : DEFAULT_IMAGE;
    const displayImg = document.getElementById('displayImg');
    displayImg.src = imgSrc;

    document.getElementById('prodNombre').value = product.nombre;
    document.getElementById('prodPrecio').value = product.precio;

    document.getElementById('productsListView').style.display = 'none';
    document.getElementById('productDetailView').style.display = 'flex';
}

function showProductsList() {
    document.getElementById('productDetailView').style.display = 'none';
    document.getElementById('productsListView').style.display = 'block';
}

// CAPTURA DIRECTA Y OPTIMIZADA DE CUALQUIER IMAGEN
function previewSelectedImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 250; // Calidad óptima y tamaño controlado
                const scaleFactor = MAX_WIDTH / img.width;

                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleFactor;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Asignación directa a la variable global
                uploadedBase64Image = canvas.toDataURL('image/jpeg', 0.7);
                document.getElementById('prodImagenUrl').value = '';

                const imgPreview = document.getElementById('imgPreview');
                imgPreview.src = uploadedBase64Image;
                imgPreview.style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    }
}

function previewUrlImage(url) {
    if (url && url.trim() !== '') {
        uploadedBase64Image = url.trim();
        document.getElementById('prodImagen').value = '';
        const imgPreview = document.getElementById('imgPreview');
        imgPreview.src = uploadedBase64Image;
        imgPreview.style.display = 'block';
    }
}

function openFormModal(mode) {
    currentFormMode = mode;
    document.getElementById('formTitle').innerText = mode === 'ADD' ? 'Agregar Producto' : 'Modificar Producto';

    const imgPreview = document.getElementById('imgPreview');
    document.getElementById('prodImagen').value = '';
    document.getElementById('prodImagenUrl').value = '';

    if (mode === 'ADD') {
        document.getElementById('prodNombre').value = '';
        document.getElementById('prodPrecio').value = '';
        uploadedBase64Image = '';
        imgPreview.style.display = 'none';
    } else {
        const currentProd = currentProducts.find(p => p.id === selectedProductId);
        if (currentProd && currentProd.imagenUrl) {
            uploadedBase64Image = currentProd.imagenUrl;
            imgPreview.src = uploadedBase64Image;
            imgPreview.style.display = 'block';
            if (!uploadedBase64Image.startsWith('data:image')) {
                document.getElementById('prodImagenUrl').value = uploadedBase64Image;
            }
        } else {
            uploadedBase64Image = '';
            imgPreview.style.display = 'none';
        }
    }

    document.getElementById('formModal').style.display = 'flex';
}

function openConfirmModal(action) {
    pendingAction = action;
    if (action === 'DELETE') {
        document.getElementById('confirmQuestion').innerText = '¿Estas seguro que quieres eliminar este producto?';
    } else if (action === 'MODIFY') {
        document.getElementById('confirmQuestion').innerText = '¿Estas seguro de guardar las modificaciones realizadas?';
    }
    document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function submitProductForm() {
    if (currentFormMode === 'ADD') {
        await createProduct();
    } else {
        openConfirmModal('MODIFY');
    }
    closeModal('formModal');
}

async function createProduct() {
    const nombre = document.getElementById('prodNombre').value;
    const precio = parseFloat(document.getElementById('prodPrecio').value);
    const imagenUrl = uploadedBase64Image || DEFAULT_IMAGE;

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, imagenUrl })
    });

    const newProduct = await res.json();

    showSuccessAlert('Se ha agregado el producto con éxito');

    switchView('productosNav');
    await fetchProducts();
    if (newProduct && newProduct.id) {
        viewProductDetail(newProduct.id);
    }
}

async function executePendingAction() {
    closeModal('confirmModal');

    if (pendingAction === 'DELETE' && selectedProductId) {
        await fetch(`${API_URL}/${selectedProductId}`, { method: 'DELETE' });
        showSuccessAlert('Se ha eliminado con éxito');
        showProductsList();
        fetchProducts();
    } else if (pendingAction === 'MODIFY' && selectedProductId) {
        const nombre = document.getElementById('prodNombre').value;
        const precio = parseFloat(document.getElementById('prodPrecio').value);

        // Garantiza que use la imagen subida en el formulario o la que ya tenía
        const currentProd = currentProducts.find(p => p.id === selectedProductId);
        const imagenUrl = uploadedBase64Image || (currentProd ? currentProd.imagenUrl : DEFAULT_IMAGE);

        await fetch(`${API_URL}/${selectedProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, imagenUrl })
        });

        showSuccessAlert('Se ha modificado con éxito');
        await fetchProducts();
        viewProductDetail(selectedProductId);
    }
}

function showSuccessAlert(msg) {
    const alert = document.getElementById('successAlert');
    alert.innerText = msg;
    alert.style.display = 'block';
    setTimeout(() => { alert.style.display = 'none'; }, 3000);
}