/* ==========================================================
   HOLDINGCARS - Validaciones.js
   Lógica central: Datos de la flota y validaciones del acta
   ========================================================== */

// 1. Arreglo de Regiones y Comunas (Requisito del PDF)
// Se usa en Registro.html y en USUARIOS/Usuario.html
const regiones = [
    { nombre: "Región Metropolitana", comunas: ["Santiago", "Providencia", "Las Condes", "Maipú"] },
    { nombre: "Región de Valparaíso", comunas: ["Valparaíso", "Viña del Mar", "Quilpué"] },
    { nombre: "Región del Biobío", comunas: ["Concepción", "Talcahuano", "Chillán"] }
];

// 2. Arreglo de Vehículos (La "Flota" de HoldingCars)
// Estos son los datos que luego vendrán desde tu backend en el endpoint /api/vehiculos
const vehiculos = [
    { 
        id: 1, 
        nombre: "Toyota Yaris", 
        patente: "BB·KK·12", 
        kilometraje: 45200, 
        categoria: "Compacto", 
        disponible: true, 
        imagen: "https://via.placeholder.com/300x150" 
    },
    { 
        id: 2, 
        nombre: "Suzuki Swift", 
        patente: "GG·TT·34", 
        kilometraje: 12000, 
        categoria: "Compacto", 
        disponible: true, 
        imagen: "https://via.placeholder.com/300x150" 
    },
    { 
        id: 3, 
        nombre: "Chevrolet Sail", 
        patente: "AB·CD·56", 
        kilometraje: 88000, 
        categoria: "Sedán", 
        disponible: false, // Ejemplo: Este auto ya está en manos de otro chofer
        imagen: "https://via.placeholder.com/300x150" 
    }
];

// 3. Validación de RUT Chileno (Requisito OBLIGATORIO del PDF)
function validarRut(rut) {
    if (!rut) return false;
    // Limpiar puntos y guiones
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    if (rut.length < 7 || rut.length > 9) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    
    let suma = 0;
    let multiplo = 2;
    
    // Algoritmo del módulo 11 (Estándar chileno)
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        if (multiplo === 7) multiplo = 2;
        else multiplo++;
    }
    
    const dvEsperado = 11 - (suma % 11);
    let dvCalculado;
    if (dvEsperado === 11) dvCalculado = "0";
    else if (dvEsperado === 10) dvCalculado = "K";
    else dvCalculado = dvEsperado.toString();

    return dv === dvCalculado;
}

// 4. Lógica para cargar comunas dinámicamente (Select dependiente Región -> Comuna)
function cargarComunas(regionId, comunaId) {
    const selectRegion = document.getElementById(regionId);
    const selectComuna = document.getElementById(comunaId);
    
    // Limpiar comunas
    selectComuna.innerHTML = '<option value="">-- Seleccione --</option>';
    
    // Buscar la región seleccionada en el arreglo
    const region = regiones.find(r => r.nombre === selectRegion.value);
    
    if (region) {
        region.comunas.forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            selectComuna.appendChild(option);
        });
    }
}

// 5. Lógica para pintar la flota en el Inicio.html y Producto.html
// (Se eliminó la lógica de "carrito" porque no es una tienda)
function mostrarVehiculos() {
    const contenedor = document.getElementById('lista-vehiculos');
    if (!contenedor) return; // Evitar errores si no estamos en la página correcta

    vehiculos.forEach(v => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Si el vehículo NO está disponible, mostramos un botón deshabilitado
        const botonEstado = v.disponible 
            ? <a href="Detalle_Producto.html?id=${v.id}" class="btn-acta">Generar Acta</a>
            : <button disabled style="background: #ccc; cursor: not-allowed;">En Retiro</button>;

        // Datos clave del acta física: Patente y Kilometraje
        card.innerHTML = `
            <img src="${v.imagen}" alt="${v.nombre}">
            <h3>${v.nombre}</h3>
            <p><strong>Patente:</strong> ${v.patente}</p>
            <p><strong>Kilometraje:</strong> ${v.kilometraje.toLocaleString('es-CL')} km</p>
            <p><strong>Estado:</strong> ${v.disponible ? 'Disponible' : 'No disponible'}</p>
            ${botonEstado}
        `;
        contenedor.appendChild(card);
    });
}

// 6. Lógica para obtener un vehículo por ID (Para el Detalle_Producto.html / Acta)
// Esta función es clave para que el formulario del acta sepa qué auto está seleccionando el usuario.
function obtenerVehiculoPorId(id) {
    return vehiculos.find(v => v.id === parseInt(id));
}

// 7. Función para guardar datos en LocalStorage (Según lo pide el PDF, pero adaptado)
// En lugar de un carrito de compras, guardaremos las "Actas en Proceso".
function guardarActaLocalStorage(acta) {
    let actas = JSON.parse(localStorage.getItem('actasHoldingCars')) || [];
    actas.push(acta);
    localStorage.setItem('actasHoldingCars', JSON.stringify(actas));
    alert("Acta guardada localmente. Pendiente de envío al servidor.");
}

// Inicializar cuando carga el documento (Para que pinte la flota en el Index y Productos)
document.addEventListener('DOMContentLoaded', () => {
    mostrarVehiculos();
});