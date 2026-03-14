// ============================================
// FUNÇÃO LOADSERVICES
// ============================================

// 23. Carregar lista de serviços
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