// Simpan data pendaftaran ke localStorage
document.getElementById('form-register')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nama = this.nama_lengkap.value;
    const email = this.email.value;
    const password = this.password.value;
    const no_telp = this.no_telp.value;

    const user = { nama, email, password, no_telp };
    localStorage.setItem('user', JSON.stringify(user));
    alert('Pendaftaran berhasil! Silakan login.');
    window.location.href = 'login.html';
});

// Fungsi login
function loginUser(event) {
    event.preventDefault();
    
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Clear any previous errors
    document.getElementById('login-error')?.remove();

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        showError('Belum ada akun. Silakan daftar terlebih dahulu.');
        return false;
    }

    if (email === user.email && password === user.password) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'home.html';
        return true;
    } else {
        showError('Email atau password salah.');
        return false;
    }
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.id = 'login-error';
    errorElement.style.color = 'red';
    errorElement.textContent = message;
    
    const form = document.getElementById('form-login');
    form.appendChild(errorElement);
}

// Tangani form "Hubungi Kami"
document.getElementById('form-contact')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const nama = this.nama.value;
    const email = this.email.value;
    const pesan = this.pesan.value;

    // Simpan ke localStorage jika perlu (optional)
    const kontakUser = { nama, email, pesan };
    localStorage.setItem('lastMessage', JSON.stringify(kontakUser));

    // Tampilkan popup
    const popup = document.getElementById('popup-pesan');
    popup.style.display = 'block';

    // Hilangkan popup setelah 3 detik
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);

    // Kosongkan form
    this.reset();
});

// Fungsi untuk Logout
function logout() {
    const konfirmasi = confirm('Apakah Anda yakin ingin keluar?');
    if (konfirmasi) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// Fungsi untuk menambah produk ke keranjang
function addToCart(button) {
    // Pastikan pengguna sudah login
    if (!localStorage.getItem('isLoggedIn')) {
        alert('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.');
        window.location.href = 'login.html';
        return;
    }

    // Ambil data produk dari elemen product-card
    const productCard = button.closest('.product-card');
    const product = {
        id: productCard.dataset.id,
        name: productCard.dataset.name,
        price: parseInt(productCard.dataset.price),
        image: productCard.dataset.image,
        quantity: 1
    };

    // Ambil data keranjang dari localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Cek apakah produk sudah ada di keranjang
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex !== -1) {
        // Jika sudah ada, tambahkan kuantitas
        cart[existingProductIndex].quantity += 1;
    } else {
        // Jika belum ada, tambahkan produk baru
        cart.push(product);
    }

    // Simpan kembali ke localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Perbarui jumlah item di badge keranjang
    updateCartBadge();

    alert(`${product.name} telah ditambahkan ke keranjang!`);
}

// Fungsi untuk memperbarui badge keranjang
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Fungsi untuk menampilkan item di halaman keranjang
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const itemCount = document.getElementById('item-count');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const checkoutButton = document.getElementById('checkout-btn');

    // Ambil data keranjang dari localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Kosongkan kontainer sebelum menambahkan item baru
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                Keranjang belanja Anda kosong.
                <a href="produk.html" class="continue-shopping">Lanjutkan Belanja</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }

    // Tampilkan item di keranjang
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <input type="checkbox" class="item-checkbox" data-index="${index}" checked>
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-price">Rp ${item.price.toLocaleString()}</p>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">Hapus</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Tambahkan event listener untuk checkbox
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCartSummary);
    });

    // Perbarui ringkasan keranjang
    updateCartSummary();

    // Perbarui jumlah item
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    itemCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;

    // Tampilkan ringkasan
    cartSummary.style.display = 'block';
}

// Fungsi untuk memperbarui kuantitas item
function updateQuantity(index, value) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (typeof value === 'string') {
        value = parseInt(value);
        if (isNaN(value) || value < 1) value = 1;
    } else {
        value = cart[index].quantity + value;
        if (value < 1) value = 1;
    }

    cart[index].quantity = value;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartBadge();
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartBadge();
}

// Fungsi untuk memperbarui ringkasan keranjang
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const checkoutButton = document.getElementById('checkout-btn');

    // Ambil semua checkbox yang dicentang
    const checkboxes = document.querySelectorAll('.item-checkbox');
    
    // Hitung subtotal hanya untuk item yang dicentang
    let subtotal = 0;
    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            const item = cart[index];
            subtotal += item.price * item.quantity;
        }
    });

    // Asumsi ongkos kirim tetap (misalnya Rp 20.000) jika ada item yang dicentang
    const checkedItemsCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const shipping = checkedItemsCount > 0 ? 20000 : 0;

    // Hitung total
    const total = subtotal + shipping;

    // Perbarui elemen HTML
    subtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
    shippingElement.textContent = `Rp ${shipping.toLocaleString()}`;
    totalElement.textContent = `Rp ${total.toLocaleString()}`;

    // Aktifkan/nonaktifkan tombol checkout
    checkoutButton.disabled = checkedItemsCount === 0;
}

// Fungsi untuk menangani checkout
document.getElementById('checkout-btn')?.addEventListener('click', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        return;
    }

    // Ambil item yang dicentang
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const selectedItems = Array.from(checkboxes).map(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        return cart[index];
    });

    if (selectedItems.length === 0) {
        alert('Pilih setidaknya satu item untuk melanjutkan ke pembayaran.');
        return;
    }

    // Simpan item yang dipilih ke localStorage untuk halaman transaksi
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));

    // Arahkan ke halaman transaksi
    window.location.href = 'transaksi.html';
});

// Jalankan fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
});