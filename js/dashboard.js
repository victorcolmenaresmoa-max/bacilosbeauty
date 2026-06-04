// RECUERDA: Coloca tu URL real de SheetDB aquí
const SHEETDB_URL = "https://sheetdb.io/api/v1/i878c8xxrkwtd";

const tableBody = document.getElementById('table-body');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');

// Elementos de estadísticas
const statTotal = document.getElementById('total-citas');
const statPendientes = document.getElementById('citas-pendientes');
const statHoy = document.getElementById('citas-hoy'); // Nueva estadística

let allAppointments = [];

async function loadAppointments() {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando información del servidor... ⏳</td></tr>';
    
    try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        
        if (data.length === 0 || data.error) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay citas agendadas aún.</td></tr>';
            updateStats(0, 0, 0);
            return;
        }

        allAppointments = data.filter(cita => cita.nombre_clienta);
        allAppointments.sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));

        renderTable(allAppointments);
        
        // Calcular estadísticas
        const pendientes = allAppointments.filter(cita => cita.estado.toLowerCase() === 'pendiente').length;
        
        // Calcular cuántas citas son para la fecha de hoy
        const fechaHoy = new Date().toLocaleDateString('es-ES', { timeZone: 'UTC' });
        const citasHoy = allAppointments.filter(cita => {
            const fechaCita = new Date(cita.fecha_cita).toLocaleDateString('es-ES', { timeZone: 'UTC' });
            return fechaCita === fechaHoy;
        }).length;

        updateStats(allAppointments.length, pendientes, citasHoy);

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
        
        const dateObj = new Date(cita.fecha_cita);
        const fechaFormateada = dateObj.toLocaleDateString('es-ES', { timeZone: 'UTC' });
        const phoneLink = cita.telefono ? cita.telefono.replace(/\D/g,'') : '';

        // Lógica visual del estado (Amarillo o Verde)
        let isContactado = cita.estado.toLowerCase() === 'contactado';
        let badgeClass = isContactado ? 'status-contacted' : 'status-pending';
        let textoEstado = isContactado ? 'Contactado' : 'Pendiente';

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
                <span id="badge-${cita.id}" class="status-badge ${badgeClass}">${textoEstado}</span>
            </td>
            <td>
                <a href="https://wa.me/${phoneLink}?text=Hola%20${cita.nombre_clienta},%20te%20escribimos%20de%20Bacilos%20Beauty%20para%20confirmar%20tu%20cita." 
                   target="_blank" class="action-btn" onclick="marcarContactado(this, '${cita.id}')">
                   💬 Contactar
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateStats(total, pendientes, hoy) {
    statTotal.innerText = total;
    statPendientes.innerText = pendientes;
    statHoy.innerText = hoy; // Actualiza el número de citas de hoy
}

// NUEVA FUNCIÓN: Cambia a verde en la pantalla y actualiza en SheetDB
async function marcarContactado(btnElement, citaId) {
    // 1. Cambiar visualmente al instante para dar feedback rápido
    const badge = document.getElementById(`badge-${citaId}`);
    if (badge) {
        badge.className = 'status-badge status-contacted';
        badge.innerText = 'Contactado';
    }

    // 2. Enviar actualización silenciosa a la base de datos (SheetDB)
    try {
        await fetch(`${SHEETDB_URL}/id/${citaId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    estado: "Contactado"
                }
            })
        });
        console.log(`Cita ${citaId} actualizada a Contactado en la base de datos.`);
    } catch (error) {
        console.error("Error al guardar el estado en la hoja de cálculo:", error);
    }
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredData = allAppointments.filter(cita => {
        return cita.nombre_clienta.toLowerCase().includes(searchTerm) || 
               cita.telefono.includes(searchTerm) ||
               cita.servicio.toLowerCase().includes(searchTerm);
    });
    renderTable(filteredData);
});

document.addEventListener('DOMContentLoaded', loadAppointments);
refreshBtn.addEventListener('click', () => {
    searchInput.value = ''; 
    loadAppointments();
});
