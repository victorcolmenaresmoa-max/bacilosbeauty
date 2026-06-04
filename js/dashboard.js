// URL de la API de SheetDB (Debe ser la misma que en main.js)
const SHEETDB_URL = "TU_API_URL_DE_SHEETDB";

const tableBody = document.getElementById('table-body');
const refreshBtn = document.getElementById('refresh-btn');

async function loadAppointments() {
    tableBody.innerHTML = '<tr><td colspan="7">Cargando citas... ⏳</td></tr>';
    
    try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        
        tableBody.innerHTML = ''; // Limpiar tabla
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No hay citas agendadas aún.</td></tr>';
            return;
        }

        // Ordenar datos por fecha
        data.sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));

        data.forEach(cita => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${cita.fecha_cita}</strong></td>
                <td>${cita.hora}</td>
                <td>${cita.nombre_clienta}</td>
                <td><a href="https://wa.me/${cita.telefono.replace(/\D/g,'')}" target="_blank">📲 ${cita.telefono}</a></td>
                <td>${cita.servicio}</td>
                <td>${cita.detalles_diseno}</td>
                <td><span style="background:#ffd700; padding:4px 8px; border-radius:4px; font-size:0.8rem;">${cita.estado}</span></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error cargando los datos:', error);
        tableBody.innerHTML = '<tr><td colspan="7" style="color:red;">Error al conectar con la base de datos.</td></tr>';
    }
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', loadAppointments);
// Cargar al hacer click en el botón
refreshBtn.addEventListener('click', loadAppointments);