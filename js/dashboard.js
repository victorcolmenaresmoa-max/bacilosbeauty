// RECUERDA: Coloca tu URL real de SheetDB aquí
const SHEETDB_URL = "https://sheetdb.io/api/v1/i878c8xxrkwtd";

const tableBody = document.getElementById('table-body');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');

// Elementos de estadísticas
const statTotal = document.getElementById('total-citas');
const statPendientes = document.getElementById('citas-pendientes');

let allAppointments = []; // Guardamos los datos globalmente para poder filtrarlos

async function loadAppointments() {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando información del servidor... ⏳</td></tr>';
    
    try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        
        if (data.length === 0 || data.error) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay citas agendadas aún.</td></tr>';
            updateStats(0, 0);
            return;
        }

        // Limpiar datos vacíos y ordenar por fecha (más recientes o próximas primero)
        allAppointments = data.filter(cita => cita.nombre_clienta);
        allAppointments.sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));

        renderTable(allAppointments);
        
        // Calcular estadísticas
        const pendientes = allAppointments.filter(cita => cita.estado.toLowerCase() === 'pendiente').length;
        updateStats(allAppointments.length, pendientes);

    } catch (error) {
        console.error('Error cargando los datos:', error);
        tableBody.innerHTML = '<tr><td colspan="7" style="color:#ff4444; text-align:center;">Error de conexión. Revisa el enlace de SheetDB.</td></tr>';
    }
}

function renderTable(data) {
    tableBody.innerHTML = ''; 
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No se encontraron resultados para tu búsqueda.</td></tr>';
        return;
    }

    data.forEach(cita => {
        const row = document.createElement('tr');
        
        // Formatear fecha para que se vea más bonita (Ej: 15/08/2026)
        const dateObj = new Date(cita.fecha_cita);
        const fechaFormateada = dateObj.toLocaleDateString('es-ES', { timeZone: 'UTC' });

        // Limpiar el teléfono para el enlace de WhatsApp (quitar espacios y signos)
        const phoneLink = cita.telefono ? cita.telefono.replace(/\D/g,'') : '';

        row.innerHTML = `
            <td>
                <strong>${fechaFormateada}</strong><br>
                <span style="color:var(--text-muted); font-size:0.85rem;">${cita.hora}</span>
            </td>
            <td style="font-weight:600; color:var(--text-main);">${cita.nombre_clienta}</td>
            <td>${cita.telefono}</td>
            <td style="color:var(--primary-color); font-weight:500;">${cita.servicio}</td>
            <td style="font-size:0.85rem; max-width:200px;">${cita.detalles_diseno || '-'}</td>
            <td>
                <span class="status-badge status-pending">${cita.estado || 'Pendiente'}</span>
            </td>
            <td>
                <a href="https://wa.me/${phoneLink}?text=Hola%20${cita.nombre_clienta},%20te%20escribimos%20de%20Bacilos%20Beauty%20para%20confirmar%20tu%20cita." 
                   target="_blank" class="action-btn">
                   💬 Contactar
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateStats(total, pendientes) {
    // Animación suave de los números
    statTotal.innerText = total;
    statPendientes.innerText = pendientes;
}

// Lógica de búsqueda en tiempo real
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = allAppointments.filter(cita => {
        return cita.nombre_clienta.toLowerCase().includes(searchTerm) || 
               cita.telefono.includes(searchTerm) ||
               cita.servicio.toLowerCase().includes(searchTerm);
    });
    renderTable(filteredData);
});

// Cargar al inicio y asignar botón
document.addEventListener('DOMContentLoaded', loadAppointments);
refreshBtn.addEventListener('click', () => {
    searchInput.value = ''; // Limpiar buscador al recargar
    loadAppointments();
});
