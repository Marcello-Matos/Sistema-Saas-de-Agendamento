// teste-final.js
require('dotenv').config();
const twilio = require('twilio');

// Verificar se as variáveis foram carregadas
console.log('🔍 VERIFICANDO CONFIGURAÇÕES:');
console.log('ACCOUNT SID:', process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌');
console.log('AUTH TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌');
console.log('WHATSAPP NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER);
console.log('TEMPLATE SID:', process.env.TEMPLATE_APPOINTMENT_REMINDER);
console.log('-----------------------------------\n');

// Inicializar cliente Twilio
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function testarEnvio() {
    try {
        console.log('📱 ENVIANDO WHATSAPP DE TESTE...\n');
        
        // Formatar data/hora
        const dataTeste = new Date('2026-03-02T15:30:00');
        const mes = dataTeste.getMonth() + 1;
        const dia = dataTeste.getDate();
        let horas = dataTeste.getHours();
        const minutos = dataTeste.getMinutes();
        const ampm = horas >= 12 ? 'pm' : 'am';
        horas = horas % 12;
        horas = horas ? horas : 12;
        
        const dataFormatada = `${mes}/${dia}`;
        const horaFormatada = minutos > 0 
            ? `${horas}:${minutos.toString().padStart(2, '0')}${ampm}`
            : `${horas}${ampm}`;
        
        console.log('📅 Data formatada:', dataFormatada);
        console.log('⏰ Hora formatada:', horaFormatada);
        
        // Enviar mensagem
        const message = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: 'whatsapp:+5511938028926',  // SEU NÚMERO
            contentSid: process.env.TEMPLATE_APPOINTMENT_REMINDER,
            contentVariables: JSON.stringify({
                1: dataFormatada,
                2: horaFormatada
            })
        });
        
        console.log('\n✅ SUCESSO!');
        console.log('📊 SID da mensagem:', message.sid);
        console.log('📊 Status:', message.status);
        
    } catch (error) {
        console.error('\n❌ ERRO:');
        console.error('Mensagem:', error.message);
        if (error.code) {
            console.error('Código:', error.code);
        }
    }
}

testarEnvio();