// ============================================
// FUNÇÃO SAVEMODAL
// ============================================

// 56. Salvar dados do modal
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
            if (planValueInput.value && plan !== 'AVULSO') {
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
            
            if (plan !== 'AVULSO' && (!planValue || planValue <= 0)) {
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
                planValue: plan === 'AVULSO' ? 0 : planValue,
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