// ============================================
// VERIFICAR SE USUÁRIO TEM PLANO ATIVO
// ============================================

// 83. Verificar plano do usuário
async function checkUserPlan() {
    if (!currentUserId) return;
    
    try {
        const userDoc = await db.collection('users').doc(currentUserId).get();
        const userData = userDoc.data();
        
        if (!userData) return true;
        
        const dataCriacao = new Date(userData.createdAt);
        const diasTeste = 7;
        const dataExpiracaoTeste = new Date(dataCriacao.getTime() + diasTeste * 24 * 60 * 60 * 1000);
        const hoje = new Date();
        
        if (!userData.plano && hoje > dataExpiracaoTeste) {
            window.location.href = 'planos.html';
            return false;
        }
        
        if (userData.plano && userData.dataExpiracao) {
            const expiracao = new Date(userData.dataExpiracao);
            if (hoje > expiracao) {
                window.location.href = 'planos.html?expired=true';
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao verificar plano:', error);
        return true;
    }
}

// 84. Auth state com verificação de plano
auth.onAuthStateChanged(async user => {
    if (user) {
        currentUser = user;
        currentUserId = user.uid;
        
        const temAcesso = await checkUserPlan();
        if (temAcesso) {
            document.querySelector('.main').style.display = 'flex';
            document.querySelector('.sidebar').style.display = 'flex';
            updateUserInterface(user);
            loadAllData();
            initializeCalendar();
        }
    } else {
        window.location.href = 'index.html';
    }
});