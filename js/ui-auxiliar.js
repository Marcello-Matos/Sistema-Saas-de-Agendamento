// ============================================
// FUNÇÕES AUXILIARES DE UI
// ============================================

// 33. Atualizar interface do usuário
function updateUserInterface(user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'Admin';
    document.getElementById('userNameDisplay').textContent = displayName;
    
    let initials = displayName.substring(0, 2).toUpperCase();
    document.getElementById('userAvatar').textContent = initials;
}

// 34. Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 35. Obter ícone do status
function getStatusIcon(status) {
    const icons = {
        'confirmed': 'fas fa-check-circle',
        'attended': 'fas fa-check-double',
        'pending': 'fas fa-clock',
        'absent': 'fas fa-times-circle',
        'cancelled': 'fas fa-ban'
    };
    return icons[status] || 'fas fa-calendar';
}

// 36. Obter texto do status
function getStatusText(status) {
    const texts = {
        'confirmed': 'Confirmado',
        'attended': 'Compareceu',
        'pending': 'Pendente',
        'absent': 'Faltou',
        'cancelled': 'Cancelado'
    };
    return texts[status] || status;
}

// 37. Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `google-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}


// ============================================
// FUNÇÕES DE UI
// ============================================

// 61. Alternar tema claro/escuro
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.getElementById('themeIcon');
    icon.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// 62. Carregar tema salvo
function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeIcon').className = 'fas fa-sun';
    }
}

// 63. Abrir/fechar dropdown do usuário
function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Event listener para fechar dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const user = document.querySelector('.user');
    if (!user?.contains(e.target) && !dropdown?.contains(e.target)) {
        dropdown?.classList.remove('show');
    }
});

// 64. Visualizar perfil
function viewProfile() {
    alert('Perfil do usuário');
    toggleUserDropdown();
}

// 65. Ir para configurações
function viewSettings() {
    document.querySelector('[data-view="settings"]').click();
    toggleUserDropdown();
}

// 66. Editar configuração
function editSetting(setting) {
    alert('Função em desenvolvimento: ' + setting);
}

// 67. Salvar configuração
function saveSetting(setting, value) {
    console.log('Salvando configuração:', setting, value);
    localStorage.setItem(setting, value);
}

// 68. Integrar com Google
function integrateGoogle() {
    alert('Integração com Google Calendar em desenvolvimento');
}

// 69. Configurar pagamentos
function setupPayments() {
    alert('Configuração de pagamentos em desenvolvimento');
}

// 70. Manipular mudança de período
function handlePeriodChange() {
    const customRange = document.getElementById('customDateRange');
    if (customRange) {
        customRange.style.display = document.getElementById('periodFilter')?.value === 'custom' ? 'flex' : 'none';
    }
    applyFilters();
}

// 71. Aplicar filtros
function applyFilters() {
    loadDashboardData();
}