// ============================================
// FUNÇÃO LOADREPORTSDATA
// ============================================

// 76. Carregar dados de relatórios
async function loadReportsData() {
    try {
        console.log('📊 Carregando dados de relatórios...');
        
        const period = document.getElementById('reportPeriod')?.value || '30';
        console.log('📊 Período selecionado:', period);
        
        const endDate = new Date();
        const startDate = new Date();
        
        if (period !== 'all') {
            startDate.setDate(startDate.getDate() - parseInt(period));
        } else {
            startDate.setFullYear(startDate.getFullYear() - 10);
        }
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        console.log('📊 Período:', startStr, 'até', endStr);
        
        const clientsSnapshot = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .get()
            .catch(error => {
                console.error('Erro ao buscar clientes:', error);
                return { empty: true, forEach: () => {} };
            });
        
        const clients = [];
        clientsSnapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📊 Total de clientes:', clients.length);
        
        const allAppointmentsSnapshot = await db.collection('appointments')
            .where('userId', '==', currentUserId)
            .get()
            .catch(error => {
                console.error('Erro ao buscar agendamentos:', error);
                return { empty: true, forEach: () => {} };
            });
        
        const allAppointments = [];
        allAppointmentsSnapshot.forEach(doc => {
            allAppointments.push({ id: doc.id, ...doc.data() });
        });
        
        const appointments = allAppointments.filter(apt => 
            apt.date >= startStr && apt.date <= endStr
        );
        
        console.log('📊 Total de agendamentos no período:', appointments.length);
        
        const totalClients = clients.filter(c => c.status === 'active').length;
        const totalAppointments = appointments.length;
        const attendedAppointments = appointments.filter(a => a.status === 'attended').length;
        const attendanceRate = totalAppointments > 0 ? ((attendedAppointments / totalAppointments) * 100).toFixed(1) : 0;
        
        let revenueFromAppointments = 0;
        for (const apt of appointments) {
            if (apt.status === 'attended' && apt.serviceId) {
                try {
                    const serviceDoc = await db.collection('services').doc(apt.serviceId).get();
                    if (serviceDoc.exists) {
                        revenueFromAppointments += serviceDoc.data().price || 0;
                    }
                } catch (e) {
                    console.warn('Erro ao buscar serviço:', e);
                }
            }
        }
        
        let revenueFromPlans = 0;
        clients.filter(c => c.status === 'active' && c.plan !== 'AVULSO').forEach(c => {
            if (c.planValue) {
                revenueFromPlans += c.planValue;
            }
        });
        
        const totalRevenue = revenueFromAppointments + revenueFromPlans;
        
        document.getElementById('totalClients').textContent = totalClients;
        document.getElementById('totalAppointments').textContent = totalAppointments;
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('attendanceRate').textContent = attendanceRate + '%';
        
        document.getElementById('clientsGrowth').textContent = '+12%';
        document.getElementById('appointmentsGrowth').textContent = '+8%';
        document.getElementById('revenueGrowth').textContent = '+15%';
        document.getElementById('attendanceChange').textContent = '+5%';
        
        updateReportsCharts(appointments, clients);
        await updateReportClientsList(clients, appointments);
        
        showNotification('Relatórios carregados com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao carregar relatórios:', error);
        showNotification('Erro ao carregar relatórios. Tente novamente.', 'error');
        
        document.getElementById('totalClients').textContent = '0';
        document.getElementById('totalAppointments').textContent = '0';
        document.getElementById('totalRevenue').textContent = 'R$ 0';
        document.getElementById('attendanceRate').textContent = '0%';
    }
}


// ============================================
// ATUALIZAR GRÁFICOS DE RELATÓRIOS
// ============================================

// 77. Atualizar gráficos de relatórios
function updateReportsCharts(appointments, clients) {
    try {
        console.log('📊 Atualizando gráficos de relatórios...');
        
        const colors = loadSavedColors();
        
        const last30Days = [];
        const dates = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            
            const dayAppointments = appointments.filter(a => a.date === dateStr).length;
            last30Days.push(dayAppointments);
        }
        
        if (reportsLineChart) {
            reportsLineChart.updateOptions({
                xaxis: { 
                    categories: dates,
                    labels: { rotate: -45, rotateAlways: false }
                },
                colors: [colors.primary]
            });
            reportsLineChart.updateSeries([{
                name: 'Agendamentos',
                data: last30Days
            }]);
            console.log('📊 Gráfico de linha atualizado');
        }
        
        const origins = {
            'Direto': 0,
            'Total Pass': 0,
            'Well Hub': 0
        };
        
        clients.forEach(c => {
            const origin = c.origin || 'Direto';
            if (origins.hasOwnProperty(origin)) {
                origins[origin]++;
            } else {
                origins['Direto']++;
            }
        });
        
        const originLabels = Object.keys(origins).filter(key => origins[key] > 0);
        const originData = originLabels.map(key => origins[key]);
        
        if (reportsPieChart) {
            reportsPieChart.updateOptions({
                labels: originLabels,
                colors: originLabels.map(label => 
                    label === 'Total Pass' ? colors.primary : 
                    label === 'Well Hub' ? colors.success : colors.warning
                )
            });
            reportsPieChart.updateSeries(originData);
            console.log('📊 Gráfico de pizza atualizado');
        }
        
        db.collection('professionals')
            .where('userId', '==', currentUserId)
            .get()
            .then(profSnapshot => {
                const professionals = [];
                profSnapshot.forEach(doc => {
                    professionals.push({ id: doc.id, name: doc.data().name });
                });
                
                const professionalMap = new Map();
                appointments.forEach(apt => {
                    if (apt.professionalId) {
                        const count = professionalMap.get(apt.professionalId) || 0;
                        professionalMap.set(apt.professionalId, count + 1);
                    }
                });
                
                const professionalNames = [];
                const professionalCounts = [];
                
                const sortedProfessionals = [...professionalMap.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                
                sortedProfessionals.forEach(([id, count]) => {
                    const prof = professionals.find(p => p.id === id);
                    const name = prof ? prof.name : `Profissional ${id.substring(0, 4)}`;
                    professionalNames.push(name);
                    professionalCounts.push(count);
                });
                
                if (reportsBarChart) {
                    reportsBarChart.updateOptions({
                        xaxis: { 
                            categories: professionalNames,
                            labels: { rotate: -45, rotateAlways: false, trim: true }
                        },
                        colors: [colors.secondary]
                    });
                    reportsBarChart.updateSeries([{
                        name: 'Agendamentos',
                        data: professionalCounts
                    }]);
                    console.log('📊 Gráfico de barras atualizado');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar profissionais:', error);
            });
            
    } catch (error) {
        console.error('❌ Erro ao atualizar gráficos:', error);
    }
}



    // ============================================
// ATUALIZAR LISTA DE CLIENTES NO RELATÓRIO
// ============================================

// 78. Atualizar lista de clientes no relatório
async function updateReportClientsList(clients, appointments) {
    const tbody = document.getElementById('reportClientsList');
    if (!tbody) return;
    
    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Nenhum cliente encontrado</td></tr>';
        return;
    }
    
    try {
        const servicesSnapshot = await db.collection('services')
            .where('userId', '==', currentUserId)
            .get();
        
        const services = {};
        servicesSnapshot.forEach(doc => {
            services[doc.id] = doc.data();
        });
        
        const clientRows = await Promise.all(clients.map(async client => {
            const clientAppointments = appointments.filter(a => a.clientId === client.id);
            const total = clientAppointments.length;
            const attended = clientAppointments.filter(a => a.status === 'attended').length;
            const absent = clientAppointments.filter(a => a.status === 'absent').length;
            const rate = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
            
            let revenue = 0;
            for (const apt of clientAppointments) {
                if (apt.status === 'attended' && apt.serviceId && services[apt.serviceId]) {
                    revenue += services[apt.serviceId].price || 0;
                }
            }
            
            if (client.status === 'active' && client.planValue && client.plan !== 'AVULSO') {
                revenue += client.planValue;
            }
            
            const origemClass = client.origin === 'Total Pass' ? 'badge-totalpass' : 
                               (client.origin === 'Well Hub' ? 'badge-wellhub' : '');
            
            let dataInicioFormatada = '---';
            if (client.startDate) {
                const [ano, mes, dia] = client.startDate.split('-');
                dataInicioFormatada = `${dia}/${mes}/${ano}`;
            }
            
            return `
                <tr>
                    <td data-label="Nome">${client.name || '---'}</td>
                    <td data-label="Plano">${client.plan || '---'}</td>
                    <td data-label="Origem"><span class="badge ${origemClass}">${client.origin || 'Direto'}</span></td>
                    <td data-label="Data Início"><span class="start-date-badge"><i class="fas fa-calendar-alt"></i> ${dataInicioFormatada}</span></td>
                    <td data-label="Agendamentos">${total}</td>
                    <td data-label="Comparecimentos">${attended}</td>
                    <td data-label="Faltas">${absent}</td>
                    <td data-label="Taxa">${rate}%</td>
                    <td data-label="Receita">${formatCurrency(revenue)}</td>
                    <td data-label="Ações">
                        <button class="btn-secondary" onclick="generateClientReport('${client.id}')">
                            <i class="fas fa-file-pdf"></i> Relatório
                        </button>
                    </td>
                </tr>
            `;
        }));
        
        tbody.innerHTML = clientRows.join('');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar lista de clientes:', error);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px; color: #ef4444;">Erro ao carregar dados</td></tr>';
    }
}

// ============================================
// GERAR RELATÓRIO INDIVIDUAL DO ALUNO
// ============================================

// 79. Gerar relatório individual do cliente
async function generateClientReport(clientId) {
    try {
        const clientDoc = await db.collection('clients').doc(clientId).get();
        if (!clientDoc.exists) {
            alert('Cliente não encontrado');
            return;
        }
        
        const client = { id: clientDoc.id, ...clientDoc.data() };
        
        const appointmentsSnapshot = await db.collection('appointments')
            .where('userId', '==', currentUserId)
            .where('clientId', '==', clientId)
            .orderBy('date', 'desc')
            .get();
        
        const appointments = [];
        appointmentsSnapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        
        const totalAppointments = appointments.length;
        const attended = appointments.filter(a => a.status === 'attended').length;
        const absent = appointments.filter(a => a.status === 'absent').length;
        const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
        const rate = totalAppointments > 0 ? (attended / totalAppointments * 100).toFixed(1) : 0;
        
        let revenue = 0;
        for (const apt of appointments) {
            if (apt.status === 'attended' && apt.serviceId) {
                try {
                    const serviceDoc = await db.collection('services').doc(apt.serviceId).get();
                    if (serviceDoc.exists) {
                        revenue += serviceDoc.data().price || 0;
                    }
                } catch (e) {}
            }
        }
        
        if (client.status === 'active' && client.planValue && client.plan !== 'AVULSO') {
            revenue += client.planValue;
        }
        
        const colors = loadSavedColors();
        
        const content = document.getElementById('clientReportContent');
        const title = document.getElementById('clientReportTitle');
        
        title.innerHTML = `Relatório - ${client.name}`;
        
        const initials = client.name ? client.name.substring(0, 2).toUpperCase() : 'CL';
        const fotoHtml = client.photoBase64 ? 
            `<img src="${client.photoBase64}" alt="${client.name}">` : 
            `<span>${initials}</span>`;
        
        let dataInicioFormatada = 'Não informado';
        if (client.startDate) {
            const [ano, mes, dia] = client.startDate.split('-');
            dataInicioFormatada = `${dia}/${mes}/${ano}`;
        }
        
        content.innerHTML = `
            <div class="client-report-content">
                <div class="client-report-header">
                    <div class="client-report-avatar">
                        ${fotoHtml}
                    </div>
                    <div class="client-report-info">
                        <h3>${client.name}</h3>
                        <p><i class="fas fa-envelope"></i> ${client.email || 'Não informado'}</p>
                        <p><i class="fas fa-phone"></i> ${client.phone || 'Não informado'}</p>
                        <p><i class="fas fa-id-card"></i> CPF: ${client.cpf ? client.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não informado'}</p>
                        <p><i class="fas fa-calendar-alt"></i> Data de Início: ${dataInicioFormatada}</p>
                    </div>
                </div>
                
                <div class="client-report-stats">
                    <div class="client-report-stat">
                        <div class="client-report-stat-value">${totalAppointments}</div>
                        <div class="client-report-stat-label">Total de Agendamentos</div>
                    </div>
                    <div class="client-report-stat">
                        <div class="client-report-stat-value">${attended}</div>
                        <div class="client-report-stat-label">Comparecimentos</div>
                    </div>
                    <div class="client-report-stat">
                        <div class="client-report-stat-value">${absent}</div>
                        <div class="client-report-stat-label">Faltas</div>
                    </div>
                    <div class="client-report-stat">
                        <div class="client-report-stat-value">${rate}%</div>
                        <div class="client-report-stat-label">Taxa de Comparecimento</div>
                    </div>
                </div>
                
                <div class="client-report-chart" id="clientReportChart"></div>
                
                <div class="client-report-details">
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Plano:</span>
                        <span class="client-report-detail-value">${client.plan || 'Não possui'}</span>
                    </div>
                    ${client.plan !== 'AVULSO' ? `
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Valor do Plano:</span>
                        <span class="client-report-detail-value">${client.planValue ? formatCurrency(client.planValue) : '---'}</span>
                    </div>
                    ` : ''}
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Origem:</span>
                        <span class="client-report-detail-value">${client.origin || 'Direto'}</span>
                    </div>
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Status:</span>
                        <span class="client-report-detail-value">${client.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </div>
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Receita Gerada:</span>
                        <span class="client-report-detail-value">${formatCurrency(revenue)}</span>
                    </div>
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Cidade:</span>
                        <span class="client-report-detail-value">${client.city || 'Não informado'}</span>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Últimos Agendamentos</h4>
                    <table style="width: 100%; margin-top: 10px;">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Horário</th>
                                <th>Serviço</th>
                                <th>Profissional</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appointments.slice(0, 5).map(apt => {
                                const statusMap = {
                                    'attended': 'Compareceu',
                                    'absent': 'Faltou',
                                    'confirmed': 'Confirmado',
                                    'pending': 'Pendente',
                                    'cancelled': 'Cancelado'
                                };
                                return `
                                    <tr>
                                        <td>${new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td>${apt.time || '--:--'}</td>
                                        <td>${apt.serviceId ? 'Serviço' : '---'}</td>
                                        <td>${apt.professionalId ? 'Profissional' : '---'}</td>
                                        <td><span class="status-${apt.status || 'pending'}">${statusMap[apt.status] || 'Pendente'}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        const chartOptions = {
            series: [attended, absent, pending],
            chart: {
                type: 'pie',
                height: 200,
                width: '100%'
            },
            labels: ['Compareceu', 'Faltou', 'Pendente'],
            colors: [colors.success, colors.danger, colors.warning],
            legend: {
                position: 'bottom',
                fontSize: '12px'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        height: 150
                    }
                }
            }]
        };
        
        const chart = new ApexCharts(document.querySelector("#clientReportChart"), chartOptions);
        chart.render();
        
        window.currentClientChart = chart;
        
        document.getElementById('clientReportModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Erro ao gerar relatório do cliente:', error);
        alert('Erro ao gerar relatório. Tente novamente.');
    }
}

// ============================================
// FECHAR MODAL DE RELATÓRIO
// ============================================

// 80. Fechar modal de relatório
function closeClientReportModal() {
    document.getElementById('clientReportModal').style.display = 'none';
    
    if (window.currentClientChart) {
        window.currentClientChart.destroy();
        window.currentClientChart = null;
    }
}

// ============================================
// GERAR RELATÓRIO GERAL EM PDF
// ============================================

// 81. Gerar relatório geral em PDF
async function generateGeneralReport() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        const colors = loadSavedColors();
        
        doc.setFontSize(18);
        doc.setTextColor(parseInt(colors.primary.slice(1,3), 16), parseInt(colors.primary.slice(3,5), 16), parseInt(colors.primary.slice(5,7), 16));
        doc.text('RELATÓRIO GERAL NEXBOOK', 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
        
        const clientsSnapshot = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .get();
        
        const appointmentsSnapshot = await db.collection('appointments')
            .where('userId', '==', currentUserId)
            .get();
        
        const clients = [];
        clientsSnapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        
        const appointments = [];
        appointmentsSnapshot.forEach(doc => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        
        const totalClients = clients.length;
        const activeClients = clients.filter(c => c.status === 'active').length;
        const totalAppointments = appointments.length;
        const attendedAppointments = appointments.filter(a => a.status === 'attended').length;
        const attendanceRate = totalAppointments > 0 ? (attendedAppointments / totalAppointments * 100).toFixed(1) : 0;
        
        const totalPassClients = clients.filter(c => c.origin === 'Total Pass').length;
        const wellHubClients = clients.filter(c => c.origin === 'Well Hub').length;
        const directClients = clients.filter(c => !c.origin || c.origin === 'Direto').length;
        const avulsoClients = clients.filter(c => c.plan === 'AVULSO').length;
        
        let totalRevenue = 0;
        for (const apt of appointments) {
            if (apt.status === 'attended' && apt.serviceId) {
                try {
                    const serviceDoc = await db.collection('services').doc(apt.serviceId).get();
                    if (serviceDoc.exists) {
                        totalRevenue += serviceDoc.data().price || 0;
                    }
                } catch (e) {}
            }
        }
        
        clients.filter(c => c.status === 'active' && c.plan !== 'AVULSO').forEach(c => {
            if (c.planValue) {
                totalRevenue += c.planValue;
            }
        });
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('INDICADORES PRINCIPAIS', 14, 40);
        
        doc.setFontSize(10);
        doc.text(`Total de Clientes: ${totalClients}`, 14, 48);
        doc.text(`Clientes Ativos: ${activeClients}`, 14, 55);
        doc.text(`Total de Agendamentos: ${totalAppointments}`, 14, 62);
        doc.text(`Taxa de Comparecimento: ${attendanceRate}%`, 14, 69);
        doc.text(`Receita Total: ${formatCurrency(totalRevenue)}`, 14, 76);
        
        doc.text(`Total Pass: ${totalPassClients}`, 120, 48);
        doc.text(`Well Hub: ${wellHubClients}`, 120, 55);
        doc.text(`Direto: ${directClients}`, 120, 62);
        doc.text(`AVULSO: ${avulsoClients}`, 120, 69);
        
        doc.text('LISTA DE CLIENTES', 14, 90);
        
        const tableColumn = ['Nome', 'CPF', 'Telefone', 'Plano', 'Origem', 'Data Início', 'Status', 'Valor'];
        const tableRows = [];
        
        clients.slice(0, 20).forEach(client => {
            const cpfFormatado = client.cpf ? client.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '---';
            const valor = client.planValue ? formatCurrency(client.planValue) : '---';
            const origem = client.origin || 'Direto';
            
            let dataInicioFormatada = '---';
            if (client.startDate) {
                const [ano, mes, dia] = client.startDate.split('-');
                dataInicioFormatada = `${dia}/${mes}/${ano}`;
            }
            
            tableRows.push([
                client.name || '---',
                cpfFormatado,
                client.phone || '---',
                client.plan || '---',
                origem,
                dataInicioFormatada,
                client.status === 'active' ? 'Ativo' : 'Inativo',
                valor
            ]);
        });
        
        doc.autoTable({
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [parseInt(colors.primary.slice(1,3), 16), parseInt(colors.primary.slice(3,5), 16), parseInt(colors.primary.slice(5,7), 16)] }
        });
        
        doc.save(`relatorio-geral-${new Date().toISOString().split('T')[0]}.pdf`);
        
        showNotification('Relatório PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar relatório PDF:', error);
        alert('Erro ao gerar relatório PDF. Tente novamente.');
    }
}

// 82. Download relatório individual PDF
async function downloadClientReportPDF() {
    alert('Função de download PDF será implementada em breve!');
}