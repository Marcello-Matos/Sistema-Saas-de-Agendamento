// Importar o serviço (se estiver usando módulos)
// const whatsapp = require('../services/whatsappService');

// Se estiver no frontend, você precisará criar uma API endpoint
// Vou criar também um arquivo para API

// ============================================
// FUNÇÃO PARA ENVIAR NOTIFICAÇÃO WHATSAPP
// ============================================
async function sendWhatsAppNotification(appointmentId) {
    try {
        // Buscar dados do agendamento
        const appointment = await db.collection('appointments').doc(appointmentId).get();
        
        if (!appointment.exists) {
            console.error('Agendamento não encontrado');
            return;
        }
        
        const data = appointment.data();
        
        // Verificar se cliente tem WhatsApp ativado
        if (!data.whatsappNotifications) {
            console.log('Cliente não ativou WhatsApp');
            return;
        }
        
        // Chamar API (backend) para enviar
        const response = await fetch('/api/send-whatsapp-reminder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: data.clientPhone,
                appointmentDate: data.dateTime,
                clientName: data.clientName
            })
        });
        
        const result = await response.json();
        console.log('Resultado:', result);
        
    } catch (error) {
        console.error('Erro ao enviar WhatsApp:', error);
    }
}