// ============================================
// FUNÇÃO DE GRÁFICO
// ============================================

// 32. Atualizar gráficos principais
function updateCharts(appointments) {
    const categories = [];
    const attendedData = [];
    const absentData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        categories.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
        
        const dayAppointments = appointments.filter(a => a.date === dateStr);
        
        const attended = dayAppointments.filter(a => a.status === 'attended').length;
        const absent = dayAppointments.filter(a => a.status === 'absent').length;
        
        attendedData.push(attended);
        absentData.push(absent);
    }
    
    if (appointmentsChart) {
        const colors = loadSavedColors();
        appointmentsChart.updateOptions({ 
            xaxis: { categories },
            colors: [colors.success, colors.danger]
        });
        appointmentsChart.updateSeries([
            { name: 'Compareceram', data: attendedData },
            { name: 'Faltaram', data: absentData }
        ]);
    }
}