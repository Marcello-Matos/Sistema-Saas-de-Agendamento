// ============================================
// FUNÇÃO LOADMODALSELECTS
// ============================================

// 48. Carregar selects dos modais
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

// 49. Fechar modal
function closeModal() {
    document.getElementById('genericModal').style.display = 'none';
    editingId = null;
    currentModalType = null;
    currentPhotoBase64 = null;
    
    const saveBtn = document.getElementById('saveModalBtn');
    saveBtn.innerHTML = 'Salvar';
    saveBtn.disabled = false;
}