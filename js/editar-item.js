// ============================================
// FUNÇÃO EDITITEM
// ============================================

// 55. Editar item
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
                        <div class="photo-optional" style="color: #6b7280; font-size: 11px; margin-top: 5px; text-align: center;">
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
                        <option value="AVULSO" ${data.plan === 'AVULSO' ? 'selected' : ''}>AVULSO</option>
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