// ============================================
// GRÁFICO DE DISTRIBUIÇÃO DE PLANOS
// ============================================

// 21. Atualizar gráfico de planos
function updatePlansChart(clientsSnapshot) {
    if (!servicesChart) return;
    
    const planCounts = {
        MENSAL: 0,
        TRIMESTRAL: 0,
        SEMESTRAL: 0,
        ANUAL: 0,
        AVULSO: 0
    };
    
    clientsSnapshot.forEach(doc => {
        const client = doc.data();
        if (client.plan && planCounts.hasOwnProperty(client.plan)) {
            planCounts[client.plan]++;
        } else if (client.plan === 'AVULSO') {
            planCounts.AVULSO++;
        }
    });
    
    const planData = [
        planCounts.MENSAL,
        planCounts.TRIMESTRAL,
        planCounts.SEMESTRAL,
        planCounts.ANUAL,
        planCounts.AVULSO
    ];
    
    const planLabels = ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'AVULSO'];
    
    const colors = loadSavedColors();
    servicesChart.updateOptions({
        labels: planLabels,
        colors: [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger]
    });
    servicesChart.updateSeries(planData);
    
    console.log('📊 Distribuição de planos:', planCounts);
}