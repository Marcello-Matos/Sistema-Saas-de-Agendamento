// ============================================
// FUNÇÃO UPDATEAPPOINTMENTSLIST
// ============================================

// 28. Atualizar lista de agendamentos
async function updateAppointmentsList(appointments) {
    const list = document.getElementById('appointmentsList');
    if (!list) return;
    
    if (!appointments || appointments.length === 0) {
        list.innerHTML = `
            <div class="appointment-item" style="justify-content: center; padding: 40px;">
                <div style="text-align: center;">
                    <i class="fas fa-calendar-plus" style="font-size: 48px; color: var(--text-muted);"></i>
                    <p style="color: var(--text-muted); margin-top: 16px;">Nenhum agendamento encontrado</p>
                    <button class="btn-primary" onclick="openModal('appointment')" style="margin-top: 16px;">
                        <i class="fas fa-plus"></i> Criar agendamento
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments
        .filter(a => a.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 1005);
    
    if (upcoming.length === 0) {
        list.innerHTML = `
            <div class="appointment-item" style="justify-content: center; padding: 20px;">
                <p style="color: var(--text-muted);">Nenhum agendamento futuro</p>
            </div>
        `;
        return;
    }
    
    const items = await Promise.all(upcoming.map(async a => {
        const client = await getClientName(a.clientId);
        const service = await getServiceName(a.serviceId);
        const professional = await getProfessionalName(a.professionalId);
        
        const initials = (client || 'C').substring(0, 2).toUpperCase();
        const dateObj = new Date(a.date + 'T12:00:00');
        const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        let statusClass = 'pending';
        let statusText = 'Pendente';
        
        if (a.status === 'confirmed') {
            statusClass = 'confirmed';
            statusText = 'Confirmado';
        } else if (a.status === 'attended') {
            statusClass = 'attended';
            statusText = 'Compareceu';
        } else if (a.status === 'absent') {
            statusClass = 'absent';
            statusText = 'Faltou';
        } else if (a.status === 'cancelled') {
            statusClass = 'cancelled';
            statusText = 'Cancelado';
        } else if (a.status === 'pending') {
            statusClass = 'pending';
            statusText = 'Pendente';
        }
        
        return `
            <div class="appointment-item">
                <div class="appointment-time">${formattedDate}<br><small>${a.time || '--:--'}</small></div>
                <div class="appointment-avatar">${initials}</div>
                <div class="appointment-info">
                    <div class="appointment-name">${client || 'Cliente'}</div>
                    <div class="appointment-service">
                        <i class="fas fa-dumbbell"></i> ${service || 'Serviço'}
                        <i class="fas fa-user-md" style="margin-left: 8px;"></i> ${professional || 'Profissional'}
                    </div>
                </div>
                <div class="appointment-status status-${statusClass}">
                    ${statusText}
                </div>
                <div class="appointment-actions">
                    ${a.date === today || a.date < today ? `
                        <button class="action-btn attended" onclick="updateAppointmentStatus('${a.id}', 'attended')" title="Compareceu">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        <button class="action-btn absent" onclick="updateAppointmentStatus('${a.id}', 'absent')" title="Faltou">
                            <i class="fas fa-times-circle"></i>
                        </button>
                    ` : `
                        <button class="action-btn confirm" onclick="updateAppointmentStatus('${a.id}', 'confirmed')" title="Confirmar">
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                    <button class="action-btn cancel" onclick="updateAppointmentStatus('${a.id}', 'cancelled')" title="Cancelar">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="action-btn" onclick="editItem('appointment', '${a.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }));
    
    list.innerHTML = items.join('');
}

// 29. Buscar nome do cliente
async function getClientName(clientId) {
    if (!clientId) return 'Cliente';
    try {
        const doc = await db.collection('clients').doc(clientId).get();
        return doc.exists ? doc.data().name : 'Cliente';
    } catch {
        return 'Cliente';
    }
}

// 30. Buscar nome do serviço
async function getServiceName(serviceId) {
    if (!serviceId) return 'Serviço';
    try {
        const doc = await db.collection('services').doc(serviceId).get();
        return doc.exists ? doc.data().name : 'Serviço';
    } catch {
        return 'Serviço';
    }
}

// 31. Buscar nome do profissional
async function getProfessionalName(professionalId) {
    if (!professionalId) return 'Profissional';
    try {
        const doc = await db.collection('professionals').doc(professionalId).get();
        return doc.exists ? doc.data().name : 'Profissional';
    } catch {
        return 'Profissional';
    }
}