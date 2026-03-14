// ============================================
// FUNÇÃO LOADDASHBOARDDATA
// ============================================

// 19. Carregar dados do dashboard
async function loadDashboardData() {
    try {
        const professionalFilter = document.getElementById('professionalFilter')?.value || 'all';
        const serviceFilter = document.getElementById('serviceFilter')?.value || 'all';
        
        console.log('📊 Carregando dashboard com filtros:', { professionalFilter, serviceFilter });
        
        let query = db.collection('appointments').where('userId', '==', currentUserId);
        
        if (professionalFilter !== 'all') {
            query = query.where('professionalId', '==', professionalFilter);
        }
        if (serviceFilter !== 'all') {
            query = query.where('serviceId', '==', serviceFilter);
        }
        
        const snapshot = await query.get();
        console.log('✅ Total agendamentos encontrados:', snapshot.size);
        
        const appointments = [];
        snapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        console.log('📅 Data de hoje formatada:', todayStr);
        
        const todayAppointments = appointments.filter(a => a.date === todayStr);
        console.log('📅 Agendamentos encontrados para hoje:', todayAppointments.length);
        
        // Calcular faturamento do dia
        let todayRevenue = 0;
        for (const apt of todayAppointments) {
            if (apt.serviceId) {
                try {
                    const serviceDoc = await db.collection('services').doc(apt.serviceId).get();
                    if (serviceDoc.exists) {
                        todayRevenue += serviceDoc.data().price || 0;
                    }
                } catch (e) {
                    console.warn('Erro ao buscar serviço:', e);
                }
            }
        }
        
        // Buscar todos os clientes
        const clientsSnapshot = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .get();
        
        const clients = [];
        clientsSnapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        
        // CALCULAR FATURAMENTO MENSAL (INCLUINDO AGENDAMENTOS AVULSOS DO MÊS)
        let monthlyRevenue = 0;
        const clientValues = [];
        
        // Pegar o primeiro e último dia do mês atual
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
        const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];
        
        // 1. Adicionar valores dos planos mensais (clientes ativos)
        clients.filter(c => c.status === 'active' && c.plan !== 'AVULSO').forEach(client => {
            if (client.planValue && client.planValue > 0) {
                monthlyRevenue += client.planValue;
                clientValues.push({
                    name: client.name,
                    valor: client.planValue,
                    plano: client.plan
                });
            }
        });
        
        // 2. Adicionar valores dos agendamentos AVULSOS do mês atual
        const avulsoAppointments = appointments.filter(apt => {
            // Verificar se é um cliente avulso
            const client = clients.find(c => c.id === apt.clientId);
            return client && client.plan === 'AVULSO' && 
                   apt.date >= firstDayStr && apt.date <= lastDayStr &&
                   apt.status === 'attended'; // Só contabilizar se compareceu
        });
        
        for (const apt of avulsoAppointments) {
            if (apt.serviceId) {
                try {
                    const serviceDoc = await db.collection('services').doc(apt.serviceId).get();
                    if (serviceDoc.exists) {
                        const servicePrice = serviceDoc.data().price || 0;
                        monthlyRevenue += servicePrice;
                        
                        // Adicionar aos detalhes para tooltip
                        const client = clients.find(c => c.id === apt.clientId);
                        if (client) {
                            clientValues.push({
                                name: `${client.name} (Avulso - ${new Date(apt.date).toLocaleDateString('pt-BR')})`,
                                valor: servicePrice,
                                plano: 'AVULSO'
                            });
                        }
                    }
                } catch (e) {
                    console.warn('Erro ao buscar serviço para avulso:', e);
                }
            }
        }
        
        console.log('💰 FATURAMENTO MENSAL REAL (incluindo avulsos):', formatCurrency(monthlyRevenue));
        console.log('📊 Detalhamento:', clientValues);
        
        // Atualizar ou criar card de faturamento mensal
        let monthlyCard = document.getElementById('monthlyRevenueCard');
        
        if (!monthlyCard) {
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) {
                const newCard = document.createElement('div');
                newCard.className = 'stat-card';
                newCard.id = 'monthlyRevenueCard';
                newCard.innerHTML = `
                    <div class="stat-header">
                        <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                        <span class="stat-badge positive">Mensal</span>
                    </div>
                    <div class="stat-value" id="monthlyRevenueValue">${formatCurrency(monthlyRevenue)}</div>
                    <div class="stat-label">Faturamento Mensal</div>
                    <div class="stat-comparison">
                        <i class="fas fa-users"></i> <span>${clients.filter(c => c.status === 'active').length} clientes ativos</span>
                    </div>
                `;
                statsGrid.appendChild(newCard);
            }
        } else {
            const valueElement = document.getElementById('monthlyRevenueValue');
            if (valueElement) {
                valueElement.textContent = formatCurrency(monthlyRevenue);
                
                // Criar tooltip detalhado
                let tooltipText = 'Detalhamento do faturamento mensal:\n';
                clientValues.sort((a, b) => b.valor - a.valor).forEach(c => {
                    tooltipText += `${c.name}: ${formatCurrency(c.valor)}\n`;
                });
                tooltipText += `\nTotal: ${formatCurrency(monthlyRevenue)}`;
                valueElement.title = tooltipText;
            }
        }
        
        // Calcular faturamento projetado (anual)
        // Para planos: multiplicar por 12
        // Para avulsos: média dos últimos 3 meses * 12
        const projectedRevenue = calculateProjectedRevenue(clients, appointments);
        
        let projectedCard = document.getElementById('projectedRevenueCard');
        
        if (!projectedCard) {
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) {
                const newCard = document.createElement('div');
                newCard.className = 'stat-card';
                newCard.id = 'projectedRevenueCard';
                newCard.innerHTML = `
                    <div class="stat-header">
                        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                        <span class="stat-badge positive">Anual</span>
                    </div>
                    <div class="stat-value" id="projectedRevenueValue">${formatCurrency(projectedRevenue)}</div>
                    <div class="stat-label">Faturamento Projetado</div>
                    <div class="stat-comparison">
                        <i class="fas fa-calendar"></i> <span>12 meses</span>
                    </div>
                `;
                statsGrid.appendChild(newCard);
            }
        } else {
            const valueElement = document.getElementById('projectedRevenueValue');
            if (valueElement) {
                valueElement.textContent = formatCurrency(projectedRevenue);
            }
        }
        
        // Carregar profissionais ativos
        try {
            const profSnapshot = await db.collection('professionals')
                .where('userId', '==', currentUserId)
                .where('active', '==', true)
                .get();
            document.getElementById('attendanceValue').textContent = profSnapshot.size;
        } catch (e) {
            console.warn('Erro ao carregar profissionais:', e);
        }
        
        document.getElementById('clientsValue').textContent = clients.filter(c => c.status === 'active').length;
        document.getElementById('todayCount').textContent = todayAppointments.length;
        document.getElementById('revenueValue').textContent = formatCurrency(todayRevenue);
        
        updateAppointmentsList(appointments);
        updateCharts(appointments);
        updatePlansChart(clientsSnapshot);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}