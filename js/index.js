    /* ══════════════════════════════════════════
       FIREBASE CONFIGURATION
       ══════════════════════════════════════════ */
   
    const firebaseConfig = {
        apiKey: "AIzaSyCCvnw5eBBjUAa0piQ7Njy2t_W4TVZSIwk",
        authDomain: "nexbook-14d69.firebaseapp.com",
        projectId: "nexbook-14d69",
        storageBucket: "nexbook-14d69.firebasestorage.app",
        messagingSenderId: "445301731220",
        appId: "1:445301731220:web:500608bc6903aa8a40e981",
        measurementId: "G-VYH8GSRLZD"
    };

    let auth, db;
    let firebaseReady = false;

    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db   = firebase.firestore();
        firebaseReady = true;
        console.log('🔥 Firebase Auth inicializado');

        // Persistence: remember me
        auth.setPersistence(
            firebase.auth.Auth.Persistence.LOCAL
        ).catch(console.error);

        // Auth state observer
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log('✅ Usuário autenticado:', user.displayName || user.email);
                showToast('success', 'Autenticado!', `Bem-vindo, ${user.displayName || user.email}`);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
            }
        });

    } catch (e) {
        console.warn('⚠️  Firebase não configurado — modo demonstração ativo.');
        firebaseReady = false;
    }

    /* ══════════════════════════════════════════
       THEME
       ══════════════════════════════════════════ */
    function toggleTheme() {
        document.body.classList.toggle('dark');
        const icon = document.getElementById('themeIcon');
        const isDark = document.body.classList.contains('dark');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('nexbook_theme', isDark ? 'dark' : 'light');
    }

    (function initTheme() {
        const saved = localStorage.getItem('nexbook_theme');
        if (saved === 'dark') {
            document.body.classList.add('dark');
            document.getElementById('themeIcon').className = 'fas fa-sun';
        }
    })();

    /* ══════════════════════════════════════════
       TAB SWITCHER
       ══════════════════════════════════════════ */
    function switchTab(tab) {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach((t, i) => {
            t.classList.toggle('active', (tab === 'login' ? i === 0 : i === 1));
        });
        document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
        document.getElementById('forgotPanel').classList.remove('show');
        document.getElementById('loginPanel').style.display = 'block';
    }

    /* ══════════════════════════════════════════
       FORGOT PASSWORD PANEL
       ══════════════════════════════════════════ */
    function showForgot() {
        document.getElementById('loginPanel').style.display = 'none';
        const fp = document.getElementById('forgotPanel');
        fp.classList.add('show');
        fp.style.display = 'block';
    }
    function hideForgot() {
        document.getElementById('forgotPanel').classList.remove('show');
        document.getElementById('forgotPanel').style.display = 'none';
        document.getElementById('loginPanel').style.display  = 'block';
    }

    /* ══════════════════════════════════════════
       VALIDATION HELPERS
       ══════════════════════════════════════════ */
    function setValidIcon(iconId, state) {
        const el = document.getElementById(iconId);
        if (!el) return;
        el.className = 'input-valid-icon';
        if (state === 'ok')  { el.innerHTML = '<i class="fas fa-check-circle"></i>'; el.classList.add('show','ok'); }
        if (state === 'bad') { el.innerHTML = '<i class="fas fa-times-circle"></i>'; el.classList.add('show','bad'); }
        if (!state)          { el.classList.remove('show','ok','bad'); }
    }

    function showFieldError(errId, msg, inputEl) {
        const err = document.getElementById(errId);
        if (err) { err.textContent = msg; err.classList.toggle('show', !!msg); }
        if (inputEl) { inputEl.classList.toggle('error', !!msg); inputEl.classList.toggle('success', !msg && inputEl.value); }
    }

    function isValidEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    }

    function validateLoginEmail(inp) {
        if (!inp.value) { showFieldError('loginEmailErr','',inp); setValidIcon('loginEmailIcon'); return; }
        const ok = isValidEmail(inp.value);
        showFieldError('loginEmailErr', ok ? '' : 'Email inválido.', inp);
        setValidIcon('loginEmailIcon', ok ? 'ok' : 'bad');
    }

    function validateLoginPassword(inp) {
        if (!inp.value) { showFieldError('loginPasswordErr','',inp); return; }
        const ok = inp.value.length >= 6;
        showFieldError('loginPasswordErr', ok ? '' : 'Mínimo 6 caracteres.', inp);
    }

    function validateRegName(inp) {
        updateAvatar(inp.value);
        if (!inp.value) { showFieldError('regNameErr','',inp); setValidIcon('regNameIcon'); return; }
        const ok = inp.value.trim().split(' ').length >= 2 && inp.value.trim().length >= 3;
        showFieldError('regNameErr', ok ? '' : 'Informe nome e sobrenome.', inp);
        setValidIcon('regNameIcon', ok ? 'ok' : 'bad');
    }

    function validateRegEmail(inp) {
        if (!inp.value) { showFieldError('regEmailErr','',inp); setValidIcon('regEmailIcon'); return; }
        const ok = isValidEmail(inp.value);
        showFieldError('regEmailErr', ok ? '' : 'Email inválido.', inp);
        setValidIcon('regEmailIcon', ok ? 'ok' : 'bad');
    }

    function validateConfirm(inp) {
        const pw = document.getElementById('regPassword').value;
        if (!inp.value) { showFieldError('regConfirmErr','',inp); setValidIcon('regConfirmIcon'); return; }
        const ok = inp.value === pw;
        showFieldError('regConfirmErr', ok ? '' : 'As senhas não coincidem.', inp);
        setValidIcon('regConfirmIcon', ok ? 'ok' : 'bad');
    }

    /* Password strength */
    function checkPasswordStrength(inp) {
        const pw = inp.value;
        const bar = document.getElementById('pwStrength');
        const fill = document.getElementById('strengthFill');
        const label = document.getElementById('strengthLabel');

        if (!pw) { bar.classList.remove('show'); return; }
        bar.classList.add('show');

        let score = 0;
        if (pw.length >= 8)  score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        const levels = [
            { pct:'20%', color:'#ef4444', text:'Muito fraca' },
            { pct:'40%', color:'#f97316', text:'Fraca' },
            { pct:'60%', color:'#f59e0b', text:'Moderada' },
            { pct:'80%', color:'#22c55e', text:'Forte' },
            { pct:'100%',color:'#10b981', text:'Muito forte 🔒' },
        ];
        const l = levels[Math.min(score, 4)];
        fill.style.width = l.pct;
        fill.style.background = l.color;
        label.textContent = l.text;
        label.style.color = l.color;

        showFieldError('regPasswordErr', pw.length < 8 ? 'Mínimo 8 caracteres.' : '', inp);
    }

    /* Avatar preview */
    function updateAvatar(name) {
        const av = document.getElementById('regAvatar');
        if (!name.trim()) { av.textContent = '?'; return; }
        const parts = name.trim().split(' ');
        av.textContent = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.trim()[0].toUpperCase();
    }

    /* Toggle password visibility */
    function togglePw(id, btn) {
        const inp = document.getElementById(id);
        const icon = btn.querySelector('i');
        if (inp.type === 'password') {
            inp.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            inp.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /* Enter key on login */
    function handleLoginEnter(e) {
        if (e.key === 'Enter') handleLogin();
    }

    /* ══════════════════════════════════════════
       DEMO FALLBACK (no Firebase configured)
       ══════════════════════════════════════════ */
    function demoLogin(displayName) {
        showToast('success', 'Modo demonstração', `Bem-vindo, ${displayName || 'Usuário'}!`);
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);
    }

    /* ══════════════════════════════════════════
       EMAIL / PASSWORD LOGIN
       ══════════════════════════════════════════ */
    async function handleLogin() {
        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn      = document.getElementById('loginBtn');

        // Basic validation
        let hasErr = false;
        if (!isValidEmail(email)) {
            showFieldError('loginEmailErr', 'Informe um email válido.', document.getElementById('loginEmail'));
            hasErr = true;
        }
        if (password.length < 6) {
            showFieldError('loginPasswordErr', 'Senha muito curta.', document.getElementById('loginPassword'));
            hasErr = true;
        }
        if (hasErr) return;

        // Persistence
        const persist = document.getElementById('rememberMe').checked
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION;

        setLoading(btn, true);

        if (!firebaseReady) { setTimeout(() => { setLoading(btn,false); demoLogin(email.split('@')[0]); }, 1200); return; }

        try {
            if (firebaseReady) await auth.setPersistence(persist);
            await auth.signInWithEmailAndPassword(email, password);
            // onAuthStateChanged handles redirect
        } catch (err) {
            setLoading(btn, false);
            handleAuthError(err);
        }
    }

    /* ══════════════════════════════════════════
       REGISTER
       ══════════════════════════════════════════ */
    async function handleRegister() {
        const name     = document.getElementById('regName').value.trim();
        const email    = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm  = document.getElementById('regConfirm').value;
        const agreed   = document.getElementById('agreeTerms').checked;
        const btn      = document.getElementById('registerBtn');

        let hasErr = false;
        if (!name || name.split(' ').length < 2) {
            showFieldError('regNameErr', 'Informe nome e sobrenome.', document.getElementById('regName'));
            hasErr = true;
        }
        if (!isValidEmail(email)) {
            showFieldError('regEmailErr', 'Email inválido.', document.getElementById('regEmail'));
            hasErr = true;
        }
        if (password.length < 8) {
            showFieldError('regPasswordErr', 'Mínimo 8 caracteres.', document.getElementById('regPassword'));
            hasErr = true;
        }
        if (password !== confirm) {
            showFieldError('regConfirmErr', 'Senhas não coincidem.', document.getElementById('regConfirm'));
            hasErr = true;
        }
        if (!agreed) {
            showToast('warn', 'Atenção', 'Você precisa aceitar os Termos de Uso.');
            hasErr = true;
        }
        if (hasErr) return;

        setLoading(btn, true);

        if (!firebaseReady) {
            setTimeout(() => { setLoading(btn,false); demoLogin(name); }, 1400);
            return;
        }

        try {
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });
            // Save profile to Firestore
            if (db) {
                await db.collection('users').doc(cred.user.uid).set({
                    displayName: name,
                    email,
                    plan: 'free',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            showToast('success', 'Conta criada!', 'Bem-vindo ao NEXBOOK 🎉');
            // onAuthStateChanged handles redirect
        } catch (err) {
            setLoading(btn, false);
            handleAuthError(err);
        }
    }

    /* ══════════════════════════════════════════
       FORGOT PASSWORD
       ══════════════════════════════════════════ */
    async function handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        const btn   = document.getElementById('forgotBtn');

        if (!isValidEmail(email)) {
            showFieldError('forgotEmailErr', 'Informe um email válido.', document.getElementById('forgotEmail'));
            return;
        }

        setLoading(btn, true);

        if (!firebaseReady) {
            setTimeout(() => {
                setLoading(btn, false);
                showToast('info', 'Demo', 'Link de redefinição enviado (simulação).');
                hideForgot();
            }, 1200);
            return;
        }

        try {
            await auth.sendPasswordResetEmail(email);
            setLoading(btn, false);
            showToast('success', 'Email enviado!', `Verifique a caixa de ${email}`);
            setTimeout(hideForgot, 2500);
        } catch (err) {
            setLoading(btn, false);
            handleAuthError(err);
        }
    }

    /* ══════════════════════════════════════════
       SOCIAL PROVIDERS - APENAS GOOGLE E GITHUB
       ══════════════════════════════════════════ */
    async function signInWithGoogle() {
        if (!firebaseReady) { demoLogin('Usuário Google'); return; }
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        try {
            await auth.signInWithPopup(provider);
        } catch (err) { handleAuthError(err); }
    }

    async function signInWithGitHub() {
        if (!firebaseReady) { demoLogin('Usuário GitHub'); return; }
        const provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('user:email');
        try {
            await auth.signInWithPopup(provider);
        } catch (err) { handleAuthError(err); }
    }

    /* ══════════════════════════════════════════
       ERROR HANDLER
       ══════════════════════════════════════════ */
    function handleAuthError(err) {
        const map = {
            'auth/user-not-found':         'Usuário não encontrado.',
            'auth/wrong-password':         'Senha incorreta.',
            'auth/invalid-email':          'Email inválido.',
            'auth/email-already-in-use':   'Este email já está em uso.',
            'auth/weak-password':          'Senha muito fraca (mín. 6 caracteres).',
            'auth/too-many-requests':      'Muitas tentativas. Aguarde e tente novamente.',
            'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
            'auth/popup-closed-by-user':   'Login cancelado.',
            'auth/account-exists-with-different-credential':
                                           'Email já cadastrado com outro método de login.',
            'auth/invalid-credential':     'Credencial inválida. Tente novamente.',
        };
        const msg = map[err.code] || `Erro: ${err.message}`;
        showToast('error', 'Falha no acesso', msg);
        console.error(err);
    }

    /* ══════════════════════════════════════════
       LOADING STATE
       ══════════════════════════════════════════ */
    function setLoading(btn, state) {
        btn.classList.toggle('loading', state);
        btn.disabled = state;
    }

    /* ══════════════════════════════════════════
       TOAST SYSTEM
       ══════════════════════════════════════════ */
    function showToast(type, title, message, duration = 4500) {
        const icons = { success:'fa-check-circle', error:'fa-times-circle', warn:'fa-exclamation-triangle', info:'fa-info-circle' };
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></span>
            <div class="toast-body">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity .4s, transform .4s';
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(24px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    /* ══════════════════════════════════════════
       KEYBOARD SHORTCUTS
       ══════════════════════════════════════════ */
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const active = document.activeElement;
            if (active && active.id === 'forgotEmail') handleForgotPassword();
        }
    });



    // Adicione no script.js
async function testNotification() {
    if (!currentUserId) return;
    
    // Buscar o último agendamento
    const snapshot = await db.collection('appointments')
        .where('userId', '==', currentUserId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
    
    if (snapshot.empty) {
        alert('Crie um agendamento primeiro');
        return;
    }
    
    const appointment = snapshot.docs[0];
    
    // Chamar nossa função de teste HTTP
    try {
        const response = await fetch('https://us-central1-nexbook-14d69.cloudfunctions.net/testEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appointmentId: appointment.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('✅ Notificação de teste simulada com sucesso!');
        } else {
            showToast('❌ Erro: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao testar notificação', 'error');
    }
}