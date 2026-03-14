// ============================================
// FUNÇÕES DO MODAL
// ============================================

// 46. Abrir modal genérico
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