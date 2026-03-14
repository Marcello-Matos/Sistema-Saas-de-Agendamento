// ============================================
// FUNÇÕES DE BUSCA GLOBAL
// ============================================

// 13. Gerenciar busca global
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

// 14. Filtrar tabela de profissionais
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

// 15. Filtrar tabela de serviços
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

// 16. Filtrar tabela de clientes
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

// 17. Filtrar clientes nos relatórios
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