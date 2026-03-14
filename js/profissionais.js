// ============================================
// FUNÇÃO LOADPROFESSIONALS
// ============================================

// 22. Carregar lista de profissionais
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