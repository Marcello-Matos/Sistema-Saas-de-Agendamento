// ============================================
// LOGOUT
// ============================================

// 74. Fazer logout
function logout() {
    auth.signOut().then(() => {
        console.log('Logout realizado com sucesso');
    }).catch(error => {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
    });
}