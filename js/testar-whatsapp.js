// testar-whatsapp.js
require('dotenv').config();
const whatsappService = require('./services/whatsappService');

async function testar() {
    console.log('🚀 Testando envio de WhatsApp...');
    
    // Testar com seu número
    const result = await whatsappService.sendAppointmentReminder(
        '+5511938028926',  // SEU NÚMERO
        '2026-03-02T15:30:00'  // Data/hora do agendamento
    );
    
    console.log('📊 Resultado:', result);
}

testar();