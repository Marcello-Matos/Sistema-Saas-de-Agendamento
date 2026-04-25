/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       FIREBASE CONFIGURATION
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
   
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
// â”€â”€ Controle de Acesso / Paywall â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ADMIN_UIDS = ["Nrq4TYVDGsfboHOPDx7csCF0QSi2","O525l43Yzxatu5ckI7k8J1VLfjU2","SpygmGopNAXhban8lTi8JaBvAoG2","pZQbVSQkaid4lYSTDcNarjZTUHl1","tx3jN29YGcUzDu2kLGlErI86CgW2"];

async function checkSubscriptionAndRedirect(user) {
    if (!user) { window.location.href = 'index.html'; return; }
    if (ADMIN_UIDS.includes(user.uid)) { window.location.href = 'dashboard.html'; return; }
    try {
        const db = firebase.firestore();
        // Verificar se eh funcionario criado pelo admin (tem createdBy)
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().createdBy) {
            window.location.href = 'dashboard.html'; return;
        }

        // Garantir trial automatico no primeiro acesso
        let trialCreated = false;
        try {
            const fn = firebase.app().functions('southamerica-east1');
            const result = await fn.httpsCallable('ensureTrialAccess')({});
            trialCreated = result.data && result.data.trialCreated;
        } catch (trialError) {
            console.warn('ensureTrialAccess error:', trialError);
        }

        // Se o trial foi criado agora, vai direto pro dashboard
        if (trialCreated) {
            window.location.href = 'dashboard.html';
            return;
        }

        const doc = await db.collection('subscriptions').doc(user.uid).get();
        if (doc.exists) {
            const sub = doc.data();
            const now = new Date();
            const exp = sub.expiresAt && sub.expiresAt.toDate ? sub.expiresAt.toDate() : new Date(0);
            if (sub.status === 'active' && exp > now) {
                window.location.href = 'dashboard.html'; return;
            }
        }
        window.location.href = 'pagamento.html?uid=' + user.uid + '&email=' + encodeURIComponent(user.email || '');
    } catch(e) {
        console.error('checkSubscription error:', e);
        window.location.href = 'dashboard.html';
    }
}
        auth = firebase.auth();
        db   = firebase.firestore();
        firebaseReady = true;
        console.log('ðŸ”¥ Firebase Auth inicializado');

        // Persistence: remember me
        auth.setPersistence(
            firebase.auth.Auth.Persistence.LOCAL
        ).catch(console.error);

        // Auth state observer
        // FIX #1: Adicionado guard para evitar loop de redirect no dashboard
        auth.onAuthStateChanged(async (user) => {
            if (user && !window.location.pathname.includes('dashboard')) {
                console.log('âœ… UsuÃ¡rio autenticado:', user.displayName || user.email);
                showToast('success', 'Autenticado!', `Bem-vindo, ${user.displayName || user.email}`);
                checkSubscriptionAndRedirect(user);


            }
        });

    } catch (e) {
        console.warn('âš ï¸  Firebase nÃ£o configurado â€” modo demonstraÃ§Ã£o ativo.');
        firebaseReady = false;
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       THEME
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       TAB SWITCHER
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       FORGOT PASSWORD PANEL
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       VALIDATION HELPERS
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
        showFieldError('loginEmailErr', ok ? '' : 'Email invÃ¡lido.', inp);
        setValidIcon('loginEmailIcon', ok ? 'ok' : 'bad');
    }

    function validateLoginPassword(inp) {
        if (!inp.value) { showFieldError('loginPasswordErr','',inp); return; }
        const ok = inp.value.length >= 6;
        showFieldError('loginPasswordErr', ok ? '' : 'MÃ­nimo 6 caracteres.', inp);
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
        showFieldError('regEmailErr', ok ? '' : 'Email invÃ¡lido.', inp);
        setValidIcon('regEmailIcon', ok ? 'ok' : 'bad');
    }

    function validateConfirm(inp) {
        const pw = document.getElementById('regPassword').value;
        if (!inp.value) { showFieldError('regConfirmErr','',inp); setValidIcon('regConfirmIcon'); return; }
        const ok = inp.value === pw;
        showFieldError('regConfirmErr', ok ? '' : 'As senhas nÃ£o coincidem.', inp);
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
            { pct:'100%',color:'#10b981', text:'Muito forte ðŸ”’' },
        ];
        const l = levels[Math.min(score, 4)];
        fill.style.width = l.pct;
        fill.style.background = l.color;
        label.textContent = l.text;
        label.style.color = l.color;

        showFieldError('regPasswordErr', pw.length < 8 ? 'MÃ­nimo 8 caracteres.' : '', inp);
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

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       DEMO FALLBACK (no Firebase configured)
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    function demoLogin(displayName) {
        showToast('success', 'Modo demonstraÃ§Ã£o', `Bem-vindo, ${displayName || 'UsuÃ¡rio'}!`);
        setTimeout(async () => {
            await checkSubscriptionAndRedirect(user);
        }, 1400);
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       EMAIL / PASSWORD LOGIN
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    async function handleLogin() {
        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn      = document.getElementById('loginBtn');

        // Basic validation
        let hasErr = false;
        if (!isValidEmail(email)) {
            showFieldError('loginEmailErr', 'Informe um email vÃ¡lido.', document.getElementById('loginEmail'));
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
            await auth.setPersistence(persist);
            await auth.signInWithEmailAndPassword(email, password);
            // onAuthStateChanged handles redirect
        } catch (err) {
            setLoading(btn, false);
            handleAuthError(err);
        }
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       REGISTER
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
            showFieldError('regEmailErr', 'Email invÃ¡lido.', document.getElementById('regEmail'));
            hasErr = true;
        }
        if (password.length < 8) {
            showFieldError('regPasswordErr', 'MÃ­nimo 8 caracteres.', document.getElementById('regPassword'));
            hasErr = true;
        }
        if (password !== confirm) {
            showFieldError('regConfirmErr', 'Senhas nÃ£o coincidem.', document.getElementById('regConfirm'));
            hasErr = true;
        }
        if (!agreed) {
            showToast('warn', 'AtenÃ§Ã£o', 'VocÃª precisa aceitar os Termos de Uso.');
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
            showToast('success', 'Conta criada!', 'Bem-vindo ao NEXBOOK ðŸŽ‰');
            // onAuthStateChanged handles redirect
        } catch (err) {
            setLoading(btn, false);
            handleAuthError(err);
        }
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       FORGOT PASSWORD
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    async function handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        const btn   = document.getElementById('forgotBtn');

        if (!isValidEmail(email)) {
            showFieldError('forgotEmailErr', 'Informe um email vÃ¡lido.', document.getElementById('forgotEmail'));
            return;
        }

        setLoading(btn, true);

        if (!firebaseReady) {
            setTimeout(() => {
                setLoading(btn, false);
                showToast('info', 'Demo', 'Link de redefiniÃ§Ã£o enviado (simulaÃ§Ã£o).');
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

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       SOCIAL PROVIDERS - APENAS GOOGLE E GITHUB
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    async function signInWithGoogle() {
        if (!firebaseReady) { demoLogin('UsuÃ¡rio Google'); return; }
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        try {
            await auth.signInWithPopup(provider);
        } catch (err) { handleAuthError(err); }
    }

    async function signInWithGitHub() {
        if (!firebaseReady) { demoLogin('UsuÃ¡rio GitHub'); return; }
        const provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('user:email');
        try {
            await auth.signInWithPopup(provider);
        } catch (err) { handleAuthError(err); }
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       ERROR HANDLER
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    function handleAuthError(err) {
        const map = {
            'auth/user-not-found':         'UsuÃ¡rio nÃ£o encontrado.',
            'auth/wrong-password':         'Senha incorreta.',
            'auth/invalid-email':          'Email invÃ¡lido.',
            'auth/email-already-in-use':   'Este email jÃ¡ estÃ¡ em uso.',
            'auth/weak-password':          'Senha muito fraca (mÃ­n. 6 caracteres).',
            'auth/too-many-requests':      'Muitas tentativas. Aguarde e tente novamente.',
            'auth/network-request-failed': 'Sem conexÃ£o. Verifique sua internet.',
            'auth/popup-closed-by-user':   'Login cancelado.',
            'auth/account-exists-with-different-credential':
                                           'Email jÃ¡ cadastrado com outro mÃ©todo de login.',
            'auth/invalid-credential':     'Credencial invÃ¡lida. Tente novamente.',
        };
        const msg = map[err.code] || `Erro: ${err.message}`;
        showToast('error', 'Falha no acesso', msg);
        console.error(err);
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       LOADING STATE
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    function setLoading(btn, state) {
        btn.classList.toggle('loading', state);
        btn.disabled = state;
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       TOAST SYSTEM
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
            <button class="toast-close" onclick="this.parentElement.remove()">Ã—</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity .4s, transform .4s';
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(24px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       KEYBOARD SHORTCUTS
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const active = document.activeElement;
            if (active && active.id === 'forgotEmail') handleForgotPassword();
        }
    });

    /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       TEST NOTIFICATION
       FIX #2: currentUserId buscado do auth.currentUser
       FIX #3: showToast chamado com assinatura correta (type, title, message)
       FIX #4: chave } solta removida
       â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
    async function testNotification() {
        // FIX #2: usar auth.currentUser em vez de variÃ¡vel inexistente
        const currentUserId = auth && auth.currentUser ? auth.currentUser.uid : null;

        if (!currentUserId) {
            showToast('warn', 'AtenÃ§Ã£o', 'VocÃª precisa estar logado para testar notificaÃ§Ãµes.');
            return;
        }

        // Buscar o Ãºltimo agendamento
        let snapshot;
        try {
            snapshot = await db.collection('appointments')
                .where('userId', '==', currentUserId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();
        } catch (err) {
            showToast('error', 'Erro', 'Falha ao buscar agendamentos: ' + err.message);
            return;
        }

        if (snapshot.empty) {
            showToast('warn', 'AtenÃ§Ã£o', 'Crie um agendamento primeiro.');
            return;
        }

        const appointment = snapshot.docs[0];

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

            // FIX #3: assinatura correta de showToast (type, title, message)
            if (result.success) {
                showToast('success', 'Sucesso', 'NotificaÃ§Ã£o de teste simulada com sucesso!');
            } else {
                showToast('error', 'Erro', result.error || 'Erro desconhecido.');
            }
        } catch (error) {
            console.error('Erro:', error);
            showToast('error', 'Erro', 'Falha ao testar notificaÃ§Ã£o: ' + error.message);
        }
    }
    // FIX #4: chave } solta que existia aqui foi removida
