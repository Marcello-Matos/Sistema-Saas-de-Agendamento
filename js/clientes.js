// ============================================
// FUNÇÃO LOADCLIENTS
// ============================================

// 24. Carregar lista de clientes
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
                    const origemClass = origem === 'Total Pass' ? 'badge-totalpass' : (origem === 'Well Hub' ? 'badge-wellhub' : (c.plan === 'AVULSO' ? 'badge-avulso' : ''));
                    
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