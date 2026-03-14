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

// ============================================
// FUNÇÃO GETCLIENTMODALFIELDS
// ============================================

// 47. Retornar campos do modal cliente
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
                <div class="photo-optional" style="color: #6b7280; font-size: 11px; margin-top: 5px; text-align: center;">
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
            <small style="color: #6b7280;">Formato: DD/MM/AAAA</small>
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
                <option value="AVULSO">AVULSO</option>
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