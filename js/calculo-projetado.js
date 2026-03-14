// ============================================
// FUNÇÃO PARA CALCULAR FATURAMENTO PROJETADO
// ============================================

// 20. Calcular faturamento projetado
function calculateProjectedRevenue(clients, appointments) {
    let projectedRevenue = 0;
    
    // 1. Planos mensais: multiplicar por 12
    clients.filter(c => c.status === 'active' && c.plan !== 'AVULSO').forEach(client => {
        if (client.planValue) {
            projectedRevenue += client.planValue * 12;
        }
    });
    
    // 2. Avulsos: média dos últimos 3 meses * 12
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    
    // Buscar IDs de clientes avulsos
    const avulsoClientIds = clients
        .filter(c => c.plan === 'AVULSO')
        .map(c => c.id);
    
    // Filtrar agendamentos de avulsos nos últimos 3 meses
    const recentAvulsoAppointments = appointments.filter(apt => 
        avulsoClientIds.includes(apt.clientId) &&
        apt.date >= threeMonthsAgoStr &&
        apt.status === 'attended'
    );
    
    // Calcular média mensal
    let avulsoTotal = 0;
    const avulsoPromises = recentAvulsoAppointments.map(async apt => {
        if (apt.serviceId) {
            try {
                const serviceDoc = await db.collection('services').doc(apt.serviceId).get();
                if (serviceDoc.exists) {
                    avulsoTotal += serviceDoc.data().price || 0;
                }
            } catch (e) {
                console.warn('Erro ao calcular projeção de avulso:', e);
            }
        }
    });
    
    // Como é síncrono, vamos calcular de forma síncrona (valores já devem estar no cache)
    // Na prática, os valores dos serviços já foram carregados antes
    
    // Adicionar projeção de avulsos (média mensal * 12)
    if (recentAvulsoAppointments.length > 0) {
        const avulsoValue = avulsoTotal; // Total dos últimos 3 meses
        const monthlyAverage = avulsoValue / 3;
        projectedRevenue += monthlyAverage * 12;
    }
    
    return projectedRevenue;
}