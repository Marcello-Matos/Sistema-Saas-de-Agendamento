// ============================================
// FUNÇÕES DE AÇÃO
// ============================================

// 57. Excluir item
async function deleteItem(type, id) {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    
    try {
        await db.collection(type + 's').doc(id).delete();
        showNotification('Excluído com sucesso!', 'success');
        await loadAllData();
        if (calendar) calendar.refetchEvents();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir: ' + error.message);
    }
}

// 58. Atualizar status do agendamento
async function updateAppointmentStatus(id, status) {
    try {
        await db.collection('appointments').doc(id).update({ status });
        await loadAllData();
        if (calendar) calendar.refetchEvents();
        
        const messages = {
            'attended': '✅ Cliente marcado como COMPARECEU!',
            'absent': '❌ Cliente marcado como FALTOU!',
            'cancelled': '❌ Agendamento CANCELADO!',
            'confirmed': '✅ Agendamento CONFIRMADO!'
        };
        
        showNotification(messages[status], status === 'attended' || status === 'confirmed' ? 'success' : 'error');
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

// 59. Atualizar data do agendamento
async function updateAppointmentDate(id, newDate) {
    try {
        const dateStr = newDate.toISOString().split('T')[0];
        const timeStr = newDate.toTimeString().substring(0, 5);
        
        await db.collection('appointments').doc(id).update({
            date: dateStr,
            time: timeStr
        });
        
        await loadAllData();
    } catch (error) {
        console.error('Erro ao atualizar data:', error);
    }
}

// 60. Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}