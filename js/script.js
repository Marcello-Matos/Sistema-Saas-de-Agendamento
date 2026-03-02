// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCCvnw5eBBjUAa0piQ7Njy2t_W4TVZSIwk",
    authDomain: "nexbook-14d69.firebaseapp.com",
    projectId: "nexbook-14d69",
    storageBucket: "nexbook-14d69.firebasestorage.app",
    messagingSenderId: "445301731220",
    appId: "1:445301731220:web:500608bc6903aa8a40e981",
    measurementId: "G-VYH8GSRLZD"
};

// Initialize Firebase
let auth, db, storage;
let currentUser = null;
let currentUserId = null;
let appointmentsChart, servicesChart, calendar;
let editingId = null;
let currentModalType = null;
let currentPhotoBase64 = null;
let isMobileSidebarOpen = false;
// ============================================
// NOVA VARIÁVEL PARA FILTRO DE BUSCA
// ============================================
let globalSearchTerm = '';

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('🔥 Firebase conectado');
} catch (e) {
    console.warn('⚠️ Erro no Firebase:', e);
}

// ============================================
// FUNÇÕES DE RESPONSIVIDADE
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
        isMobileSidebarOpen = sidebar.classList.contains('mobile-open');
        toggleBtn.innerHTML = isMobileSidebarOpen ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function adjustTablesForMobile() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('table').forEach(table => {
            table.classList.add('mobile-table');
        });
    } else {
        document.querySelectorAll('table').forEach(table => {
            table.classList.remove('mobile-table');
        });
    }
}

// Fechar sidebar mobile ao clicar em um item
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            document.getElementById('sidebarToggle').innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

window.addEventListener('resize', function() {
    adjustTablesForMobile();
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('mobile-open');
        document.getElementById('sidebarToggle').innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// ============================================
// NOVA FUNÇÃO DE BUSCA GLOBAL
// ============================================
function handleGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    globalSearchTerm = searchInput.value.toLowerCase().trim();
    
    console.log('🔍 Buscando por:', globalSearchTerm);
    
    const activeView = document.querySelector('.view.active')?.id;
    
    if (activeView === 'professionalsView') {
        filterProfessionalsTable();
    } else if (activeView === 'servicesView') {
        filterServicesTable();
    } else if (activeView === 'clientsView') {
        filterClientsTable();
    } else {
        loadAllData();
    }
}

// ============================================
// NOVAS FUNÇÕES DE FILTRO POR TABELA
// ============================================
function filterProfessionalsTable() {
    const rows = document.querySelectorAll('#professionalsList tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.cells && row.cells.length > 0) {
            const nome = row.cells[0]?.textContent.toLowerCase() || '';
            const especialidade = row.cells[1]?.textContent.toLowerCase() || '';
            const email = row.cells[2]?.textContent.toLowerCase() || '';
            const telefone = row.cells[3]?.textContent.toLowerCase() || '';
            
            const matches = nome.includes(globalSearchTerm) || 
                           especialidade.includes(globalSearchTerm) || 
                           email.includes(globalSearchTerm) || 
                           telefone.includes(globalSearchTerm);
            
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        }
    });
    
    const tbody = document.getElementById('professionalsList');
    if (visibleCount === 0 && rows.length > 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsRow';
        noResultsRow.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">Nenhum profissional encontrado com o termo "' + globalSearchTerm + '"</td>';
        
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
        tbody.appendChild(noResultsRow);
    } else {
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
    }
}

function filterServicesTable() {
    const rows = document.querySelectorAll('#servicesList tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.cells && row.cells.length > 0) {
            const nome = row.cells[0]?.textContent.toLowerCase() || '';
            const descricao = row.cells[2]?.textContent.toLowerCase() || '';
            
            const matches = nome.includes(globalSearchTerm) || descricao.includes(globalSearchTerm);
            
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        }
    });
    
    const tbody = document.getElementById('servicesList');
    if (visibleCount === 0 && rows.length > 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsRow';
        noResultsRow.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">Nenhum serviço encontrado com o termo "' + globalSearchTerm + '"</td>';
        
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
        tbody.appendChild(noResultsRow);
    } else {
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
    }
}

function filterClientsTable() {
    const rows = document.querySelectorAll('#clientsList tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.cells && row.cells.length > 0) {
            const nome = row.cells[1]?.textContent.toLowerCase() || '';
            const cpf = row.cells[2]?.textContent.toLowerCase() || '';
            const email = row.cells[3]?.textContent.toLowerCase() || '';
            const telefone = row.cells[4]?.textContent.toLowerCase() || '';
            const plano = row.cells[5]?.textContent.toLowerCase() || '';
            const cidade = row.cells[7]?.textContent.toLowerCase() || '';
            
            const matches = nome.includes(globalSearchTerm) || 
                           cpf.includes(globalSearchTerm) || 
                           email.includes(globalSearchTerm) || 
                           telefone.includes(globalSearchTerm) ||
                           plano.includes(globalSearchTerm) ||
                           cidade.includes(globalSearchTerm);
            
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        }
    });
    
    const tbody = document.getElementById('clientsList');
    if (visibleCount === 0 && rows.length > 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsRow';
        noResultsRow.innerHTML = '<td colspan="10" style="text-align: center; padding: 20px;">Nenhum cliente encontrado com o termo "' + globalSearchTerm + '"</td>';
        
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
        tbody.appendChild(noResultsRow);
    } else {
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
    }
}

// ============================================
// FUNÇÕES DE CARREGAMENTO
// ============================================
async function loadAllData() {
    if (!currentUserId) return;
    
    await Promise.all([
        loadDashboardData(),
        loadProfessionals(),
        loadServices(),
        loadClients(),
        loadFilters()
    ]);
}

// ============================================
// FUNÇÃO CORRIGIDA - AGORA CALCULA O VALOR MENSAL REAL
// BASEADO NOS PLANOS DOS CLIENTES
// ============================================
async function loadDashboardData() {
    try {
        const professionalFilter = document.getElementById('professionalFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;
        
        console.log('📊 Carregando dashboard com filtros:', { professionalFilter, serviceFilter });
        
        // Buscar TODOS os agendamentos primeiro
        let query = db.collection('appointments')
            .where('userId', '==', currentUserId);
        
        // Aplicar filtros se necessário
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
        
        // Filtrar por termo de busca global se existir
        const filteredAppointments = globalSearchTerm ? 
            appointments.filter(apt => {
                return apt.clientName?.toLowerCase().includes(globalSearchTerm) ||
                       apt.serviceName?.toLowerCase().includes(globalSearchTerm) ||
                       apt.professionalName?.toLowerCase().includes(globalSearchTerm);
            }) : appointments;
        
        // Calcular agendamentos de hoje
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = filteredAppointments.filter(a => a.date === today);
        console.log('📅 Agendamentos hoje:', todayAppointments.length);
        
        // Calcular faturamento de hoje
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
        
        // ============================================
        // NOVO: CALCULAR FATURAMENTO MENSAL REAL BASEADO NOS PLANOS
        // ============================================
        
        // Buscar todos os clientes ativos
        const clientsSnapshot = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .where('status', '==', 'active')
            .get();
        
        let monthlyRevenue = 0;
        const clientValues = [];
        
        clientsSnapshot.forEach(doc => {
            const client = doc.data();
            if (client.planValue && client.planValue > 0) {
                monthlyRevenue += client.planValue;
                clientValues.push({
                    name: client.name,
                    valor: client.planValue,
                    plano: client.plan
                });
            }
        });
        
        console.log('💰 FATURAMENTO MENSAL REAL (baseado nos planos):', formatCurrency(monthlyRevenue));
        console.log('📋 Detalhamento por cliente:', clientValues);
        
        // ============================================
        // CRIAR/ATUALIZAR CARD DE FATURAMENTO MENSAL NO DASHBOARD
        // ============================================
        
        // Verificar se já existe o card de faturamento mensal
        let monthlyCard = document.getElementById('monthlyRevenueCard');
        
        if (!monthlyCard) {
            // Criar o card se não existir
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
                    <div class="stat-label">Faturamento Mensal (Planos)</div>
                    <div class="stat-comparison">
                        <i class="fas fa-users"></i> <span>${clientsSnapshot.size} clientes ativos</span>
                    </div>
                `;
                statsGrid.appendChild(newCard);
            }
        } else {
            // Atualizar o card existente
            const valueElement = document.getElementById('monthlyRevenueValue');
            if (valueElement) {
                valueElement.textContent = formatCurrency(monthlyRevenue);
                
                // Adicionar tooltip com detalhamento
                let tooltipText = 'Detalhamento dos planos:\n';
                clientValues.forEach(c => {
                    tooltipText += `${c.name} (${c.plano}): ${formatCurrency(c.valor)}\n`;
                });
                valueElement.title = tooltipText;
            }
        }
        
        // ============================================
        // CALCULAR FATURAMENTO PROJETADO (ANUAL)
        // ============================================
        const projectedRevenue = monthlyRevenue * 12;
        
        // Verificar se já existe o card de faturamento projetado
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
        
        // ============================================
        // Buscar profissionais ativos
        // ============================================
        try {
            const profSnapshot = await db.collection('professionals')
                .where('userId', '==', currentUserId)
                .where('active', '==', true)
                .get();
            document.getElementById('attendanceValue').textContent = profSnapshot.size;
        } catch (e) {
            console.warn('Erro ao carregar profissionais:', e);
        }
        
        // ============================================
        // Buscar clientes ativos (já temos o clientsSnapshot)
        // ============================================
        document.getElementById('clientsValue').textContent = clientsSnapshot.size;
        
        // Atualizar UI
        document.getElementById('todayCount').textContent = todayAppointments.length;
        document.getElementById('revenueValue').textContent = formatCurrency(todayRevenue);
        
        updateAppointmentsList(filteredAppointments);
        updateCharts(filteredAppointments);
        
        // ============================================
        // ATUALIZAR GRÁFICO DE PLANOS
        // ============================================
        updatePlansChart(clientsSnapshot);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// ============================================
// NOVA FUNÇÃO: GRÁFICO DE DISTRIBUIÇÃO DE PLANOS
// ============================================
function updatePlansChart(clientsSnapshot) {
    if (!servicesChart) return;
    
    const planCounts = {
        MENSAL: 0,
        TRIMESTRAL: 0,
        SEMESTRAL: 0,
        ANUAL: 0
    };
    
    clientsSnapshot.forEach(doc => {
        const client = doc.data();
        if (client.plan && planCounts.hasOwnProperty(client.plan)) {
            planCounts[client.plan]++;
        }
    });
    
    const planData = [
        planCounts.MENSAL,
        planCounts.TRIMESTRAL,
        planCounts.SEMESTRAL,
        planCounts.ANUAL
    ];
    
    const planLabels = ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'];
    
    servicesChart.updateOptions({
        labels: planLabels,
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#7c3aed']
    });
    servicesChart.updateSeries(planData);
    
    console.log('📊 Distribuição de planos:', planCounts);
}

// ============================================
// FUNÇÃO LOADPROFESSIONALS CORRIGIDA - ORDEM ALFABÉTICA + FILTRO
// ============================================
async function loadProfessionals() {
    try {
        const snapshot = await db.collection('professionals')
            .where('userId', '==', currentUserId)
            .get();
            
        const professionals = [];
        snapshot.forEach(doc => {
            professionals.push({ id: doc.id, ...doc.data() });
        });
        
        // ORDENAR POR NOME EM ORDEM ALFABÉTICA
        professionals.sort((a, b) => {
            const nomeA = (a.name || '').toLowerCase();
            const nomeB = (b.name || '').toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
        
        document.getElementById('attendanceValue').textContent = professionals.filter(p => p.active).length;
        
        const tbody = document.getElementById('professionalsList');
        if (tbody) {
            if (professionals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum profissional cadastrado</td></tr>';
            } else {
                tbody.innerHTML = professionals.map(p => `
                    <tr>
                        <td data-label="Nome">${p.name || '---'}</td>
                        <td data-label="Especialidade">${p.specialty || '---'}</td>
                        <td data-label="Email">${p.email || '---'}</td>
                        <td data-label="Telefone">${p.phone || '---'}</td>
                        <td data-label="Status"><span class="badge ${p.active ? 'active' : 'inactive'}">${p.active ? 'Ativo' : 'Inativo'}</span></td>
                        <td data-label="Ações">
                            <div class="table-actions">
                                <button class="btn-secondary" onclick="editItem('professional', '${p.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-danger" onclick="deleteItem('professional', '${p.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Aplicar filtro de busca se existir
            if (globalSearchTerm) {
                filterProfessionalsTable();
            }
        }
        
        updateProfessionalFilter(professionals);
        
    } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
    }
}

// ============================================
// FUNÇÃO LOADSERVICES - CORRIGIDA (SÓ REMOVI O PRICE)
// ============================================
async function loadServices() {
    try {
        const snapshot = await db.collection('services')
            .where('userId', '==', currentUserId)
            .get();
            
        const services = [];
        snapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });
        
        // ORDENAR POR NOME EM ORDEM ALFABÉTICA
        services.sort((a, b) => {
            const nomeA = (a.name || '').toLowerCase();
            const nomeB = (b.name || '').toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
        
        const tbody = document.getElementById('servicesList');
        if (tbody) {
            if (services.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum serviço cadastrado</td></tr>';
            } else {
                tbody.innerHTML = services.map(s => `
                    <tr>
                        <td data-label="Nome">${s.name || '---'}</td>
                        <td data-label="Duração">${s.duration || 0} min</td>
                        <td data-label="Descrição">${s.description || '---'}</td>
                        <td data-label="Status"><span class="badge ${s.active ? 'active' : 'inactive'}">${s.active ? 'Ativo' : 'Inativo'}</span></td>
                        <td data-label="Ações">
                            <div class="table-actions">
                                <button class="btn-secondary" onclick="editItem('service', '${s.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-danger" onclick="deleteItem('service', '${s.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Aplicar filtro de busca se existir
            if (globalSearchTerm) {
                filterServicesTable();
            }
        }
        
        updateServiceFilter(services);
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// ============================================
// FUNÇÃO LOADCLIENTS CORRIGIDA - AGORA MOSTRA PLANO E VALOR + ORDEM ALFABÉTICA
// ============================================
async function loadClients() {
    try {
        const snapshot = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .get();
            
        const clients = [];
        snapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        
        // ORDENAR POR NOME EM ORDEM ALFABÉTICA
        clients.sort((a, b) => {
            const nomeA = (a.name || '').toLowerCase();
            const nomeB = (b.name || '').toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
        
        document.getElementById('clientsValue').textContent = clients.filter(c => c.status === 'active').length;
        
        const tbody = document.getElementById('clientsList');
        if (tbody) {
            if (clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum cliente cadastrado</td></tr>';
            } else {
                tbody.innerHTML = clients.map(c => {
                    const cpfFormatado = c.cpf ? c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '---';
                    
                    let fotoHtml = '<div class="user-avatar" style="width: 40px; height: 40px; font-size: 14px;"><i class="fas fa-user"></i></div>';
                    if (c.photoBase64) {
                        fotoHtml = `<img src="${c.photoBase64}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" alt="Foto">`;
                    }
                    
                    // Formatar valor do plano
                    const valorPlano = c.planValue ? formatCurrency(c.planValue) : '---';
                    
                    // Formatar data de nascimento
                    let dataNascimentoFormatada = '---';
                    if (c.birthDate) {
                        const [ano, mes, dia] = c.birthDate.split('-');
                        dataNascimentoFormatada = `${dia}/${mes}/${ano}`;
                    }
                    
                    return `
                    <tr>
                        <td data-label="Foto">${fotoHtml}</td>
                        <td data-label="Nome">${c.name || '---'}</td>
                        <td data-label="Nascimento">${dataNascimentoFormatada}</td>
                        <td data-label="CPF">${cpfFormatado}</td>
                        <td data-label="Email">${c.email || '---'}</td>
                        <td data-label="Telefone">${c.phone || '---'}</td>
                        <td data-label="Plano">${c.plan || '---'}</td>
                        <td data-label="Valor">${valorPlano}</td>
                        <td data-label="Cidade">${c.city || '---'}</td>
                        <td data-label="Status"><span class="badge ${c.status === 'active' ? 'active' : 'inactive'}">${c.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                        <td data-label="Ações">
                            <div class="table-actions">
                                <button class="btn-secondary" onclick="editItem('client', '${c.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-danger" onclick="deleteItem('client', '${c.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `}).join('');
            }
            
            // Aplicar filtro de busca se existir
            if (globalSearchTerm) {
                filterClientsTable();
            }
        }
        
        // Recarregar dashboard para atualizar os valores
        loadDashboardData();
        
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

async function loadFilters() {
    try {
        const profSnapshot = await db.collection('professionals')
            .where('userId', '==', currentUserId)
            .where('active', '==', true)
            .get();
            
        const profSelect = document.getElementById('professionalFilter');
        profSelect.innerHTML = '<option value="all">Todos profissionais</option>';
        profSnapshot.forEach(doc => {
            const data = doc.data();
            profSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
        });
        
        const servSnapshot = await db.collection('services')
            .where('userId', '==', currentUserId)
            .where('active', '==', true)
            .get();
            
        const servSelect = document.getElementById('serviceFilter');
        servSelect.innerHTML = '<option value="all">Todos serviços</option>';
        servSnapshot.forEach(doc => {
            const data = doc.data();
            servSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar filtros:', error);
    }
}

function updateProfessionalFilter(professionals) {
    const select = document.getElementById('professionalFilter');
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="all">Todos profissionais</option>';
        professionals.filter(p => p.active).forEach(p => {
            select.innerHTML += `<option value="${p.id}" ${p.id === currentValue ? 'selected' : ''}>${p.name}</option>`;
        });
    }
}

function updateServiceFilter(services) {
    const select = document.getElementById('serviceFilter');
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="all">Todos serviços</option>';
        services.filter(s => s.active).forEach(s => {
            select.innerHTML += `<option value="${s.id}" ${s.id === currentValue ? 'selected' : ''}>${s.name}</option>`;
        });
    }
}

// FUNÇÃO CORRIGIDA - TODOS OS STATUS PADRONIZADOS
async function updateAppointmentsList(appointments) {
    const list = document.getElementById('appointmentsList');
    if (!list) return;
    
    if (!appointments || appointments.length === 0) {
        list.innerHTML = `
            <div class="appointment-item" style="justify-content: center; padding: 40px;">
                <div style="text-align: center;">
                    <i class="fas fa-calendar-plus" style="font-size: 48px; color: var(--text-muted);"></i>
                    <p style="color: var(--text-muted); margin-top: 16px;">Nenhum agendamento encontrado</p>
                    <button class="btn-primary" onclick="openModal('appointment')" style="margin-top: 16px;">
                        <i class="fas fa-plus"></i> Criar agendamento
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments
        .filter(a => a.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        list.innerHTML = `
            <div class="appointment-item" style="justify-content: center; padding: 20px;">
                <p style="color: var(--text-muted);">Nenhum agendamento futuro</p>
            </div>
        `;
        return;
    }
    
    const items = await Promise.all(upcoming.map(async a => {
        const client = await getClientName(a.clientId);
        const service = await getServiceName(a.serviceId);
        const professional = await getProfessionalName(a.professionalId);
        
        const initials = (client || 'C').substring(0, 2).toUpperCase();
        const dateObj = new Date(a.date + 'T12:00:00');
        const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        // PADRONIZAÇÃO DOS STATUS
        let statusClass = 'pending';
        let statusText = 'Pendente';
        
        if (a.status === 'confirmed') {
            statusClass = 'confirmed';
            statusText = 'Confirmado';
        } else if (a.status === 'attended') {
            statusClass = 'attended'; // Cliente COMPARECEU - VERDE
            statusText = 'Compareceu';
        } else if (a.status === 'absent') {
            statusClass = 'absent'; // Cliente FALTOU - VERMELHO
            statusText = 'Faltou';
        } else if (a.status === 'cancelled') {
            statusClass = 'cancelled'; // Cancelado - CINZA
            statusText = 'Cancelado';
        } else if (a.status === 'pending') {
            statusClass = 'pending'; // Pendente - LARANJA
            statusText = 'Pendente';
        }
        
        return `
            <div class="appointment-item">
                <div class="appointment-time">${formattedDate}<br><small>${a.time || '--:--'}</small></div>
                <div class="appointment-avatar">${initials}</div>
                <div class="appointment-info">
                    <div class="appointment-name">${client || 'Cliente'}</div>
                    <div class="appointment-service">
                        <i class="fas fa-cut"></i> ${service || 'Serviço'}
                        <i class="fas fa-user-md" style="margin-left: 8px;"></i> ${professional || 'Profissional'}
                    </div>
                </div>
                <div class="appointment-status status-${statusClass}">
                    ${statusText}
                </div>
                <div class="appointment-actions">
                    ${a.date === today || a.date < today ? `
                        <button class="action-btn attended" onclick="updateAppointmentStatus('${a.id}', 'attended')" title="Compareceu">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button class="action-btn absent" onclick="updateAppointmentStatus('${a.id}', 'absent')" title="Faltou">
                            <i class="fas fa-times-circle"></i>
                        </button>
                    ` : `
                        <button class="action-btn confirm" onclick="updateAppointmentStatus('${a.id}', 'confirmed')" title="Confirmar">
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                    <button class="action-btn cancel" onclick="updateAppointmentStatus('${a.id}', 'cancelled')" title="Cancelar">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="action-btn" onclick="editItem('appointment', '${a.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }));
    
    list.innerHTML = items.join('');
}

async function getClientName(clientId) {
    if (!clientId) return 'Cliente';
    try {
        const doc = await db.collection('clients').doc(clientId).get();
        return doc.exists ? doc.data().name : 'Cliente';
    } catch {
        return 'Cliente';
    }
}

async function getServiceName(serviceId) {
    if (!serviceId) return 'Serviço';
    try {
        const doc = await db.collection('services').doc(serviceId).get();
        return doc.exists ? doc.data().name : 'Serviço';
    } catch {
        return 'Serviço';
    }
}

async function getProfessionalName(professionalId) {
    if (!professionalId) return 'Profissional';
    try {
        const doc = await db.collection('professionals').doc(professionalId).get();
        return doc.exists ? doc.data().name : 'Profissional';
    } catch {
        return 'Profissional';
    }
}

// FUNÇÃO DE GRÁFICO ATUALIZADA - MOSTRA COMPARECIMENTOS VS FALTAS
function updateCharts(appointments) {
    const last7Days = [];
    const categories = [];
    const attendedData = [];
    const absentData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        categories.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
        
        // Filtrar agendamentos do dia
        const dayAppointments = appointments.filter(a => a.date === dateStr);
        
        // Contar comparecimentos (attended) e faltas (absent)
        const attended = dayAppointments.filter(a => a.status === 'attended').length;
        const absent = dayAppointments.filter(a => a.status === 'absent').length;
        
        attendedData.push(attended);
        absentData.push(absent);
    }
    
    if (appointmentsChart) {
        appointmentsChart.updateOptions({ 
            xaxis: { categories },
            colors: ['#22c55e', '#ef4444'] // Verde para comparecimentos, Vermelho para faltas
        });
        appointmentsChart.updateSeries([
            { 
                name: 'Compareceram',
                data: attendedData 
            },
            { 
                name: 'Faltaram',
                data: absentData 
            }
        ]);
    }
}

function updateUserInterface(user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'Admin';
    document.getElementById('userNameDisplay').textContent = displayName;
    
    let initials = displayName.substring(0, 2).toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
}

// ============================================
// FUNÇÕES DO CALENDÁRIO
// ============================================
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        initialView: window.innerWidth <= 768 ? 'timeGridDay' : 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: window.innerWidth <= 768 ? 'timeGridDay,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },
        events: loadCalendarEvents,
        eventClick: function(info) {
            showAppointmentDetails(info.event);
        },
        dateClick: function(info) {
            openModal('appointment', info.dateStr);
        },
        editable: true,
        eventDrop: function(info) {
            updateAppointmentDate(info.event.id, info.event.start);
        },
        eventDidMount: function(info) {
            const props = info.event.extendedProps;
            const startTime = info.event.start ? info.event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : props.time;
            const endTime = info.event.end ? info.event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : props.endTime;
            
            let statusText = '';
            if (props.status === 'confirmed') statusText = 'Confirmado';
            else if (props.status === 'attended') statusText = 'Compareceu';
            else if (props.status === 'absent') statusText = 'Faltou';
            else if (props.status === 'pending') statusText = 'Pendente';
            else if (props.status === 'cancelled') statusText = 'Cancelado';
            
            info.el.setAttribute('title', 
                `👤 Cliente: ${props.clientName}\n` +
                `💇 Serviço: ${props.serviceName}\n` +
                `👨‍⚕️ Profissional: ${props.professionalName}\n` +
                `⏰ Horário: ${startTime} às ${endTime}\n` +
                `💰 Valor: ${formatCurrency(props.servicePrice)}\n` +
                `⏱️ Duração: ${props.serviceDuration} min\n` +
                `📝 Status: ${statusText}`
            );
        }
    });
    
    calendar.render();
}

// FUNÇÃO PARA USAR O ÍNDICE CRIADO
async function loadCalendarEvents(fetchInfo, successCallback, failureCallback) {
    if (!currentUserId) {
        console.log('❌ Usuário não logado');
        return;
    }
    
    try {
        console.log('📅 Carregando eventos de:', fetchInfo.startStr, 'até', fetchInfo.endStr);
        
        const snapshot = await db.collection('appointments')
            .where('userId', '==', currentUserId)
            .where('date', '>=', fetchInfo.startStr.split('T')[0])
            .where('date', '<=', fetchInfo.endStr.split('T')[0])
            .orderBy('date', 'asc')
            .orderBy('time', 'asc')
            .get();
        
        console.log('✅ Agendamentos encontrados:', snapshot.size);
        
        const events = [];
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            // Buscar nome do cliente
            let clientName = 'Cliente';
            if (data.clientId) {
                try {
                    const clientDoc = await db.collection('clients').doc(data.clientId).get();
                    if (clientDoc.exists) {
                        clientName = clientDoc.data().name || 'Cliente';
                    }
                } catch (e) {
                    console.warn('Erro ao buscar cliente:', e);
                }
            }
            
            // Buscar dados do serviço
            let serviceName = 'Serviço';
            let serviceDuration = 60;
            let servicePrice = 0;
            
            if (data.serviceId) {
                try {
                    const serviceDoc = await db.collection('services').doc(data.serviceId).get();
                    if (serviceDoc.exists) {
                        const serviceData = serviceDoc.data();
                        serviceName = serviceData.name || 'Serviço';
                        serviceDuration = serviceData.duration || 60;
                        servicePrice = serviceData.price || 0;
                    }
                } catch (e) {
                    console.warn('Erro ao buscar serviço:', e);
                }
            }
            
            // Buscar nome do profissional
            let professionalName = 'Profissional';
            if (data.professionalId) {
                try {
                    const profDoc = await db.collection('professionals').doc(data.professionalId).get();
                    if (profDoc.exists) {
                        professionalName = profDoc.data().name || 'Profissional';
                    }
                } catch (e) {
                    console.warn('Erro ao buscar profissional:', e);
                }
            }
            
            // Calcular horário de término
            const startTime = data.time || '09:00';
            let endTime = startTime;
            
            if (serviceDuration) {
                const [hours, minutes] = startTime.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes + serviceDuration;
                const endHours = Math.floor(totalMinutes / 60);
                const endMinutes = totalMinutes % 60;
                endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
            }
            
            // Definir cor baseada no status - PADRONIZADO
            let backgroundColor = '#10b981'; // confirmed
            let borderColor = '#059669';
            
            if (data.status === 'pending') {
                backgroundColor = '#f59e0b'; // Laranja
                borderColor = '#d97706';
            } else if (data.status === 'attended') {
                backgroundColor = '#22c55e'; // Verde mais vivo para COMPARECEU
                borderColor = '#16a34a';
            } else if (data.status === 'absent') {
                backgroundColor = '#ef4444'; // Vermelho para FALTOU
                borderColor = '#dc2626';
            } else if (data.status === 'cancelled') {
                backgroundColor = '#6b7280'; // Cinza para Cancelado
                borderColor = '#4b5563';
            }
            
            const title = `${startTime} - ${clientName}`;
            
            events.push({
                id: doc.id,
                title: title,
                start: data.date + 'T' + startTime + ':00',
                end: data.date + 'T' + endTime + ':00',
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                textColor: '#ffffff',
                extendedProps: {
                    clientName: clientName,
                    serviceName: serviceName,
                    professionalName: professionalName,
                    servicePrice: servicePrice,
                    serviceDuration: serviceDuration,
                    status: data.status,
                    notes: data.notes || '',
                    date: data.date,
                    time: data.time,
                    endTime: endTime
                }
            });
        }
        
        console.log('🎉 Eventos gerados:', events.length);
        successCallback(events);
        
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        
        // Fallback
        if (error.code === 'failed-precondition') {
            console.log('⚠️ Usando fallback...');
            
            try {
                const fallbackSnapshot = await db.collection('appointments')
                    .where('userId', '==', currentUserId)
                    .get();
                
                const events = [];
                const startStr = fetchInfo.startStr.split('T')[0];
                const endStr = fetchInfo.endStr.split('T')[0];
                
                for (const doc of fallbackSnapshot.docs) {
                    const data = doc.data();
                    
                    if (data.date < startStr || data.date > endStr) {
                        continue;
                    }
                    
                    const clientName = await getClientName(data.clientId);
                    
                    let backgroundColor = '#10b981';
                    if (data.status === 'pending') backgroundColor = '#f59e0b';
                    else if (data.status === 'attended') backgroundColor = '#22c55e';
                    else if (data.status === 'absent') backgroundColor = '#ef4444';
                    else if (data.status === 'cancelled') backgroundColor = '#6b7280';
                    
                    events.push({
                        id: doc.id,
                        title: `${data.time || '09:00'} - ${clientName}`,
                        start: data.date + 'T' + (data.time || '09:00') + ':00',
                        end: data.date + 'T' + (await calculateEndTime(data.time, data.serviceId) || '10:00') + ':00',
                        backgroundColor: backgroundColor,
                        borderColor: backgroundColor,
                        textColor: '#ffffff',
                        extendedProps: {
                            clientName: clientName,
                            serviceName: await getServiceName(data.serviceId),
                            professionalName: await getProfessionalName(data.professionalId),
                            status: data.status
                        }
                    });
                }
                
                successCallback(events);
            } catch (fallbackError) {
                console.error('Fallback também falhou:', fallbackError);
                failureCallback(fallbackError);
            }
        } else {
            failureCallback(error);
        }
    }
}

// Função para mostrar detalhes completos do agendamento
function showAppointmentDetails(event) {
    const props = event.extendedProps;
    const startTime = event.start ? event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : props.time;
    const endTime = event.end ? event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : props.endTime;
    
    let statusText = '';
    let statusColor = '';
    let statusBg = '';
    
    if (props.status === 'confirmed') {
        statusText = '✅ Confirmado';
        statusColor = '#10b981';
        statusBg = '#10b98120';
    } else if (props.status === 'attended') {
        statusText = '✅ Compareceu';
        statusColor = '#22c55e';
        statusBg = '#22c55e20';
    } else if (props.status === 'absent') {
        statusText = '❌ Faltou';
        statusColor = '#ef4444';
        statusBg = '#ef444420';
    } else if (props.status === 'pending') {
        statusText = '⏳ Pendente';
        statusColor = '#f59e0b';
        statusBg = '#f59e0b20';
    } else if (props.status === 'cancelled') {
        statusText = '❌ Cancelado';
        statusColor = '#6b7280';
        statusBg = '#6b728020';
    }
    
    const detailsHTML = `
        <div class="modal" id="appointmentDetailsModal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <h2 style="margin-bottom: 20px; color: var(--accent-primary);">
                    <i class="fas fa-calendar-check"></i> Detalhes do Agendamento
                </h2>
                
                <div style="margin-bottom: 20px;">
                    <!-- Cliente -->
                    <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 40px; background: var(--accent-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <i class="fas fa-user" style="color: white;"></i>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--text-tertiary);">Cliente</div>
                                <div style="font-size: 18px; font-weight: 600;">${props.clientName}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Serviço e Profissional -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-cut"></i> Serviço
                            </div>
                            <div style="font-weight: 600;">${props.serviceName}</div>
                        </div>
                        
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-user-md"></i> Profissional
                            </div>
                            <div style="font-weight: 600;">${props.professionalName}</div>
                        </div>
                    </div>
                    
                    <!-- Horário e Valor -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-clock"></i> Horário
                            </div>
                            <div style="font-weight: 600;">${startTime} às ${endTime}</div>
                        </div>
                        
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-dollar-sign"></i> Valor
                            </div>
                            <div style="font-weight: 600;">${formatCurrency(props.servicePrice)}</div>
                        </div>
                    </div>
                    
                    <!-- Duração e Status -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-hourglass-half"></i> Duração
                            </div>
                            <div style="font-weight: 600;">${props.serviceDuration} minutos</div>
                        </div>
                        
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-tag"></i> Status
                            </div>
                            <div>
                                <span class="badge" style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 20px; border: 1px solid ${statusColor};">
                                    ${statusText}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Observações -->
                    ${props.notes ? `
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px; margin-bottom: 15px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-comment"></i> Observações
                            </div>
                            <div>${props.notes}</div>
                        </div>
                    ` : ''}
                    
                    <!-- Data -->
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                            <i class="fas fa-calendar-day"></i> Data
                        </div>
                        <div style="font-weight: 600;">${new Date(props.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
                
                <!-- Botões de ação -->
                <div class="modal-actions" style="justify-content: space-between;">
                    <div>
                        <button class="btn-secondary" onclick="editItem('appointment', '${event.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-danger" onclick="deleteItem('appointment', '${event.id}')" style="margin-left: 10px;">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                    <button class="btn-primary" onclick="closeAppointmentDetails()">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('appointmentDetailsModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', detailsHTML);
}

function closeAppointmentDetails() {
    const modal = document.getElementById('appointmentDetailsModal');
    if (modal) modal.remove();
}

async function calculateEndTime(startTime, serviceId) {
    if (!serviceId || !startTime) return '10:00';
    try {
        const service = await db.collection('services').doc(serviceId).get();
        const duration = service.exists ? service.data().duration || 60 : 60;
        
        const [hours, minutes] = startTime.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(hours, minutes + duration);
        
        return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    } catch {
        return '10:00';
    }
}

// ============================================
// FUNÇÕES DE FOTO
// ============================================
function openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handlePhotoSelect(e);
    input.click();
}

function uploadFromGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handlePhotoSelect(e);
    input.click();
}

function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhotoBase64 = e.target.result;
        
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${currentPhotoBase64}" alt="Preview">`;
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// FUNÇÕES DO MODAL
// ============================================

function openModal(type, date = null) {
    currentModalType = type;
    editingId = null;
    currentPhotoBase64 = null;
    
    const modal = document.getElementById('genericModal');
    const title = document.getElementById('modalTitle');
    const fields = document.getElementById('modalFields');
    const saveBtn = document.getElementById('saveModalBtn');
    
    saveBtn.innerHTML = 'Salvar';
    saveBtn.disabled = false;
    
    title.textContent = type === 'appointment' ? 'Novo Agendamento' :
                       type === 'professional' ? 'Novo Profissional' :
                       type === 'service' ? 'Novo Serviço' : 'Novo Cliente';
    
    if (type === 'appointment') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Cliente</label>
                <select id="modalClientId" class="form-control" required>
                    <option value="">Selecione um cliente</option>
                </select>
            </div>
            <div class="form-group">
                <label>Serviço</label>
                <select id="modalServiceId" class="form-control" required>
                    <option value="">Selecione um serviço</option>
                </select>
            </div>
            <div class="form-group">
                <label>Profissional</label>
                <select id="modalProfessionalId" class="form-control" required>
                    <option value="">Selecione um profissional</option>
                </select>
            </div>
            <div class="form-group">
                <label>Data</label>
                <input type="date" id="modalDate" class="form-control" value="${date || new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Horário</label>
                <input type="time" id="modalTime" class="form-control" value="09:00" required>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea id="modalNotes" class="form-control" rows="3"></textarea>
            </div>
        `;
        
        loadModalSelects();
        
    } else if (type === 'professional') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" id="modalName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Especialidade</label>
                <input type="text" id="modalSpecialty" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="modalEmail" class="form-control">
            </div>
            <div class="form-group">
                <label>Telefone</label>
                <input type="tel" id="modalPhone" class="form-control">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="modalActive" class="form-control">
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                </select>
            </div>
        `;
    } else if (type === 'service') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Nome</label>
                <input type="text" id="modalName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Duração (minutos)</label>
                <input type="number" id="modalDuration" class="form-control" value="60" required>
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea id="modalDescription" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="modalActive" class="form-control">
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                </select>
            </div>
        `;
    } else if (type === 'client') {
        // ============================================
        // MODAL DE CLIENTE CORRIGIDO - AGORA COM DATA DE NASCIMENTO, PLANO E VALOR
        // ============================================
        fields.innerHTML = `
            <div class="photo-upload-container">
                <div class="photo-preview" id="photoPreview">
                    <i class="fas fa-camera"></i>
                </div>
                <div>
                    <div class="photo-buttons">
                        <button type="button" class="photo-btn" onclick="openCamera()">
                            <i class="fas fa-camera"></i> Tirar Foto
                        </button>
                        <button type="button" class="photo-btn" onclick="uploadFromGallery()">
                            <i class="fas fa-images"></i> Galeria
                        </button>
                    </div>
                    <div class="photo-optional" style="color: var(--text-tertiary); font-size: 11px; margin-top: 5px; text-align: center;">
                        <i class="fas fa-info-circle"></i> Foto opcional (máx. 10MB)
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Nome Completo *</label>
                <input type="text" id="modalName" class="form-control" required placeholder="Digite o nome completo">
            </div>
            
            <div class="form-group">
                <label>CPF *</label>
                <input type="text" id="modalCpf" class="form-control" required placeholder="000.000.000-00" maxlength="14" onkeyup="mascaraCPF(this)">
            </div>
            
            <!-- ============================================ -->
            <!-- NOVO CAMPO: DATA DE NASCIMENTO -->
            <!-- ============================================ -->
            <div class="form-group">
                <label>Data de Nascimento *</label>
                <input type="date" id="modalBirthDate" class="form-control" required max="${new Date().toISOString().split('T')[0]}">
                <small style="color: var(--text-tertiary);">Formato: DD/MM/AAAA</small>
            </div>
            <!-- ============================================ -->
            
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="modalEmail" class="form-control" placeholder="email@exemplo.com">
            </div>
            
            <div class="form-group">
                <label>Número de Telefone *</label>
                <input type="tel" id="modalPhone" class="form-control" required placeholder="(11) 99999-9999" maxlength="15" onkeyup="mascaraTelefone(this)">
            </div>
            
            <!-- ============================================ -->
            <!-- CAMPOS DE PLANO E VALOR -->
            <!-- ============================================ -->
            <div class="form-group">
                <label>Plano do Cliente *</label>
                <select id="modalPlan" class="form-control" required>
                    <option value="">Selecione o plano</option>
                    <option value="MENSAL">MENSAL</option>
                    <option value="TRIMESTRAL">TRIMESTRAL</option>
                    <option value="SEMESTRAL">SEMESTRAL</option>
                    <option value="ANUAL">ANUAL</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Valor do Plano (R$) *</label>
                <input type="text" id="modalPlanValue" class="form-control" required placeholder="0,00" onkeyup="mascaraMoeda(this)" value="0,00">
            </div>
            <!-- ============================================ -->
            
            <div class="form-group">
                <label>Endereço</label>
                <input type="text" id="modalAddress" class="form-control" placeholder="Rua, número">
            </div>
            
            <div class="row-3">
                <div class="form-group">
                    <label>CEP</label>
                    <input type="text" id="modalCep" class="form-control" placeholder="00000-000" maxlength="9" onkeyup="mascaraCEP(this)" onblur="buscarCep()">
                </div>
                <div class="form-group">
                    <label>Bairro</label>
                    <input type="text" id="modalNeighborhood" class="form-control" placeholder="Bairro">
                </div>
                <div class="form-group">
                    <label>Cidade</label>
                    <input type="text" id="modalCity" class="form-control" placeholder="Cidade">
                </div>
            </div>
            
            <div class="form-group">
                <label>Status</label>
                <select id="modalStatus" class="form-control">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                </select>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
}

// ============================================
// FUNÇÃO EDITITEM CORRIGIDA - AGORA COM DATA DE NASCIMENTO, PLANO E VALOR
// ============================================
function editItem(type, id) {
    currentModalType = type;
    editingId = id;
    currentPhotoBase64 = null;
    
    const modal = document.getElementById('genericModal');
    const title = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveModalBtn');
    
    saveBtn.innerHTML = 'Salvar';
    saveBtn.disabled = false;
    
    title.textContent = type === 'appointment' ? 'Editar Agendamento' :
                       type === 'professional' ? 'Editar Profissional' :
                       type === 'service' ? 'Editar Serviço' : 'Editar Cliente';
    
    db.collection(type + 's').doc(id).get().then(async doc => {
        if (!doc.exists) return;
        
        const data = doc.data();
        const fields = document.getElementById('modalFields');
        
        if (type === 'appointment') {
            fields.innerHTML = `
                <div class="form-group">
                    <label>Cliente</label>
                    <select id="modalClientId" class="form-control" required>
                        <option value="${data.clientId}">Carregando...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Serviço</label>
                    <select id="modalServiceId" class="form-control" required>
                        <option value="${data.serviceId}">Carregando...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Profissional</label>
                    <select id="modalProfessionalId" class="form-control" required>
                        <option value="${data.professionalId}">Carregando...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Data</label>
                    <input type="date" id="modalDate" class="form-control" value="${data.date}" required>
                </div>
                <div class="form-group">
                    <label>Horário</label>
                    <input type="time" id="modalTime" class="form-control" value="${data.time}" required>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="modalNotes" class="form-control" rows="3">${data.notes || ''}</textarea>
                </div>
            `;
            loadModalSelects(data);
            
        } else if (type === 'professional') {
            fields.innerHTML = `
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" id="modalName" class="form-control" value="${data.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Especialidade</label>
                    <input type="text" id="modalSpecialty" class="form-control" value="${data.specialty || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="modalEmail" class="form-control" value="${data.email || ''}">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" id="modalPhone" class="form-control" value="${data.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="modalActive" class="form-control">
                        <option value="true" ${data.active ? 'selected' : ''}>Ativo</option>
                        <option value="false" ${!data.active ? 'selected' : ''}>Inativo</option>
                    </select>
                </div>
            `;
        } else if (type === 'service') {
            fields.innerHTML = `
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" id="modalName" class="form-control" value="${data.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Duração (minutos)</label>
                    <input type="number" id="modalDuration" class="form-control" value="${data.duration || 60}" required>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="modalDescription" class="form-control" rows="3">${data.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="modalActive" class="form-control">
                        <option value="true" ${data.active ? 'selected' : ''}>Ativo</option>
                        <option value="false" ${!data.active ? 'selected' : ''}>Inativo</option>
                    </select>
                </div>
            `;
        } else if (type === 'client') {
            const cpfFormatado = data.cpf ? data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';
            
            // Formatar valor do plano para exibição
            let valorFormatado = '0,00';
            if (data.planValue) {
                valorFormatado = data.planValue.toFixed(2).replace('.', ',');
                valorFormatado = valorFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            }
            
            let photoHtml = '<i class="fas fa-camera"></i>';
            if (data.photoBase64) {
                photoHtml = `<img src="${data.photoBase64}" alt="Foto">`;
            }
            
            fields.innerHTML = `
                <div class="photo-upload-container">
                    <div class="photo-preview" id="photoPreview">
                        ${photoHtml}
                    </div>
                    <div>
                        <div class="photo-buttons">
                            <button type="button" class="photo-btn" onclick="openCamera()">
                                <i class="fas fa-camera"></i> Tirar Foto
                            </button>
                            <button type="button" class="photo-btn" onclick="uploadFromGallery()">
                                <i class="fas fa-images"></i> Galeria
                            </button>
                        </div>
                        <div class="photo-optional" style="color: var(--text-tertiary); font-size: 11px; margin-top: 5px; text-align: center;">
                            <i class="fas fa-info-circle"></i> Foto opcional (máx. 10MB)
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Nome Completo *</label>
                    <input type="text" id="modalName" class="form-control" value="${data.name || ''}" required>
                </div>
                
                <div class="form-group">
                    <label>CPF *</label>
                    <input type="text" id="modalCpf" class="form-control" value="${cpfFormatado}" required maxlength="14" onkeyup="mascaraCPF(this)">
                </div>
                
                <!-- ============================================ -->
                <!-- CAMPO DE DATA DE NASCIMENTO NA EDIÇÃO -->
                <!-- ============================================ -->
                <div class="form-group">
                    <label>Data de Nascimento *</label>
                    <input type="date" id="modalBirthDate" class="form-control" value="${data.birthDate || ''}" required max="${new Date().toISOString().split('T')[0]}">
                </div>
                <!-- ============================================ -->
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="modalEmail" class="form-control" value="${data.email || ''}">
                </div>
                
                <div class="form-group">
                    <label>Número de Telefone *</label>
                    <input type="tel" id="modalPhone" class="form-control" value="${data.phone || ''}" required maxlength="15" onkeyup="mascaraTelefone(this)">
                </div>
                
                <!-- ============================================ -->
                <!-- CAMPOS DE PLANO E VALOR NA EDIÇÃO -->
                <!-- ============================================ -->
                <div class="form-group">
                    <label>Plano do Cliente *</label>
                    <select id="modalPlan" class="form-control" required>
                        <option value="">Selecione o plano</option>
                        <option value="MENSAL" ${data.plan === 'MENSAL' ? 'selected' : ''}>MENSAL</option>
                        <option value="TRIMESTRAL" ${data.plan === 'TRIMESTRAL' ? 'selected' : ''}>TRIMESTRAL</option>
                        <option value="SEMESTRAL" ${data.plan === 'SEMESTRAL' ? 'selected' : ''}>SEMESTRAL</option>
                        <option value="ANUAL" ${data.plan === 'ANUAL' ? 'selected' : ''}>ANUAL</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Valor do Plano (R$) *</label>
                    <input type="text" id="modalPlanValue" class="form-control" required value="${valorFormatado}" onkeyup="mascaraMoeda(this)">
                </div>
                <!-- ============================================ -->
                
                <div class="form-group">
                    <label>Endereço</label>
                    <input type="text" id="modalAddress" class="form-control" value="${data.address || ''}">
                </div>
                
                <div class="row-3">
                    <div class="form-group">
                        <label>CEP</label>
                        <input type="text" id="modalCep" class="form-control" value="${data.cep || ''}" maxlength="9" onkeyup="mascaraCEP(this)" onblur="buscarCep()">
                    </div>
                    <div class="form-group">
                        <label>Bairro</label>
                        <input type="text" id="modalNeighborhood" class="form-control" value="${data.neighborhood || ''}">
                    </div>
                    <div class="form-group">
                        <label>Cidade</label>
                        <input type="text" id="modalCity" class="form-control" value="${data.city || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Status</label>
                    <select id="modalStatus" class="form-control">
                        <option value="active" ${data.status === 'active' ? 'selected' : ''}>Ativo</option>
                        <option value="inactive" ${data.status !== 'active' ? 'selected' : ''}>Inativo</option>
                    </select>
                </div>
            `;
            
            currentPhotoBase64 = data.photoBase64 || null;
        }
    });
    
    modal.style.display = 'flex';
}

// ============================================
// FUNÇÃO MASCARA MOEDA (NOVA)
// ============================================
function mascaraMoeda(input) {
    let v = input.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = v;
}

function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = v;
}

function mascaraCEP(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = v;
}

async function buscarCep() {
    const cep = document.getElementById('modalCep')?.value.replace(/\D/g, '');
    if (cep && cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('modalAddress').value = data.logradouro || '';
                document.getElementById('modalNeighborhood').value = data.bairro || '';
                document.getElementById('modalCity').value = data.localidade || '';
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }
}

// ============================================
// FUNÇÃO LOADMODALSELECTS CORRIGIDA - ORDEM ALFABÉTICA
// ============================================
async function loadModalSelects(selected = {}) {
    if (!currentUserId) return;
    
    try {
        const clientsSnap = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .where('status', '==', 'active')
            .get();
            
        const clientSelect = document.getElementById('modalClientId');
        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
            const clients = [];
            clientsSnap.forEach(doc => {
                clients.push({ id: doc.id, ...doc.data() });
            });
            
            // ORDENAR CLIENTES POR NOME
            clients.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            
            clients.forEach(client => {
                clientSelect.innerHTML += `<option value="${client.id}" ${client.id === selected.clientId ? 'selected' : ''}>${client.name}</option>`;
            });
        }
        
        const servicesSnap = await db.collection('services')
            .where('userId', '==', currentUserId)
            .where('active', '==', true)
            .get();
            
        const serviceSelect = document.getElementById('modalServiceId');
        if (serviceSelect) {
            serviceSelect.innerHTML = '<option value="">Selecione um serviço</option>';
            const services = [];
            servicesSnap.forEach(doc => {
                services.push({ id: doc.id, ...doc.data() });
            });
            
            // ORDENAR SERVIÇOS POR NOME
            services.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            
            services.forEach(service => {
                serviceSelect.innerHTML += `<option value="${service.id}" ${service.id === selected.serviceId ? 'selected' : ''}>${service.name}</option>`;
            });
        }
        
        const profSnap = await db.collection('professionals')
            .where('userId', '==', currentUserId)
            .where('active', '==', true)
            .get();
            
        const profSelect = document.getElementById('modalProfessionalId');
        if (profSelect) {
            profSelect.innerHTML = '<option value="">Selecione um profissional</option>';
            const professionals = [];
            profSnap.forEach(doc => {
                professionals.push({ id: doc.id, ...doc.data() });
            });
            
            // ORDENAR PROFISSIONAIS POR NOME
            professionals.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            
            professionals.forEach(prof => {
                profSelect.innerHTML += `<option value="${prof.id}" ${prof.id === selected.professionalId ? 'selected' : ''}>${prof.name} - ${prof.specialty}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar selects:', error);
    }
}

function closeModal() {
    document.getElementById('genericModal').style.display = 'none';
    editingId = null;
    currentModalType = null;
    currentPhotoBase64 = null;
    
    const saveBtn = document.getElementById('saveModalBtn');
    saveBtn.innerHTML = 'Salvar';
    saveBtn.disabled = false;
}

// ============================================
// FUNÇÃO SAVEMODAL CORRIGIDA - AGORA SALVA DATA DE NASCIMENTO, PLANO E VALOR
// ============================================
async function saveModal() {
    if (!currentModalType || !currentUserId) return;
    
    const type = currentModalType;
    let data = {};
    
    const saveBtn = document.getElementById('saveModalBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveBtn.disabled = true;
    
    try {
        if (type === 'appointment') {
            data = {
                userId: currentUserId,
                clientId: document.getElementById('modalClientId')?.value,
                serviceId: document.getElementById('modalServiceId')?.value,
                professionalId: document.getElementById('modalProfessionalId')?.value,
                date: document.getElementById('modalDate')?.value,
                time: document.getElementById('modalTime')?.value,
                notes: document.getElementById('modalNotes')?.value,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            if (!data.clientId || !data.serviceId || !data.professionalId || !data.date || !data.time) {
                throw new Error('Preencha todos os campos obrigatórios');
            }
            
        } else if (type === 'professional') {
            data = {
                userId: currentUserId,
                name: document.getElementById('modalName')?.value,
                specialty: document.getElementById('modalSpecialty')?.value,
                email: document.getElementById('modalEmail')?.value,
                phone: document.getElementById('modalPhone')?.value,
                active: document.getElementById('modalActive')?.value === 'true',
                createdAt: new Date().toISOString()
            };
            
            if (!data.name) {
                throw new Error('Nome é obrigatório');
            }
            
        } else if (type === 'service') {
            data = {
                userId: currentUserId,
                name: document.getElementById('modalName')?.value,
                duration: parseInt(document.getElementById('modalDuration')?.value) || 60,
                description: document.getElementById('modalDescription')?.value,
                active: document.getElementById('modalActive')?.value === 'true',
                createdAt: new Date().toISOString()
            };
            
            if (!data.name) {
                throw new Error('Nome é obrigatório');
            }
            
        } else if (type === 'client') {
            const cpfInput = document.getElementById('modalCpf');
            const phoneInput = document.getElementById('modalPhone');
            const nameInput = document.getElementById('modalName');
            const birthDateInput = document.getElementById('modalBirthDate');
            const planInput = document.getElementById('modalPlan');
            const planValueInput = document.getElementById('modalPlanValue');
            
            if (!cpfInput || !phoneInput || !nameInput || !birthDateInput || !planInput || !planValueInput) {
                throw new Error('Erro ao capturar dados do formulário');
            }
            
            const cpfRaw = cpfInput.value.replace(/\D/g, '');
            const phoneRaw = phoneInput.value.replace(/\D/g, '');
            const name = nameInput.value.trim();
            const birthDate = birthDateInput.value;
            const plan = planInput.value;
            
            // Converter valor da moeda para número
            let planValue = 0;
            if (planValueInput.value) {
                planValue = parseFloat(planValueInput.value.replace(/\./g, '').replace(',', '.'));
            }
            
            if (!name) {
                throw new Error('Nome é obrigatório');
            }
            
            if (!cpfRaw || cpfRaw.length !== 11) {
                throw new Error('CPF inválido. Deve conter 11 dígitos.');
            }
            
            if (!birthDate) {
                throw new Error('Data de nascimento é obrigatória');
            }
            
            if (!phoneRaw) {
                throw new Error('Telefone é obrigatório');
            }
            
            if (!plan) {
                throw new Error('Plano é obrigatório');
            }
            
            if (!planValue || planValue <= 0) {
                throw new Error('Valor do plano inválido');
            }
            
            data = {
                userId: currentUserId,
                name: name,
                cpf: cpfRaw,
                birthDate: birthDate,
                email: document.getElementById('modalEmail')?.value || '',
                phone: phoneRaw,
                plan: plan,
                planValue: planValue,
                address: document.getElementById('modalAddress')?.value || '',
                cep: document.getElementById('modalCep')?.value || '',
                neighborhood: document.getElementById('modalNeighborhood')?.value || '',
                city: document.getElementById('modalCity')?.value || '',
                status: document.getElementById('modalStatus')?.value || 'active',
                totalAppointments: 0,
                updatedAt: new Date().toISOString()
            };
            
            if (currentPhotoBase64) {
                data.photoBase64 = currentPhotoBase64;
            }
            
            if (!editingId) {
                data.createdAt = new Date().toISOString();
            }
        }
        
        if (editingId) {
            await db.collection(type + 's').doc(editingId).update(data);
        } else {
            await db.collection(type + 's').add(data);
        }
        
        closeModal();
        await loadAllData();
        if (calendar) calendar.refetchEvents();
        
        alert(type === 'service' ? 'Serviço salvo com sucesso!' : 'Salvo com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro ao salvar: ' + (error.message || 'Tente novamente'));
        
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// ============================================
// FUNÇÕES DE AÇÃO
// ============================================
async function deleteItem(type, id) {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    
    try {
        await db.collection(type + 's').doc(id).delete();
        alert('Excluído com sucesso!');
        await loadAllData();
        if (calendar) calendar.refetchEvents();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir: ' + error.message);
    }
}

async function updateAppointmentStatus(id, status) {
    try {
        await db.collection('appointments').doc(id).update({ status });
        await loadAllData();
        if (calendar) calendar.refetchEvents();
        
        if (status === 'attended') {
            alert('✅ Cliente marcado como COMPARECEU!');
        } else if (status === 'absent') {
            alert('❌ Cliente marcado como FALTOU!');
        } else if (status === 'cancelled') {
            alert('❌ Agendamento CANCELADO!');
        } else if (status === 'confirmed') {
            alert('✅ Agendamento CONFIRMADO!');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

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

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// ============================================
// FUNÇÕES DE UI
// ============================================
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.getElementById('themeIcon');
    icon.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeIcon').className = 'fas fa-sun';
    }
}

function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const user = document.querySelector('.user');
    if (!user?.contains(e.target) && !dropdown?.contains(e.target)) {
        dropdown?.classList.remove('show');
    }
});

function viewProfile() {
    alert('Perfil do usuário');
    toggleUserDropdown();
}

function viewSettings() {
    document.querySelector('[data-view="settings"]').click();
    toggleUserDropdown();
}

function editSetting(setting) {
    alert('Função em desenvolvimento: ' + setting);
}

function saveSetting(setting, value) {
    console.log('Salvando configuração:', setting, value);
    localStorage.setItem(setting, value);
}

function integrateGoogle() {
    alert('Integração com Google Calendar em desenvolvimento');
}

function setupPayments() {
    alert('Configuração de pagamentos em desenvolvimento');
}

function handlePeriodChange() {
    const customRange = document.getElementById('customDateRange');
    customRange.style.display = document.getElementById('periodFilter').value === 'custom' ? 'flex' : 'none';
    applyFilters();
}

function applyFilters() {
    loadDashboardData();
}

// ============================================
// AUTH STATE
// ============================================
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        currentUserId = user.uid;
        
        document.querySelector('.main').style.display = 'flex';
        document.querySelector('.sidebar').style.display = 'flex';
        
        updateUserInterface(user);
        loadAllData();
        initializeCalendar();
        adjustTablesForMobile();
    } else {
        currentUser = null;
        currentUserId = null;
        
        window.location.href = 'index.html';
    }
});

// ============================================
// LOGOUT
// ============================================
function logout() {
    auth.signOut().then(() => {
        console.log('Logout realizado com sucesso');
    }).catch(error => {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    });
}

// ============================================
// NAVEGAÇÃO
// ============================================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const viewId = this.dataset.view + 'View';
        document.getElementById(viewId).classList.add('active');
        
        const titles = {
            dashboard: 'Dashboard Inteligente',
            calendar: 'Calendário de Agendamentos',
            professionals: 'Gerenciar Profissionais',
            services: 'Gerenciar Serviços',
            clients: 'Gerenciar Clientes',
            settings: 'Configurações do Sistema'
        };
        
        document.querySelector('.page-title h1').textContent = titles[this.dataset.view];
        
        // Aplicar filtro de busca ao mudar de view
        if (globalSearchTerm) {
            setTimeout(() => {
                if (this.dataset.view === 'professionals') {
                    filterProfessionalsTable();
                } else if (this.dataset.view === 'services') {
                    filterServicesTable();
                } else if (this.dataset.view === 'clients') {
                    filterClientsTable();
                }
            }, 100);
        }
        
        if (this.dataset.view === 'calendar' && calendar) {
            setTimeout(() => calendar.render(), 100);
        }
    });
});

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    appointmentsChart = new ApexCharts(document.querySelector("#appointmentsChart"), {
        series: [
            { name: 'Compareceram', data: [] },
            { name: 'Faltaram', data: [] }
        ],
        chart: { 
            type: 'bar', 
            height: 250, 
            toolbar: { show: false },
            animations: { enabled: true },
            stacked: false
        },
        colors: ['#22c55e', '#ef4444'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        grid: { borderColor: 'var(--border-color)' },
        xaxis: {
            categories: [],
            labels: { style: { colors: 'var(--text-tertiary)' } }
        },
        yaxis: {
            labels: { style: { colors: 'var(--text-tertiary)' } },
            title: {
                text: 'Número de alunos',
                style: { color: 'var(--text-tertiary)' }
            }
        },
        tooltip: { 
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val + ' aluno' + (val !== 1 ? 's' : '');
                }
            }
        },
        legend: {
            position: 'top',
            labels: { colors: 'var(--text-primary)' }
        }
    });
    appointmentsChart.render();

    servicesChart = new ApexCharts(document.querySelector("#servicesChart"), {
        series: [],
        chart: { 
            type: 'donut', 
            height: 250,
            animations: { enabled: true }
        },
        colors: ['#7c3aed', '#c026d3', '#22c55e', '#f59e0b'],
        labels: [],
        plotOptions: { 
            pie: { 
                donut: { size: '65%' },
                expandOnClick: true
            } 
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: { theme: 'dark' }
    });
    servicesChart.render();
    
    const today = new Date();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    document.getElementById('startDate').value = lastWeek.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
});

// ============================================
// FUNÇÃO CORRIGIDA - AGORA MOSTRA OS AGENDAMENTOS DE HOJE
// ============================================
async function loadDashboardData() {
    try {
        const professionalFilter = document.getElementById('professionalFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;
        
        console.log('📊 Carregando dashboard com filtros:', { professionalFilter, serviceFilter });
        
        // Buscar TODOS os agendamentos primeiro
        let query = db.collection('appointments')
            .where('userId', '==', currentUserId);
        
        // Aplicar filtros se necessário
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
        
        // ============================================
        // CORREÇÃO AQUI - PEGAR A DATA DE HOJE CORRETAMENTE
        // ============================================
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        console.log('📅 Data de hoje formatada:', todayStr);
        
        // Filtrar agendamentos de hoje
        const todayAppointments = appointments.filter(a => a.date === todayStr);
        console.log('📅 Agendamentos encontrados para hoje:', todayAppointments.length);
        console.log('📅 Detalhes dos agendamentos de hoje:', todayAppointments);
        
        // Calcular faturamento de hoje
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
        
        // ============================================
        // ATUALIZAR O CARD DE AGENDAMENTOS DE HOJE
        // ============================================
        document.getElementById('todayCount').textContent = todayAppointments.length;
        document.getElementById('revenueValue').textContent = formatCurrency(todayRevenue);
        
        console.log('✅ Card atualizado - Hoje:', todayAppointments.length, 'Faturamento:', formatCurrency(todayRevenue));
        
        // ============================================
        // RESTO DO CÓDIGO (faturamento mensal, etc)
        // ============================================
        
        // Buscar todos os clientes ativos
        const clientsSnapshot = await db.collection('clients')
            .where('userId', '==', currentUserId)
            .where('status', '==', 'active')
            .get();
        
        let monthlyRevenue = 0;
        const clientValues = [];
        
        clientsSnapshot.forEach(doc => {
            const client = doc.data();
            if (client.planValue && client.planValue > 0) {
                monthlyRevenue += client.planValue;
                clientValues.push({
                    name: client.name,
                    valor: client.planValue,
                    plano: client.plan
                });
            }
        });
        
        console.log('💰 FATURAMENTO MENSAL REAL (baseado nos planos):', formatCurrency(monthlyRevenue));
        
        // Atualizar card de faturamento mensal
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
                    <div class="stat-label">Faturamento Mensal (Planos)</div>
                    <div class="stat-comparison">
                        <i class="fas fa-users"></i> <span>${clientsSnapshot.size} clientes ativos</span>
                    </div>
                `;
                statsGrid.appendChild(newCard);
            }
        } else {
            const valueElement = document.getElementById('monthlyRevenueValue');
            if (valueElement) {
                valueElement.textContent = formatCurrency(monthlyRevenue);
            }
        }
        
        // Atualizar profissionais ativos
        try {
            const profSnapshot = await db.collection('professionals')
                .where('userId', '==', currentUserId)
                .where('active', '==', true)
                .get();
            document.getElementById('attendanceValue').textContent = profSnapshot.size;
        } catch (e) {
            console.warn('Erro ao carregar profissionais:', e);
        }
        
        // Atualizar clientes ativos
        document.getElementById('clientsValue').textContent = clientsSnapshot.size;
        
        // Atualizar lista de agendamentos e gráficos
        updateAppointmentsList(appointments);
        updateCharts(appointments);
        updatePlansChart(clientsSnapshot);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// ============================================
// FUNÇÃO PARA CRIAR NOVO AGENDAMENTO
// ============================================
async function saveAppointment(appointmentData) {
    try {
        // 1. Salvar no Firebase
        const docRef = await db.collection('appointments').add({
            ...appointmentData,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        });
        
        console.log('✅ Agendamento salvo:', docRef.id);
        
        // 2. VERIFICAR NOTIFICAÇÕES ATIVAS
        const settings = JSON.parse(localStorage.getItem('nexbook_settings')) || {};
        
        // 3. ENVIAR WHATSAPP (se ativado) - VERSÃO SIMULADA
        if (settings.whatsappNotifications) {
            await sendWhatsAppReminder({
                to: appointmentData.clientPhone,
                dateTime: appointmentData.dateTime,
                clientName: appointmentData.clientName,
                service: appointmentData.service
            });
        }
        
        // 4. ENVIAR SMS (se ativado)
        if (settings.smsNotifications) {
            await sendSMSReminder({
                to: appointmentData.clientPhone,
                dateTime: appointmentData.dateTime,
                clientName: appointmentData.clientName
            });
        }
        
        // 5. ENVIAR EMAIL (se ativado)
        if (settings.emailNotifications) {
            await sendEmailReminder({
                to: appointmentData.clientEmail,
                dateTime: appointmentData.dateTime,
                clientName: appointmentData.clientName,
                service: appointmentData.service
            });
        }
        
        return { success: true, id: docRef.id };
        
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        return { success: false, error };
    }
}

// ============================================
// ENVIAR WHATSAPP - VERSÃO SIMULADA (SEM API)
// ============================================
async function sendWhatsAppReminder(data) {
    try {
        const { to, dateTime, clientName, service } = data;
        
        console.log('📱 Preparando WhatsApp:', { to, dateTime, clientName, service });
        
        // Validar dados
        if (!to || !dateTime) {
            console.error('❌ Dados incompletos');
            return { success: false, error: 'Dados incompletos' };
        }
        
        // Formatar data (ex: 3/2)
        const date = new Date(dateTime);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        
        // Formatar hora (ex: 3:30pm)
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedTime = minutes > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}${ampm}`
            : `${hours}${ampm}`;
        
        // Mensagem formatada
        const mensagem = `Sua nomeação está chegando em ${formattedDate} às ${formattedTime}`;
        
        console.log('📱 WhatsApp formatado:', {
            para: to,
            data: formattedDate,
            hora: formattedTime,
            mensagem: mensagem
        });
        
        // MOSTRAR ALERTA VISUAL (para teste)
        alert(`📱 WHATSAPP SIMULADO\n\nPara: ${to}\nMensagem: ${mensagem}`);
        
        // SALVAR NO LOCALSTORAGE (para histórico)
        const historico = JSON.parse(localStorage.getItem('whatsapp_enviados') || '[]');
        historico.push({
            to,
            date: formattedDate,
            time: formattedTime,
            clientName,
            service,
            mensagem,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('whatsapp_enviados', JSON.stringify(historico));
        
        console.log('✅ WhatsApp simulado com sucesso!');
        return { success: true, simulated: true };
        
    } catch (error) {
        console.error('❌ Erro ao processar WhatsApp:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// FUNÇÕES DE EMAIL E SMS (placeholders)
// ============================================
async function sendEmailReminder(data) {
    console.log('📧 Email:', data);
    // Implementar com SendGrid depois
}

async function sendSMSReminder(data) {
    console.log('📱 SMS:', data);
    // Implementar com Twilio SMS depois
}

// ============================================
// VERIFICAR SE USUÁRIO TEM PLANO ATIVO
// ============================================
async function checkUserPlan() {
    if (!currentUserId) return;
    
    const userDoc = await db.collection('users').doc(currentUserId).get();
    const userData = userDoc.data();
    
    // Verificar se é período de teste (7 dias)
    const dataCriacao = new Date(userData.createdAt);
    const diasTeste = 7;
    const dataExpiracaoTeste = new Date(dataCriacao.getTime() + diasTeste * 24 * 60 * 60 * 1000);
    const hoje = new Date();
    
    if (!userData.plano && hoje > dataExpiracaoTeste) {
        // Período de teste expirou - redirecionar para planos
        window.location.href = 'planos.html';
        return false;
    }
    
    // Verificar se plano está ativo
    if (userData.plano && userData.dataExpiracao) {
        const expiracao = new Date(userData.dataExpiracao);
        if (hoje > expiracao) {
            // Plano expirou
            window.location.href = 'planos.html?expired=true';
            return false;
        }
    }
    
    return true;
}

// Chamar no auth.onAuthStateChanged
auth.onAuthStateChanged(async user => {
    if (user) {
        currentUser = user;
        currentUserId = user.uid;
        
        const temAcesso = await checkUserPlan();
        if (temAcesso) {
            document.querySelector('.main').style.display = 'flex';
            document.querySelector('.sidebar').style.display = 'flex';
            updateUserInterface(user);
            loadAllData();
            initializeCalendar();
        }
    } else {
        window.location.href = 'index.html';
    }
});

// Função para verificar recursos disponíveis
function hasFeature(feature) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const planFeatures = {
        basico: ['agendamentos', 'dashboard', 'clientes'],
        profissional: ['agendamentos', 'dashboard', 'clientes', 'whatsapp', 'assistencia'],
        premium: ['agendamentos', 'dashboard', 'clientes', 'whatsapp', 'relatorios', 'vip']
    };
    
    return planFeatures[user.plano]?.includes(feature) || false;
}

// Usar nos recursos
if (hasFeature('whatsapp')) {
    // Mostrar opção de WhatsApp
    document.getElementById('whatsappNotifications').disabled = false;
} else {
    document.getElementById('whatsappNotifications').disabled = true;
}