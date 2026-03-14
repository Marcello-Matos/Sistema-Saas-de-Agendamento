// ============================================
// FUNÇÕES DE CARREGAMENTO
// ============================================

// 18. Carregar todos os dados iniciais
async function loadAllData() {
    if (!currentUserId) return;
    
    await Promise.all([
        loadDashboardData(),
        loadProfessionals(),
        loadServices(),
        loadClients(),
        loadFilters()
    ]);
}