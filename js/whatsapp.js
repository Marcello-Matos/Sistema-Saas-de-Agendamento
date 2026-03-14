/* ============================================
   WHATSAPP INTEGRATION - NEXBOOK
   Envio de lembretes via WhatsApp para alunos
   ============================================ */

// Variáveis globais
let currentAppointmentForWhatsapp = null;
let currentClientForWhatsapp = null;

/* ============================================
   FUNÇÕES DE UTILIDADE
   ============================================ */
function showLoading(show) {
    let loadingEl = document.getElementById('whatsapp-loading');
    
    if (show) {
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'whatsapp-loading';
            loadingEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            loadingEl.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top-color: #25D366; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 10px; color: #333;">Processando...</p>
                </div>
            `;
            
            const style = document.createElement('style');
            style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
            document.body.appendChild(loadingEl);
        }
    } else {
        if (loadingEl) loadingEl.remove();
    }
}

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100000;
        font-family: 'Plus Jakarta Sans', sans-serif;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `<strong>${title}</strong><br>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ============================================
   FUNÇÃO PRINCIPAL - ABRIR MODAL DE SELEÇÃO DE ALUNOS
   ============================================ */
async function openWhatsAppSelectModal() {
    try {
        showLoading(true);
        
        // Verificar Firebase
        if (typeof auth === 'undefined' || !auth) {
            showToast('error', 'Erro', 'Firebase não inicializado');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            showToast('error', 'Erro', 'Faça login primeiro');
            window.location.href = 'index.html';
            return;
        }
        
        if (typeof db === 'undefined' || !db) {
            showToast('error', 'Erro', 'Banco de dados não inicializado');
            return;
        }
        
        // Buscar agendamentos dos próximos 7 dias
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const todayStr = today.toISOString().split('T')[0];
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        console.log('📅 Buscando agendamentos de', todayStr, 'até', nextWeekStr);
        
        const snapshot = await db.collection('appointments')
            .where('userId', '==', user.uid)
            .where('date', '>=', todayStr)
            .where('date', '<=', nextWeekStr)
            .orderBy('date')
            .orderBy('time')
            .get();
        
        console.log('📊 Total de agendamentos encontrados:', snapshot.size);
        
        if (snapshot.empty) {
            showToast('info', 'Sem agendamentos', 'Não há agendamentos para os próximos 7 dias');
            return;
        }
        
        // Processar agendamentos e buscar dados dos clientes
        const studentList = document.getElementById('whatsappStudentList');
        studentList.innerHTML = '';
        
        let hasStudentsWithPhone = false;
        
        for (const doc of snapshot.docs) {
            const appointment = { id: doc.id, ...doc.data() };
            
            if (!appointment.clientId) continue;
            
            // Buscar cliente
            const clientDoc = await db.collection('clients').doc(appointment.clientId).get();
            if (!clientDoc.exists) continue;
            
            const client = clientDoc.data();
            
            // Só mostrar quem tem telefone
            if (!client.phone) continue;
            
            hasStudentsWithPhone = true;
            
            // Buscar serviço
            let serviceName = 'Serviço';
            if (appointment.serviceId) {
                const serviceDoc = await db.collection('services').doc(appointment.serviceId).get();
                if (serviceDoc.exists) {
                    serviceName = serviceDoc.data().name;
                }
            }
            
            // Buscar profissional
            let professionalName = 'Profissional';
            if (appointment.professionalId) {
                const profDoc = await db.collection('professionals').doc(appointment.professionalId).get();
                if (profDoc.exists) {
                    professionalName = profDoc.data().name;
                }
            }
            
            // Formatar data
            const dateObj = new Date(appointment.date + 'T12:00:00');
            const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
            });
            
            // Criar card do aluno
            const card = document.createElement('div');
            card.className = 'student-card';
            card.setAttribute('data-name', client.name.toLowerCase());
            card.setAttribute('data-appointment-id', appointment.id);
            card.setAttribute('data-client-id', clientDoc.id);
            
            // Iniciais para o avatar
            const initials = client.name ? client.name.substring(0, 2).toUpperCase() : 'AL';
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; width: 100%;">
                    <div class="student-avatar">${initials}</div>
                    <div class="student-info">
                        <div class="student-name">${client.name}</div>
                        <div class="student-details">
                            📅 ${formattedDate} às ${appointment.time || '--:--'} | ${serviceName}
                        </div>
                        <div class="student-phone">
                            <i class="fab fa-whatsapp"></i> ${formatPhoneNumber(client.phone)}
                        </div>
                    </div>
                    <div>
                        <i class="fas fa-chevron-right" style="color: var(--text-secondary);"></i>
                    </div>
                </div>
            `;
            
            // Evento de clique no card
            card.addEventListener('click', () => {
                // Abrir modal de confirmação com os dados deste agendamento
                openWhatsAppModal(appointment.id);
                closeSelectModal();
            });
            
            studentList.appendChild(card);
        }
        
        // Se não encontrou nenhum aluno com telefone
        if (!hasStudentsWithPhone) {
            studentList.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--text-secondary);"></i>
                    <p style="margin-top: 16px; color: var(--text-secondary);">Nenhum aluno com telefone cadastrado para os próximos 7 dias</p>
                </div>
            `;
        }
        
        // Abrir modal
        const modal = document.getElementById('whatsappSelectModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        showToast('error', 'Erro', 'Falha ao carregar lista de alunos: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/* ============================================
   FUNÇÃO PARA FILTRAR ALUNOS NA LISTA
   ============================================ */
function filterStudentList() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.student-card');
    
    cards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        if (name.includes(searchTerm) || searchTerm === '') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ============================================
   FUNÇÃO PARA ABRIR MODAL DE CONFIRMAÇÃO
   ============================================ */
async function openWhatsAppModal(appointmentId) {
    try {
        showLoading(true);
        
        const user = auth.currentUser;
        if (!user) {
            showToast('error', 'Erro', 'Faça login primeiro');
            return;
        }
        
        // Buscar agendamento
        const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
        
        if (!appointmentDoc.exists) {
            showToast('error', 'Erro', 'Agendamento não encontrado');
            return;
        }
        
        const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() };
        currentAppointmentForWhatsapp = appointment;
        
        // Verificar clientId
        if (!appointment.clientId) {
            showToast('error', 'Erro', 'Agendamento não possui cliente');
            return;
        }
        
        // Buscar cliente
        const clientDoc = await db.collection('clients').doc(appointment.clientId).get();
        
        if (!clientDoc.exists) {
            showToast('error', 'Erro', 'Cliente não encontrado');
            return;
        }
        
        const client = { id: clientDoc.id, ...clientDoc.data() };
        currentClientForWhatsapp = client;
        
        // Verificar telefone
        if (!client.phone) {
            showToast('error', 'Erro', 'Cliente não possui telefone cadastrado');
            return;
        }
        
        // Exibir dados no modal
        displayAppointmentInfo(appointment, client);
        
        // Abrir modal de confirmação
        const modal = document.getElementById('whatsappConfirmModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('error', 'Erro', 'Falha ao carregar dados: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/* ============================================
   EXIBIR INFORMAÇÕES NO MODAL DE CONFIRMAÇÃO
   ============================================ */
function displayAppointmentInfo(appointment, client) {
    const infoDiv = document.getElementById('whatsappAppointmentInfo');
    const phoneSpan = document.getElementById('whatsappPhoneNumber');
    
    if (!infoDiv || !phoneSpan) return;
    
    // Formatar data
    let appointmentDate;
    if (appointment.date?.toDate) {
        appointmentDate = appointment.date.toDate();
    } else if (appointment.date) {
        appointmentDate = new Date(appointment.date);
    } else {
        appointmentDate = new Date();
    }
    
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Formatar telefone
    const formattedPhone = formatPhoneNumber(client.phone);
    phoneSpan.textContent = formattedPhone;
    
    // Nomes
    const serviceName = appointment.serviceName || appointment.service || 'Serviço';
    const professionalName = appointment.professionalName || appointment.professional || 'Profissional';
    const clientName = client.name || client.displayName || 'Aluno';
    
    infoDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div style="width: 48px; height: 48px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user-graduate" style="color: white; font-size: 20px;"></i>
            </div>
            <div>
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">${clientName}</div>
                <div style="color: #64748b; font-size: 13px;">${client.email || 'Sem email'}</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div style="background: #f1f5f9; padding: 10px; border-radius: 8px;">
                <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">DATA</div>
                <div style="font-weight: 600; font-size: 14px;">${formattedDate}</div>
            </div>
            <div style="background: #f1f5f9; padding: 10px; border-radius: 8px;">
                <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">HORÁRIO</div>
                <div style="font-weight: 600; font-size: 14px;">${formattedTime}</div>
            </div>
        </div>
        
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
            <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">SERVIÇO</div>
            <div style="font-weight: 600; font-size: 14px;">${serviceName}</div>
        </div>
        
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">PROFISSIONAL</div>
            <div style="font-weight: 600; font-size: 14px;">${professionalName}</div>
        </div>
    `;
}

/* ============================================
   ENVIAR LEMBRETE VIA WHATSAPP
   ============================================ */
async function sendWhatsAppReminder() {
    if (!currentAppointmentForWhatsapp || !currentClientForWhatsapp) {
        showToast('error', 'Erro', 'Dados não encontrados');
        return;
    }
    
    try {
        showLoading(true);
        
        const appointment = currentAppointmentForWhatsapp;
        const client = currentClientForWhatsapp;
        
        // Validar telefone
        if (!client.phone) {
            showToast('error', 'Erro', 'Telefone não cadastrado');
            return;
        }
        
        // Formatar data
        let appointmentDate;
        if (appointment.date?.toDate) {
            appointmentDate = appointment.date.toDate();
        } else {
            appointmentDate = new Date(appointment.date || new Date());
        }
        
        const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Verificar mensagem personalizada
        const addMessage = document.getElementById('whatsappAddMessage');
        const customMessageField = document.getElementById('whatsappCustomMessage');
        
        let customMessage = '';
        if (addMessage && addMessage.checked && customMessageField) {
            customMessage = customMessageField.value.trim();
        }
        
        // Nomes
        const serviceName = appointment.serviceName || appointment.service || 'serviço';
        const professionalName = appointment.professionalName || appointment.professional || 'profissional';
        const clientName = client.name || client.displayName || 'aluno';
        
        // Construir mensagem
       // Construir mensagem (VERSÃO CORRIGIDA - SEM QUADRADOS)
        let message = `Olá *${clientName}*! \n\n`;
        message += ` *LEMBRETE DE AGENDAMENTO*\n\n`;
        message += ` *Data:* ${formattedDate}\n`;
        message += ` *Horário:* ${formattedTime}\n`;
        message += ` *Serviço:* ${serviceName}\n`;
        message += ` *Profissional:* ${professionalName}\n\n`;
        message += ` Por favor, confirme sua presença!\n`;
        message += `Qualquer dúvida, estamos à disposição.\n\n`;
        message += `*NEXBOOK* `;
        
        // Adicionar mensagem personalizada
        if (customMessage) {
            message += `\n\n💬 *Mensagem adicional:*\n${customMessage}`;
        }
        
        // Limpar número
        let phoneNumber = client.phone.replace(/\D/g, '');
        
        // Adicionar código do Brasil
        if (phoneNumber.length === 11) {
            phoneNumber = '55' + phoneNumber;
        } else if (phoneNumber.length === 10) {
            phoneNumber = '55' + phoneNumber;
        } else if (phoneNumber.length === 9) {
            phoneNumber = '5511' + phoneNumber;
        } else if (phoneNumber.length === 8) {
            phoneNumber = '5511' + phoneNumber;
        }
        
        // Registrar log
        await logWhatsAppMessage(appointment.id, client.id, message, phoneNumber);
        
        // Fechar modal
        closeWhatsappModal();
        
        // Abrir WhatsApp
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
        
        showToast('success', 'Sucesso!', 'WhatsApp aberto com a mensagem');
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('error', 'Erro', 'Falha: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/* ============================================
   FORMATAR TELEFONE
   ============================================ */
function formatPhoneNumber(phone) {
    if (!phone) return 'Número não cadastrado';
    
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 13) {
        return numbers.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    } else if (numbers.length === 12) {
        return numbers.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4');
    } else if (numbers.length === 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        return phone;
    }
}

/* ============================================
   REGISTRAR LOG
   ============================================ */
async function logWhatsAppMessage(appointmentId, clientId, message, phoneNumber) {
    try {
        if (!db) return;
        
        const user = auth.currentUser;
        if (!user) return;
        
        await db.collection('whatsapp_logs').add({
            userId: user.uid,
            appointmentId: appointmentId,
            clientId: clientId,
            message: message.substring(0, 200),
            phoneNumber: phoneNumber,
            status: 'sent',
            sentAt: new Date(),
            type: 'reminder'
        });
        
    } catch (error) {
        console.error('Erro ao registrar log:', error);
    }
}

/* ============================================
   TOGGLE MENSAGEM PERSONALIZADA
   ============================================ */
function toggleWhatsappMessage() {
    const checkbox = document.getElementById('whatsappAddMessage');
    const messageField = document.getElementById('whatsappCustomMessageField');
    
    if (checkbox && messageField) {
        messageField.style.display = checkbox.checked ? 'block' : 'none';
    }
}

/* ============================================
   FECHAR MODAIS
   ============================================ */
function closeWhatsappModal() {
    const modal = document.getElementById('whatsappConfirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Limpar campos
    const checkbox = document.getElementById('whatsappAddMessage');
    const messageField = document.getElementById('whatsappCustomMessageField');
    const messageText = document.getElementById('whatsappCustomMessage');
    
    if (checkbox) checkbox.checked = false;
    if (messageField) messageField.style.display = 'none';
    if (messageText) messageText.value = '';
    
    currentAppointmentForWhatsapp = null;
    currentClientForWhatsapp = null;
}

function closeSelectModal() {
    const modal = document.getElementById('whatsappSelectModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/* ============================================
   INICIALIZAR
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    // Fechar modais ao clicar fora
    const confirmModal = document.getElementById('whatsappConfirmModal');
    if (confirmModal) {
        confirmModal.addEventListener('click', function(e) {
            if (e.target === confirmModal) {
                closeWhatsappModal();
            }
        });
    }
    
    const selectModal = document.getElementById('whatsappSelectModal');
    if (selectModal) {
        selectModal.addEventListener('click', function(e) {
            if (e.target === selectModal) {
                closeSelectModal();
            }
        });
    }
});

// EXPOR FUNÇÕES GLOBALMENTE
window.openWhatsAppSelectModal = openWhatsAppSelectModal;
window.filterStudentList = filterStudentList;
window.openWhatsAppModal = openWhatsAppModal;
window.sendWhatsAppReminder = sendWhatsAppReminder;
window.toggleWhatsappMessage = toggleWhatsappMessage;
window.closeWhatsappModal = closeWhatsappModal;
window.closeSelectModal = closeSelectModal;