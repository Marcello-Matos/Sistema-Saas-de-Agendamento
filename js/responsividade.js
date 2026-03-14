// ============================================
// FUNÇÕES DE RESPONSIVIDADE
// ============================================

// 11. Abrir/fechar sidebar no mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
        isMobileSidebarOpen = sidebar.classList.contains('mobile-open');
        toggleBtn.innerHTML = isMobileSidebarOpen ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

// 12. Ajustar tabelas para mobile
function adjustTablesForMobile() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('table').forEach(table => {
            table.classList.add('mobile-table');
        });
    } else {
        document.querySelectorAll('table').forEach(table => {
            table.classList.remove('mobile-table');
        });
    }
}

// Event listeners de responsividade
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            document.getElementById('sidebarToggle').innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

window.addEventListener('resize', function() {
    adjustTablesForMobile();
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('mobile-open');
        document.getElementById('sidebarToggle').innerHTML = '<i class="fas fa-bars"></i>';
    }
});