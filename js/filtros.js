// ============================================
// FUNÇÕES DE FILTROS
// ============================================

// 25. Carregar filtros
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

// 26. Atualizar filtro de profissionais
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

// 27. Atualizar filtro de serviços
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