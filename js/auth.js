// ============================================
// AUTH STATE
// ============================================

// 73. Monitorar estado da autenticação
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        currentUserId = user.uid;
        
        document.querySelector('.main').style.display = 'flex';
        document.querySelector('.sidebar').style.display = 'flex';
        
        updateUserInterface(user);
        loadAllData();
        initializeCalendar();
        adjustTablesForMobile();
        
        // Carregar cores salvas
        loadSavedColors();
    } else {
        currentUser = null;
        currentUserId = null;
        
        window.location.href = 'index.html';
    }
});