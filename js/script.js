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
let reportsLineChart, reportsPieChart, reportsBarChart;
let editingId = null;
let currentModalType = null;
let currentPhotoBase64 = null;
let isMobileSidebarOpen = false;
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
// FUNÇÕES DE BUSCA GLOBAL
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
    } else if (activeView === 'reportsView') {
        filterReportClients();
    } else {
        loadAllData();
    }
}

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
            const cpf = row.cells[3]?.textContent.toLowerCase() || '';
            const email = row.cells[4]?.textContent.toLowerCase() || '';
            const telefone = row.cells[5]?.textContent.toLowerCase() || '';
            const plano = row.cells[6]?.textContent.toLowerCase() || '';
            const origem = row.cells[7]?.textContent.toLowerCase() || '';
            const startDate = row.cells[9]?.textContent.toLowerCase() || '';
            const cidade = row.cells[10]?.textContent.toLowerCase() || '';
            
            const matches = nome.includes(globalSearchTerm) || 
                           cpf.includes(globalSearchTerm) || 
                           email.includes(globalSearchTerm) || 
                           telefone.includes(globalSearchTerm) ||
                           plano.includes(globalSearchTerm) ||
                           origem.includes(globalSearchTerm) ||
                           startDate.includes(globalSearchTerm) ||
                           cidade.includes(globalSearchTerm);
            
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        }
    });
    
    const tbody = document.getElementById('clientsList');
    if (visibleCount === 0 && rows.length > 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.id = 'noResultsRow';
        noResultsRow.innerHTML = '<td colspan="13" style="text-align: center; padding: 20px;">Nenhum cliente encontrado com o termo "' + globalSearchTerm + '"</td>';
        
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
        tbody.appendChild(noResultsRow);
    } else {
        const oldNoResults = document.getElementById('noResultsRow');
        if (oldNoResults) oldNoResults.remove();
    }
}

function filterReportClients() {
    const searchInput = document.getElementById('reportClientSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const rows = document.querySelectorAll('#reportClientsList tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        if (row.cells && row.cells.length > 0) {
            const nome = row.cells[0]?.textContent.toLowerCase() || '';
            const plano = row.cells[1]?.textContent.toLowerCase() || '';
            const origem = row.cells[2]?.textContent.toLowerCase() || '';
            
            const matches = nome.includes(searchTerm) || 
                           plano.includes(searchTerm) || 
                           origem.includes(searchTerm);
            
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        }
    });
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
// FUNÇÃO LOADDASHBOARDDATA
// ============================================
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
        
        console.log('💰 FATURAMENTO MENSAL REAL:', formatCurrency(monthlyRevenue));
        
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
                let tooltipText = 'Detalhamento dos planos:\n';
                clientValues.forEach(c => {
                    tooltipText += `${c.name} (${c.plano}): ${formatCurrency(c.valor)}\n`;
                });
                valueElement.title = tooltipText;
            }
        }
        
        const projectedRevenue = monthlyRevenue * 12;
        
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
        
        try {
            const profSnapshot = await db.collection('professionals')
                .where('userId', '==', currentUserId)
                .where('active', '==', true)
                .get();
            document.getElementById('attendanceValue').textContent = profSnapshot.size;
        } catch (e) {
            console.warn('Erro ao carregar profissionais:', e);
        }
        
        document.getElementById('clientsValue').textContent = clientsSnapshot.size;
        document.getElementById('todayCount').textContent = todayAppointments.length;
        document.getElementById('revenueValue').textContent = formatCurrency(todayRevenue);
        
        updateAppointmentsList(appointments);
        updateCharts(appointments);
        updatePlansChart(clientsSnapshot);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// ============================================
// GRÁFICO DE DISTRIBUIÇÃO DE PLANOS
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
        colors: ['#D91828', '#D91414', '#8C0D0D', '#591218']
    });
    servicesChart.updateSeries(planData);
    
    console.log('📊 Distribuição de planos:', planCounts);
}

// ============================================
// FUNÇÃO LOADPROFESSIONALS
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
// FUNÇÃO LOADSERVICES
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
// FUNÇÃO LOADCLIENTS - CORRIGIDA COM DATA DE INÍCIO
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
        
        clients.sort((a, b) => {
            const nomeA = (a.name || '').toLowerCase();
            const nomeB = (b.name || '').toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
        
        document.getElementById('clientsValue').textContent = clients.filter(c => c.status === 'active').length;
        
        const tbody = document.getElementById('clientsList');
        if (tbody) {
            if (clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="13" style="text-align: center;">Nenhum cliente cadastrado</td></tr>';
            } else {
                tbody.innerHTML = clients.map(c => {
                    const cpfFormatado = c.cpf ? c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '---';
                    
                    let fotoHtml = '<div class="user-avatar" style="width: 40px; height: 40px; font-size: 14px;"><i class="fas fa-user"></i></div>';
                    if (c.photoBase64) {
                        fotoHtml = `<img src="${c.photoBase64}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" alt="Foto">`;
                    }
                    
                    const valorPlano = c.planValue ? formatCurrency(c.planValue) : '---';
                    const origem = c.origin || 'Direto';
                    const origemClass = origem === 'Total Pass' ? 'badge-totalpass' : (origem === 'Well Hub' ? 'badge-wellhub' : '');
                    
                    let dataNascimentoFormatada = '---';
                    if (c.birthDate) {
                        const [ano, mes, dia] = c.birthDate.split('-');
                        dataNascimentoFormatada = `${dia}/${mes}/${ano}`;
                    }
                    
                    let dataInicioFormatada = '---';
                    if (c.startDate) {
                        const [ano, mes, dia] = c.startDate.split('-');
                        dataInicioFormatada = `${dia}/${mes}/${ano}`;
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
                        <td data-label="Origem"><span class="badge ${origemClass}">${origem}</span></td>
                        <td data-label="Valor">${valorPlano}</td>
                        <td data-label="Data Início"><span class="start-date-badge"><i class="fas fa-calendar-alt"></i> ${dataInicioFormatada}</span></td>
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
                                <button class="btn-secondary" onclick="generateClientReport('${c.id}')">
                                    <i class="fas fa-file-pdf"></i> Relatório
                                </button>
                            </div>
                        </td>
                    </tr>
                `}).join('');
            }
            
            if (globalSearchTerm) {
                filterClientsTable();
            }
        }
        
        loadDashboardData();
        
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

// ============================================
// FUNÇÃO LOADFILTERS
// ============================================
async function loadFilters() {
    try {
        const profSnapshot = await db.collection('professionals')
            .where('userId', '==', currentUserId)
            .where('active', '==', true)
            .get();
            
        const profSelect = document.getElementById('professionalFilter');
        if (profSelect) {
            profSelect.innerHTML = '<option value="all">Todos profissionais</option>';
            profSnapshot.forEach(doc => {
                const data = doc.data();
                profSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
            });
        }
        
        const servSnapshot = await db.collection('services')
            .where('userId', '==', currentUserId)
            .where('active', '==', true)
            .get();
            
        const servSelect = document.getElementById('serviceFilter');
        if (servSelect) {
            servSelect.innerHTML = '<option value="all">Todos serviços</option>';
            servSnapshot.forEach(doc => {
                const data = doc.data();
                servSelect.innerHTML += `<option value="${doc.id}">${data.name}</option>`;
            });
        }
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

// ============================================
// FUNÇÃO UPDATEAPPOINTMENTSLIST
// ============================================
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
        .slice(0, 1005);
    
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
        
        let statusClass = 'pending';
        let statusText = 'Pendente';
        
        if (a.status === 'confirmed') {
            statusClass = 'confirmed';
            statusText = 'Confirmado';
        } else if (a.status === 'attended') {
            statusClass = 'attended';
            statusText = 'Compareceu';
        } else if (a.status === 'absent') {
            statusClass = 'absent';
            statusText = 'Faltou';
        } else if (a.status === 'cancelled') {
            statusClass = 'cancelled';
            statusText = 'Cancelado';
        } else if (a.status === 'pending') {
            statusClass = 'pending';
            statusText = 'Pendente';
        }
        
        return `
            <div class="appointment-item">
                <div class="appointment-time">${formattedDate}<br><small>${a.time || '--:--'}</small></div>
                <div class="appointment-avatar">${initials}</div>
                <div class="appointment-info">
                    <div class="appointment-name">${client || 'Cliente'}</div>
                    <div class="appointment-service">
                        <i class="fas fa-dumbbell"></i> ${service || 'Serviço'}
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

// ============================================
// FUNÇÃO DE GRÁFICO
// ============================================
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
        appointmentsChart.updateOptions({ 
            xaxis: { categories },
            colors: ['#22c55e', '#ef4444']
        });
        appointmentsChart.updateSeries([
            { name: 'Compareceram', data: attendedData },
            { name: 'Faltaram', data: absentData }
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
// FUNÇÕES AUXILIARES DO CALENDÁRIO
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getStatusIcon(status) {
    const icons = {
        'confirmed': 'fas fa-check-circle',
        'attended': 'fas fa-check-double',
        'pending': 'fas fa-clock',
        'absent': 'fas fa-times-circle',
        'cancelled': 'fas fa-ban'
    };
    return icons[status] || 'fas fa-calendar';
}

function getStatusText(status) {
    const texts = {
        'confirmed': 'Confirmado',
        'attended': 'Compareceu',
        'pending': 'Pendente',
        'absent': 'Faltou',
        'cancelled': 'Cancelado'
    };
    return texts[status] || status;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `google-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============================================
// CALENDÁRIO PROFISSIONAL - ESTILO GOOGLE CALENDAR
// ============================================
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.warn('⚠️ Elemento do calendário não encontrado');
        return;
    }
    
    if (calendar) {
        try {
            calendar.destroy();
        } catch (e) {
            console.warn('Erro ao destruir calendário anterior:', e);
        }
    }
    
    console.log('📅 Inicializando calendário profissional...');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        timeZone: 'America/Sao_Paulo',
        firstDay: 0,
        weekNumbers: true,
        weekText: 'S',
        
        initialView: window.innerWidth <= 768 ? 'timeGridDay' : 'dayGridMonth',
        height: 'auto',
        contentHeight: 'auto',
        aspectRatio: 1.8,
        handleWindowResize: true,
        windowResizeDelay: 100,
        
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Agenda'
        },
        
        views: {
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayHeaderFormat: { weekday: 'short' },
                displayEventTime: false,
                eventLimit: 3,
                eventLimitText: "mais",
                dayMaxEvents: true,
                fixedWeekCount: false,
                showNonCurrentDates: true,
                highlightToday: true
            },
            timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00',
                slotMinTime: '06:00:00',
                slotMaxTime: '22:00:00',
                allDaySlot: false,
                nowIndicator: true,
                displayEventTime: true,
                displayEventEnd: true,
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }
            },
            timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00',
                slotMinTime: '06:00:00',
                slotMaxTime: '22:00:00',
                allDaySlot: false,
                nowIndicator: true,
                displayEventTime: true,
                displayEventEnd: true,
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }
            },
            listWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                listDayFormat: { weekday: 'long', month: 'numeric', day: 'numeric' },
                listDaySideFormat: { hour: '2-digit', minute: '2-digit' },
                noEventsText: 'Nenhum agendamento para esta semana'
            }
        },
        
        events: loadCalendarEvents,
        
        editable: true,
        selectable: true,
        selectMirror: true,
        selectOverlap: true,
        eventDurationEditable: true,
        eventStartEditable: true,
        eventResizableFromStart: true,
        dragScroll: true,
        longPressDelay: 200,
        eventLongPressDelay: 200,
        selectLongPressDelay: 200,
        
        select: function(info) {
            const startDate = info.startStr.split('T')[0];
            const startTime = info.startStr.split('T')[1]?.substring(0, 5) || '09:00';
            openModal('appointment', startDate, startTime);
            calendar.unselect();
        },
        
        eventClick: function(info) {
            showAppointmentDetails(info.event);
        },
        
        eventDrop: async function(info) {
            try {
                const eventId = info.event.id;
                const newStart = info.event.start;
                
                const dateStr = newStart.toISOString().split('T')[0];
                const timeStr = newStart.toTimeString().substring(0, 5);
                
                await db.collection('appointments').doc(eventId).update({
                    date: dateStr,
                    time: timeStr,
                    updatedAt: new Date().toISOString()
                });
                
                showNotification('Agendamento movido com sucesso!', 'success');
                await loadAllData();
                
            } catch (error) {
                console.error('Erro ao mover agendamento:', error);
                showNotification('Erro ao mover agendamento', 'error');
                info.revert();
            }
        },
        
        eventResize: async function(info) {
            try {
                const eventId = info.event.id;
                const newStart = info.event.start;
                const newEnd = info.event.end;
                
                if (newEnd) {
                    const diffMs = newEnd - newStart;
                    const newDuration = Math.round(diffMs / 60000);
                    
                    const appointmentDoc = await db.collection('appointments').doc(eventId).get();
                    const appointmentData = appointmentDoc.data();
                    
                    const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
                    const serviceDuration = serviceDoc.exists ? serviceDoc.data().duration : 60;
                    
                    if (Math.abs(newDuration - serviceDuration) > 15) {
                        if (confirm('Deseja alterar a duração deste agendamento?')) {
                            await db.collection('appointments').doc(eventId).update({
                                customDuration: newDuration,
                                updatedAt: new Date().toISOString()
                            });
                        } else {
                            info.revert();
                        }
                    }
                }
                
                showNotification('Duração atualizada!', 'success');
                
            } catch (error) {
                console.error('Erro ao redimensionar:', error);
                showNotification('Erro ao redimensionar', 'error');
                info.revert();
            }
        },
        
        eventMouseEnter: function(info) {
            const props = info.event.extendedProps;
            const start = info.event.start?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || props.time;
            const end = info.event.end?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || props.endTime;
            
            const tooltip = document.createElement('div');
            tooltip.className = 'event-tooltip';
            tooltip.id = 'event-tooltip';
            tooltip.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px;">${props.clientName}</div>
                <div style="font-size: 11px; color: #aaa;">${start} - ${end}</div>
                <div style="font-size: 11px; margin-top: 3px;">
                    <span style="color: #8ab4f8;">${props.serviceName}</span> com ${props.professionalName}
                </div>
                <div style="font-size: 11px; margin-top: 3px;">
                    Status: ${getStatusText(props.status)}
                </div>
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = info.el.getBoundingClientRect();
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        },
        
        eventMouseLeave: function() {
            const tooltip = document.getElementById('event-tooltip');
            if (tooltip) tooltip.remove();
        },
        
        datesSet: function(info) {
            const viewTitle = info.view.title;
            const titleElement = document.querySelector('.page-title h1');
            if (titleElement) {
                titleElement.innerHTML = `<i class="fas fa-calendar-alt" style="margin-right: 10px;"></i>Calendário - ${viewTitle}`;
            }
        },
        
        eventDidMount: function(info) {
            const props = info.event.extendedProps;
            
            info.el.classList.add(`event-status-${props.status || 'pending'}`);
            
            const eventContent = info.el.querySelector('.fc-event-title');
            if (eventContent) {
                const icon = document.createElement('i');
                icon.className = getStatusIcon(props.status);
                icon.style.marginRight = '5px';
                eventContent.prepend(icon);
            }
            
            const timeElement = info.el.querySelector('.fc-event-time');
            if (timeElement) {
                timeElement.style.fontWeight = '500';
                timeElement.style.fontSize = '11px';
            }
            
            if (info.view.type === 'dayGridMonth') {
                const titleElement = info.el.querySelector('.fc-event-title');
                if (titleElement) {
                    titleElement.innerHTML = props.clientName || 'Cliente';
                }
            }
        }
    });
    
    calendar.render();
    console.log('✅ Calendário profissional inicializado com sucesso!');
}

// ============================================
// FUNÇÃO PARA CARREGAR EVENTOS DO FIREBASE
// ============================================
async function loadCalendarEvents(fetchInfo, successCallback, failureCallback) {
    if (!currentUserId) {
        console.log('❌ Usuário não logado');
        successCallback([]);
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
        
        const clientPromises = new Map();
        const servicePromises = new Map();
        const professionalPromises = new Map();
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            if (data.clientId && !clientPromises.has(data.clientId)) {
                clientPromises.set(data.clientId, db.collection('clients').doc(data.clientId).get());
            }
            if (data.serviceId && !servicePromises.has(data.serviceId)) {
                servicePromises.set(data.serviceId, db.collection('services').doc(data.serviceId).get());
            }
            if (data.professionalId && !professionalPromises.has(data.professionalId)) {
                professionalPromises.set(data.professionalId, db.collection('professionals').doc(data.professionalId).get());
            }
        }
        
        const [clientDocs, serviceDocs, professionalDocs] = await Promise.all([
            Promise.all(Array.from(clientPromises.values())),
            Promise.all(Array.from(servicePromises.values())),
            Promise.all(Array.from(professionalPromises.values()))
        ]);
        
        const clientMap = new Map();
        clientPromises.forEach((promise, id) => {
            const doc = clientDocs.find(d => d.id === id);
            clientMap.set(id, doc?.exists ? doc.data().name : 'Cliente');
        });
        
        const serviceMap = new Map();
        servicePromises.forEach((promise, id) => {
            const doc = serviceDocs.find(d => d.id === id);
            serviceMap.set(id, doc?.exists ? doc.data() : { name: 'Serviço', duration: 60, price: 0 });
        });
        
        const professionalMap = new Map();
        professionalPromises.forEach((promise, id) => {
            const doc = professionalDocs.find(d => d.id === id);
            professionalMap.set(id, doc?.exists ? doc.data().name : 'Profissional');
        });
        
        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            const clientName = clientMap.get(data.clientId) || 'Cliente';
            const serviceData = serviceMap.get(data.serviceId) || { name: 'Serviço', duration: 60, price: 0 };
            const professionalName = professionalMap.get(data.professionalId) || 'Profissional';
            
            const startTime = data.time || '09:00';
            let endTime = startTime;
            
            if (serviceData.duration) {
                const [hours, minutes] = startTime.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes + serviceData.duration;
                const endHours = Math.floor(totalMinutes / 60);
                const endMinutes = totalMinutes % 60;
                endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
            }
            
            let backgroundColor = '#D91828';
            if (data.status === 'pending') backgroundColor = '#D91414';
            else if (data.status === 'attended') backgroundColor = '#22c55e';
            else if (data.status === 'absent') backgroundColor = '#ef4444';
            else if (data.status === 'cancelled') backgroundColor = '#6b7280';
            
            events.push({
                id: doc.id,
                title: clientName,
                start: data.date + 'T' + startTime + ':00',
                end: data.date + 'T' + endTime + ':00',
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: '#ffffff',
                extendedProps: {
                    clientName: clientName,
                    serviceName: serviceData.name,
                    professionalName: professionalName,
                    servicePrice: serviceData.price || 0,
                    serviceDuration: serviceData.duration || 60,
                    status: data.status || 'pending',
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
        
        try {
            console.log('⚠️ Usando fallback...');
            const fallbackSnapshot = await db.collection('appointments')
                .where('userId', '==', currentUserId)
                .get();
            
            const events = [];
            const startStr = fetchInfo.startStr.split('T')[0];
            const endStr = fetchInfo.endStr.split('T')[0];
            
            for (const doc of fallbackSnapshot.docs) {
                const data = doc.data();
                
                if (data.date < startStr || data.date > endStr) continue;
                
                const clientName = await getClientName(data.clientId);
                const serviceName = await getServiceName(data.serviceId);
                const professionalName = await getProfessionalName(data.professionalId);
                
                let backgroundColor = '#D91828';
                if (data.status === 'pending') backgroundColor = '#D91414';
                else if (data.status === 'attended') backgroundColor = '#22c55e';
                else if (data.status === 'absent') backgroundColor = '#ef4444';
                else if (data.status === 'cancelled') backgroundColor = '#6b7280';
                
                events.push({
                    id: doc.id,
                    title: clientName,
                    start: data.date + 'T' + (data.time || '09:00') + ':00',
                    end: data.date + 'T' + (await calculateEndTime(data.time, data.serviceId) || '10:00') + ':00',
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor,
                    textColor: '#ffffff',
                    extendedProps: {
                        clientName: clientName,
                        serviceName: serviceName,
                        professionalName: professionalName,
                        status: data.status || 'pending',
                        date: data.date,
                        time: data.time
                    }
                });
            }
            
            successCallback(events);
        } catch (fallbackError) {
            console.error('Fallback também falhou:', fallbackError);
            failureCallback(fallbackError);
        }
    }
}

// ============================================
// FUNÇÃO PARA MOSTRAR DETALHES DO AGENDAMENTO
// ============================================
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
                <h2 style="margin-bottom: 20px; color: var(--nexbook-primary);">
                    <i class="fas fa-calendar-check"></i> Detalhes do Agendamento
                </h2>
                
                <div style="margin-bottom: 20px;">
                    <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 40px; background: var(--nexbook-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                <i class="fas fa-user" style="color: white;"></i>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: var(--text-tertiary);">Cliente</div>
                                <div style="font-size: 18px; font-weight: 600;">${props.clientName}</div>
                            </div>
                        </div>
                    </div>
                    
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
                    
                    ${props.notes ? `
                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px; margin-bottom: 15px;">
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                                <i class="fas fa-comment"></i> Observações
                            </div>
                            <div>${props.notes}</div>
                        </div>
                    ` : ''}
                    
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 12px;">
                        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 5px;">
                            <i class="fas fa-calendar-day"></i> Data
                        </div>
                        <div style="font-weight: 600;">${new Date(props.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
                
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
// FUNÇÕES DO MODAL - CORRIGIDAS COM DATA DE INÍCIO
// ============================================
function openModal(type, date = null, time = null) {
    currentModalType = type;
    editingId = null;
    currentPhotoBase64 = null;
    
    const modal = document.getElementById('genericModal');
    const title = document.getElementById('modalTitle');
    const fields = document.getElementById('modalFields');
    const saveBtn = document.getElementById('saveModalBtn');
    
    saveBtn.innerHTML = 'Salvar';
    saveBtn.disabled = false;
    
    if (type === 'totalpass') {
        title.textContent = 'Novo Cliente Total Pass';
    } else if (type === 'wellhub') {
        title.textContent = 'Novo Cliente Well Hub';
    } else {
        title.textContent = type === 'appointment' ? 'Novo Agendamento' :
                           type === 'professional' ? 'Novo Profissional' :
                           type === 'service' ? 'Novo Serviço' : 'Novo Cliente';
    }
    
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
                <input type="time" id="modalTime" class="form-control" value="${time || '09:00'}" required>
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
                <label>Nome Completo *</label>
                <input type="text" id="modalName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Especialidade *</label>
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
                <label>Nome *</label>
                <input type="text" id="modalName" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Duração (minutos) *</label>
                <input type="number" id="modalDuration" class="form-control" value="60" required>
            </div>
            <div class="form-group">
                <label>Preço (R$) *</label>
                <input type="text" id="modalPrice" class="form-control" value="0,00" onkeyup="mascaraMoeda(this)" required>
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
        
    } else if (type === 'client' || type === 'totalpass' || type === 'wellhub') {
        const origin = type === 'totalpass' ? 'Total Pass' : (type === 'wellhub' ? 'Well Hub' : 'Direto');
        
        fields.innerHTML = getClientModalFields(origin);
    }
    
    modal.style.display = 'flex';
}

function getClientModalFields(origin = 'Direto') {
    const today = new Date().toISOString().split('T')[0];
    
    return `
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
        
        <div class="form-group">
            <label>Data de Nascimento *</label>
            <input type="date" id="modalBirthDate" class="form-control" required max="${today}">
            <small style="color: var(--text-tertiary);">Formato: DD/MM/AAAA</small>
        </div>
        
        <div class="form-group">
            <label>Email</label>
            <input type="email" id="modalEmail" class="form-control" placeholder="email@exemplo.com">
        </div>
        
        <div class="form-group">
            <label>Número de Telefone *</label>
            <input type="tel" id="modalPhone" class="form-control" required placeholder="(11) 99999-9999" maxlength="15" onkeyup="mascaraTelefone(this)">
        </div>
        
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
        
        <div class="form-group">
            <label>Data de Início *</label>
            <input type="date" id="modalStartDate" class="form-control" required value="${today}" max="${today}">
            <small class="field-hint"><i class="fas fa-calendar-alt"></i> Data em que o cliente iniciou as aulas</small>
        </div>
        
        <input type="hidden" id="modalOrigin" value="${origin}">
        
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

// ============================================
// FUNÇÃO LOADMODALSELECTS
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
// FUNÇÕES DE MÁSCARA
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
// FUNÇÃO EDITITEM - CORRIGIDA COM DATA DE INÍCIO
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
            const priceFormatted = data.price ? data.price.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') : '0,00';
            
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
                    <label>Preço (R$)</label>
                    <input type="text" id="modalPrice" class="form-control" value="${priceFormatted}" onkeyup="mascaraMoeda(this)">
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
            
            let valorFormatado = '0,00';
            if (data.planValue) {
                valorFormatado = data.planValue.toFixed(2).replace('.', ',');
                valorFormatado = valorFormatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            }
            
            let photoHtml = '<i class="fas fa-camera"></i>';
            if (data.photoBase64) {
                photoHtml = `<img src="${data.photoBase64}" alt="Foto">`;
            }
            
            const today = new Date().toISOString().split('T')[0];
            
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
                
                <div class="form-group">
                    <label>Data de Nascimento *</label>
                    <input type="date" id="modalBirthDate" class="form-control" value="${data.birthDate || ''}" required max="${today}">
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="modalEmail" class="form-control" value="${data.email || ''}">
                </div>
                
                <div class="form-group">
                    <label>Número de Telefone *</label>
                    <input type="tel" id="modalPhone" class="form-control" value="${data.phone || ''}" required maxlength="15" onkeyup="mascaraTelefone(this)">
                </div>
                
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
                
                <div class="form-group">
                    <label>Data de Início *</label>
                    <input type="date" id="modalStartDate" class="form-control" required value="${data.startDate || today}" max="${today}">
                    <small class="field-hint"><i class="fas fa-calendar-alt"></i> Data em que o cliente iniciou as aulas</small>
                </div>
                
                <input type="hidden" id="modalOrigin" value="${data.origin || 'Direto'}">
                
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
// FUNÇÃO SAVEMODAL - CORRIGIDA COM DATA DE INÍCIO
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
            const priceInput = document.getElementById('modalPrice')?.value || '0,00';
            const price = parseFloat(priceInput.replace(/\./g, '').replace(',', '.'));
            
            data = {
                userId: currentUserId,
                name: document.getElementById('modalName')?.value,
                duration: parseInt(document.getElementById('modalDuration')?.value) || 60,
                price: price,
                description: document.getElementById('modalDescription')?.value,
                active: document.getElementById('modalActive')?.value === 'true',
                createdAt: new Date().toISOString()
            };
            
            if (!data.name) {
                throw new Error('Nome é obrigatório');
            }
            
        } else if (type === 'client' || type === 'totalpass' || type === 'wellhub') {
            const cpfInput = document.getElementById('modalCpf');
            const phoneInput = document.getElementById('modalPhone');
            const nameInput = document.getElementById('modalName');
            const birthDateInput = document.getElementById('modalBirthDate');
            const planInput = document.getElementById('modalPlan');
            const planValueInput = document.getElementById('modalPlanValue');
            const startDateInput = document.getElementById('modalStartDate');
            const originInput = document.getElementById('modalOrigin');
            
            if (!cpfInput || !phoneInput || !nameInput || !birthDateInput || !planInput || !planValueInput || !startDateInput) {
                console.error('Campos do formulário não encontrados:', {
                    cpf: !!cpfInput,
                    phone: !!phoneInput,
                    name: !!nameInput,
                    birthDate: !!birthDateInput,
                    plan: !!planInput,
                    planValue: !!planValueInput,
                    startDate: !!startDateInput
                });
                throw new Error('Erro ao capturar dados do formulário. Campos não encontrados.');
            }
            
            const cpfRaw = cpfInput.value.replace(/\D/g, '');
            const phoneRaw = phoneInput.value.replace(/\D/g, '');
            const name = nameInput.value.trim();
            const birthDate = birthDateInput.value;
            const plan = planInput.value;
            const startDate = startDateInput.value;
            const origin = originInput ? originInput.value : (type === 'totalpass' ? 'Total Pass' : (type === 'wellhub' ? 'Well Hub' : 'Direto'));
            
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
            
            if (!startDate) {
                throw new Error('Data de início é obrigatória');
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
                startDate: startDate,
                origin: origin,
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
            await db.collection(type === 'totalpass' || type === 'wellhub' ? 'clients' : type + 's').doc(editingId).update(data);
        } else {
            const collectionName = (type === 'totalpass' || type === 'wellhub') ? 'clients' : type + 's';
            await db.collection(collectionName).add(data);
        }
        
        closeModal();
        await loadAllData();
        if (calendar) calendar.refetchEvents();
        
        showNotification('Salvo com sucesso!', 'success');
        
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
        showNotification('Excluído com sucesso!', 'success');
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
    if (customRange) {
        customRange.style.display = document.getElementById('periodFilter')?.value === 'custom' ? 'flex' : 'none';
    }
    applyFilters();
}

function applyFilters() {
    loadDashboardData();
}

// ============================================
// CSS DO CALENDÁRIO
// ============================================
function addCalendarStyles() {
    if (document.getElementById('calendar-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'calendar-styles';
    styleSheet.textContent = `
        .fc {
            font-family: 'Google Sans', 'Roboto', system-ui, sans-serif;
            background: var(--bg-primary);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .fc-toolbar {
            margin-bottom: 24px !important;
        }
        
        .fc-toolbar-title {
            font-size: 1.5rem !important;
            font-weight: 500 !important;
            color: var(--text-primary);
        }
        
        .fc-button {
            background: transparent !important;
            border: 1px solid var(--border-color) !important;
            color: var(--text-primary) !important;
            font-weight: 500 !important;
            padding: 8px 16px !important;
            border-radius: 24px !important;
            transition: all 0.2s;
            text-transform: capitalize !important;
            box-shadow: none !important;
        }
        
        .fc-button:hover {
            background: var(--bg-hover) !important;
            border-color: var(--nexbook-primary) !important;
        }
        
        .fc-button-active {
            background: var(--nexbook-primary) !important;
            border-color: var(--nexbook-primary) !important;
            color: white !important;
        }
        
        .fc-button-active:hover {
            background: var(--nexbook-secondary) !important;
        }
        
        .fc-col-header-cell {
            background: var(--bg-secondary);
            padding: 12px 0;
            font-weight: 500;
            color: var(--text-primary);
            border: none;
        }
        
        .fc-col-header-cell-cushion {
            text-decoration: none;
            color: var(--text-primary);
        }
        
        .fc-daygrid-day {
            border: 1px solid var(--border-color) !important;
            transition: background 0.2s;
        }
        
        .fc-daygrid-day:hover {
            background: var(--bg-hover);
            cursor: pointer;
        }
        
        .fc-day-today {
            background: rgba(217, 24, 40, 0.05) !important;
        }
        
        .fc-day-today .fc-daygrid-day-number {
            background: var(--nexbook-primary);
            color: white !important;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin: 4px;
        }
        
        .fc-daygrid-day-number {
            color: var(--text-primary);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 8px !important;
        }
        
        .fc-event {
            border: none !important;
            border-radius: 4px !important;
            padding: 2px 4px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            margin: 1px 0 !important;
            transition: transform 0.1s, box-shadow 0.1s;
        }
        
        .fc-event:hover {
            transform: scale(1.02);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .event-status-confirmed {
            background: linear-gradient(135deg, #D91828, #8C0D0D) !important;
        }
        
        .event-status-attended {
            background: linear-gradient(135deg, #22c55e, #16a34a) !important;
        }
        
        .event-status-pending {
            background: linear-gradient(135deg, #D91414, #591218) !important;
        }
        
        .event-status-absent {
            background: linear-gradient(135deg, #ef4444, #b91c1c) !important;
        }
        
        .event-status-cancelled {
            background: linear-gradient(135deg, #6b7280, #4b5563) !important;
        }
        
        .fc-timegrid-slot {
            height: 40px !important;
            border-color: var(--border-color) !important;
        }
        
        .fc-timegrid-slot-label {
            font-size: 12px;
            color: var(--text-tertiary);
            font-weight: 500;
        }
        
        .fc-timegrid-now-indicator-line {
            border-color: var(--nexbook-primary) !important;
            border-width: 2px !important;
        }
        
        .fc-timegrid-now-indicator-arrow {
            border-color: var(--nexbook-primary) !important;
            color: var(--nexbook-primary) !important;
        }
        
        .fc-scrollgrid {
            border: 1px solid var(--border-color) !important;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .fc-scrollgrid td {
            border-color: var(--border-color) !important;
        }
        
        .event-tooltip {
            position: fixed;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            border: 1px solid var(--border-color);
            z-index: 9999;
            pointer-events: none;
            max-width: 250px;
            animation: fadeIn 0.2s;
        }
        
        .event-tooltip::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 10px;
            background: var(--bg-primary);
            border-right: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            transform: translateX(-50%) rotate(45deg);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .google-notification {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s;
            z-index: 10000;
            border-left: 4px solid var(--nexbook-primary);
        }
        
        .google-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .google-notification.success {
            border-left-color: #22c55e;
        }
        
        .google-notification.error {
            border-left-color: #ef4444;
        }
        
        .google-notification i {
            font-size: 20px;
        }
        
        @media (max-width: 768px) {
            .fc-toolbar {
                flex-direction: column;
                gap: 16px;
            }
            
            .fc-toolbar-chunk {
                display: flex;
                justify-content: center;
                width: 100%;
            }
            
            .fc .fc-button {
                padding: 6px 12px !important;
                font-size: 12px !important;
            }
            
            .fc-daygrid-day-number {
                font-size: 12px;
            }
        }
    `;
    
    document.head.appendChild(styleSheet);
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
            reports: 'Relatórios e Análises',
            settings: 'Configurações do Sistema'
        };
        
        document.querySelector('.page-title h1').textContent = titles[this.dataset.view];
        
        if (this.dataset.view === 'reports') {
            console.log('📊 Carregando relatórios...');
            loadReportsData();
        }
        
        if (globalSearchTerm) {
            setTimeout(() => {
                if (this.dataset.view === 'professionals') {
                    filterProfessionalsTable();
                } else if (this.dataset.view === 'services') {
                    filterServicesTable();
                } else if (this.dataset.view === 'clients') {
                    filterClientsTable();
                } else if (this.dataset.view === 'reports') {
                    filterReportClients();
                }
            }, 100);
        }
        
        if (this.dataset.view === 'calendar' && calendar) {
            setTimeout(() => calendar.render(), 100);
        }
    });
});

// ============================================
// FUNÇÃO LOADREPORTSDATA - VERSÃO ÚNICA E ROBUSTA
// ============================================
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
        clients.filter(c => c.status === 'active').forEach(c => {
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
// ATUALIZAR GRÁFICOS DE RELATÓRIOS - VERSÃO ÚNICA E ROBUSTA
// ============================================
function updateReportsCharts(appointments, clients) {
    try {
        console.log('📊 Atualizando gráficos de relatórios...');
        
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
                }
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
                    label === 'Total Pass' ? '#D91828' : 
                    label === 'Well Hub' ? '#8C0D0D' : '#591218'
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
                        }
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
// ATUALIZAR LISTA DE CLIENTES NO RELATÓRIO - CORRIGIDA COM DATA DE INÍCIO
// ============================================
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
            
            if (client.status === 'active' && client.planValue) {
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
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px; color: var(--danger);">Erro ao carregar dados</td></tr>';
    }
}

// ============================================
// GERAR RELATÓRIO INDIVIDUAL DO ALUNO - CORRIGIDA COM DATA DE INÍCIO
// ============================================
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
        
        if (client.status === 'active' && client.planValue) {
            revenue += client.planValue;
        }
        
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
                    <div class="client-report-detail-item">
                        <span class="client-report-detail-label">Valor do Plano:</span>
                        <span class="client-report-detail-value">${client.planValue ? formatCurrency(client.planValue) : '---'}</span>
                    </div>
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
            colors: ['#22c55e', '#ef4444', '#f59e0b'],
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
function closeClientReportModal() {
    document.getElementById('clientReportModal').style.display = 'none';
    
    if (window.currentClientChart) {
        window.currentClientChart.destroy();
        window.currentClientChart = null;
    }
}

// ============================================
// GERAR RELATÓRIO GERAL EM PDF - CORRIGIDA COM DATA DE INÍCIO
// ============================================
async function generateGeneralReport() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        doc.setFontSize(18);
        doc.setTextColor(217, 24, 40);
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
        
        clients.filter(c => c.status === 'active').forEach(c => {
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
            headStyles: { fillColor: [217, 24, 40] }
        });
        
        doc.save(`relatorio-geral-${new Date().toISOString().split('T')[0]}.pdf`);
        
        showNotification('Relatório PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar relatório PDF:', error);
        alert('Erro ao gerar relatório PDF. Tente novamente.');
    }
}

// ============================================
// DOWNLOAD RELATÓRIO INDIVIDUAL PDF
// ============================================
async function downloadClientReportPDF() {
    alert('Função de download PDF será implementada em breve!');
}

// ============================================
// VERIFICAR SE USUÁRIO TEM PLANO ATIVO
// ============================================
async function checkUserPlan() {
    if (!currentUserId) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUserId).get();
        const userData = userDoc.data();
        
        if (!userData) return true;
        
        const dataCriacao = new Date(userData.createdAt);
        const diasTeste = 7;
        const dataExpiracaoTeste = new Date(dataCriacao.getTime() + diasTeste * 24 * 60 * 60 * 1000);
        const hoje = new Date();
        
        if (!userData.plano && hoje > dataExpiracaoTeste) {
            window.location.href = 'planos.html';
            return false;
        }
        
        if (userData.plano && userData.dataExpiracao) {
            const expiracao = new Date(userData.dataExpiracao);
            if (hoje > expiracao) {
                window.location.href = 'planos.html?expired=true';
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao verificar plano:', error);
        return true;
    }
}

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

function hasFeature(feature) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const planFeatures = {
        basico: ['agendamentos', 'dashboard', 'clientes'],
        profissional: ['agendamentos', 'dashboard', 'clientes', 'whatsapp', 'assistencia'],
        premium: ['agendamentos', 'dashboard', 'clientes', 'whatsapp', 'relatorios', 'vip']
    };
    
    return planFeatures[user.plano]?.includes(feature) || false;
}

const whatsappNotifications = document.getElementById('whatsappNotifications');
if (whatsappNotifications) {
    whatsappNotifications.disabled = !hasFeature('whatsapp');
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    addCalendarStyles();
    
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
            stacked: false,
            background: 'transparent'
        },
        colors: ['#22c55e', '#ef4444'],
        dataLabels: { enabled: false },
        stroke: { 
            curve: 'smooth', 
            width: 2,
            colors: ['#ffffff']
        },
        grid: { 
            borderColor: 'var(--border-color)',
            strokeDashArray: 4
        },
        xaxis: {
            categories: [],
            labels: { 
                style: { 
                    colors: 'var(--text-tertiary)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                } 
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { 
                style: { 
                    colors: 'var(--text-tertiary)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                } 
            },
            title: {
                text: 'Número de alunos',
                style: { 
                    color: 'var(--text-tertiary)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontWeight: 500
                }
            }
        },
        tooltip: { 
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val + ' aluno' + (val !== 1 ? 's' : '');
                }
            },
            style: {
                fontFamily: 'Plus Jakarta Sans, sans-serif'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: { 
                colors: 'var(--text-primary)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 500
            },
            markers: {
                radius: 4,
                width: 12,
                height: 12
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '60%',
                distributed: false
            }
        },
        fill: {
            opacity: 1,
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#16a34a', '#b91c1c'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        }
    });
    appointmentsChart.render();

    servicesChart = new ApexCharts(document.querySelector("#servicesChart"), {
        series: [],
        chart: { 
            type: 'donut', 
            height: 250,
            animations: { enabled: true },
            background: 'transparent',
            sparkline: { enabled: false }
        },
        colors: ['#D91828', '#D91414', '#8C0D0D', '#591218'],
        labels: ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'],
        plotOptions: { 
            pie: { 
                donut: { 
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '16px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 700,
                            color: 'var(--nexbook-primary)',
                            offsetY: 10,
                            formatter: function(val) {
                                return val + ' cliente' + (parseInt(val) !== 1 ? 's' : '');
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Total',
                            fontSize: '14px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 600,
                            color: 'var(--text-tertiary)',
                            formatter: function(w) {
                                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return total + ' cliente' + (total !== 1 ? 's' : '');
                            }
                        }
                    }
                },
                expandOnClick: true,
                dataLabels: {
                    offset: 0,
                    minAngleToShowLabel: 10
                }
            } 
        },
        dataLabels: { 
            enabled: true,
            formatter: function(val, opts) {
                return opts.w.config.series[opts.seriesIndex] + ' (' + val.toFixed(1) + '%)';
            },
            style: {
                fontSize: '11px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                colors: ['#ffffff']
            },
            background: {
                enabled: true,
                foreColor: '#ffffff',
                borderRadius: 8,
                padding: 4,
                opacity: 0.8,
                borderWidth: 0
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 2,
                color: '#000',
                opacity: 0.3
            }
        },
        legend: { 
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 500,
            labels: {
                colors: 'var(--text-primary)'
            },
            markers: {
                radius: 4,
                width: 12,
                height: 12,
                strokeWidth: 0
            },
            itemMargin: {
                horizontal: 10,
                vertical: 5
            }
        },
        tooltip: { 
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val + ' cliente' + (val !== 1 ? 's' : '');
                }
            },
            style: {
                fontFamily: 'Plus Jakarta Sans, sans-serif'
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['var(--bg-card)']
        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 0.1
                }
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'darken',
                    value: 0.2
                }
            }
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: {
                    height: 200
                },
                legend: {
                    position: 'bottom',
                    fontSize: '11px'
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '70%',
                            labels: {
                                show: true,
                                name: {
                                    fontSize: '12px'
                                },
                                value: {
                                    fontSize: '14px'
                                }
                            }
                        }
                    }
                }
            }
        }]
    });
    servicesChart.render();
    
    reportsLineChart = new ApexCharts(document.querySelector("#reportsLineChart"), {
        series: [{ name: 'Agendamentos', data: [] }],
        chart: { type: 'line', height: 250, toolbar: { show: false } },
        colors: ['#D91828'],
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: [] }
    });
    reportsLineChart.render();
    
    reportsPieChart = new ApexCharts(document.querySelector("#reportsPieChart"), {
        series: [],
        chart: { type: 'pie', height: 250 },
        labels: [],
        colors: ['#D91828', '#8C0D0D', '#591218']
    });
    reportsPieChart.render();
    
    reportsBarChart = new ApexCharts(document.querySelector("#reportsBarChart"), {
        series: [{ name: 'Agendamentos', data: [] }],
        chart: { type: 'bar', height: 250, toolbar: { show: false } },
        colors: ['#D91414'],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        xaxis: { categories: [] }
    });
    reportsBarChart.render();
    
    const today = new Date();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) startDate.value = lastWeek.toISOString().split('T')[0];
    if (endDate) endDate.value = today.toISOString().split('T')[0];
    
    const reportPeriod = document.getElementById('reportPeriod');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', function() {
            console.log('📊 Período alterado para:', this.value);
            loadReportsData();
        });
    }
    
    if (document.getElementById('reportsView').classList.contains('active')) {
        loadReportsData();
    }
});