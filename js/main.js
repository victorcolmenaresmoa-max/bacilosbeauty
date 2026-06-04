// URL de la API de SheetDB
const SHEETDB_URL = "https://sheetdb.io/api/v1/i878c8xxrkwtd";

const form = document.getElementById('booking-form');
const statusMsg = document.getElementById('status-msg');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Cambiar estado del botón
    submitBtn.innerText = "Agendando...";
    submitBtn.disabled = true;

    // Recolectar datos
    const formData = {
        data: [{
            id: "INCREMENT", // SheetDB genera IDs automáticos con esto
            fecha_cita: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            nombre_clienta: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            servicio: document.getElementById('servicio').value,
            detalles_diseno: document.getElementById('detalles').value || "Ninguno",
            estado: "Pendiente"
        }]
    };

    try {
        const response = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            statusMsg.style.color = "green";
            statusMsg.innerText = "¡Cita agendada con éxito! Te contactaremos pronto.";
            form.reset();
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        statusMsg.style.color = "red";
        statusMsg.innerText = "Hubo un error al agendar. Intenta de nuevo.";
        console.error(error);
    } finally {
        submitBtn.innerText = "Confirmar Cita";
        submitBtn.disabled = false;
    }
});
