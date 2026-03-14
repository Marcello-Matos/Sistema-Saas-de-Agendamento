// ============================================
// VERIFICAR RECURSOS DO PLANO
// ============================================

// 85. Verificar se recurso está disponível
function hasFeature(feature) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const planFeatures = {
        basico: ['agendamentos', 'dashboard', 'clientes'],
        profissional: ['agendamentos', 'dashboard', 'clientes', 'whatsapp', 'assistencia'],
        premium: ['agendamentos', 'dashboard', 'clientes', 'whatsapp', 'relatorios', 'vip']
    };
    
    return planFeatures[user.plano]?.includes(feature) || false;
}

// Aplicar verificação de features
const whatsappNotifications = document.getElementById('whatsappNotifications');
if (whatsappNotifications) {
    whatsappNotifications.disabled = !hasFeature('whatsapp');
}