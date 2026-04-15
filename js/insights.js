// ============================================================
// NEXBOOK — Insights Inteligentes & Melhorias UX
// ============================================================

// Contadores Animados
function animateCounter(el, target, prefix, suffix, duration) {
    if (!el) return;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = prefix + target.toLocaleString('pt-BR') + suffix;
    }
    requestAnimationFrame(update);
}

function animateCurrency(el, target, duration) {
    if (!el) return;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = ease * target;
        el.textContent = 'R$ ' + current.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

window.triggerStatAnimations = function() {
    const todayEl = document.getElementById('todayCount');
    const revenueEl = document.getElementById('revenueValue');
    const attendanceEl = document.getElementById('attendanceValue');
    const clientsEl = document.getElementById('clientsValue');
    if (todayEl) { const v = parseInt(todayEl.textContent) || 0; animateCounter(todayEl, v, '', '', 900); }
    if (attendanceEl) { const v = parseInt(attendanceEl.textContent) || 0; animateCounter(attendanceEl, v, '', '', 900); }
    if (clientsEl) { const v = parseInt(clientsEl.textContent) || 0; animateCounter(clientsEl, v, '', '', 900); }
    if (revenueEl) { const raw = revenueEl.textContent.replace(/[^\d]/g, ''); const v = parseInt(raw) || 0; animateCurrency(revenueEl, v, 900); }
};

function updateNotificationBadge(count) {
    const notifEl = document.querySelector('.notification');
    if (!notifEl) return;
    let badge = notifEl.querySelector('.notif-badge');
    if (count > 0) {
        if (!badge) { badge = document.createElement('span'); badge.className = 'notif-badge'; notifEl.appendChild(badge); }
        badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) { badge.remove(); }
}

window.generateInsights = async function(data) {
    const list = document.getElementById('insightsList');
    const actionsList = document.getElementById('actionsList');
    if (!list || !actionsList) return;
    const { todayCount=0, totalClients=0, revenueRaw=0, inactiveClients=0, stoppedAppointments=0, upcomingToday=0 } = data;
    const insights = [];
    const actions = [];
    let notifCount = 0;

    if (inactiveClients > 0) {
        insights.push({ type: 'warning', text: '<strong>' + inactiveClients + ' cliente' + (inactiveClients>1?'s':'') + '</strong> sem agendamento ha mais de 30 dias', action: 'Ver clientes', view: 'clients' });
        actions.push({ icon: 'clipboard', text: 'Entrar em contato com ' + inactiveClients + ' cliente' + (inactiveClients>1?'s inativos':' inativo'), view: 'clients' });
        if (inactiveClients > 3) notifCount++;
    }
    if (stoppedAppointments > 3) {
        insights.push({ type: 'danger', text: '<strong>' + stoppedAppointments + ' agendamentos</strong> parados ha mais de 7 dias', action: 'Ver calendario', view: 'calendar' });
        notifCount++;
    }
    if (upcomingToday > 0) {
        insights.push({ type: 'info', text: 'Voce tem <strong>' + upcomingToday + ' agendamento' + (upcomingToday>1?'s':'') + '</strong> para hoje' });
        actions.push({ icon: 'calendar-alt', text: 'Confirmar ' + upcomingToday + ' agendamento' + (upcomingToday>1?'s':'') + ' de hoje', view: 'calendar' });
    }
    if (totalClients > 0 && todayCount === 0) {
        insights.push({ type: 'warning', text: 'Nenhum agendamento hoje — considere enviar lembretes via <strong>WhatsApp</strong>' });
        actions.push({ icon: 'comment-dots', text: 'Enviar lembrete WhatsApp', onclick: 'openWhatsAppSelectModal()' });
        notifCount++;
    }
    if (revenueRaw > 0) {
        insights.push({ type: 'success', text: 'Faturamento do periodo: <strong>R$ ' + revenueRaw.toLocaleString('pt-BR') + '</strong>' });
    } else if (totalClients > 0) {
        insights.push({ type: 'tip', text: 'Nenhum faturamento registrado — verifique se os valores dos servicos estao configurados' });
        actions.push({ icon: 'cog', text: 'Configurar valores dos servicos', view: 'services' });
    }
    if (totalClients === 0) {
        insights.push({ type: 'tip', text: 'Cadastre seu primeiro cliente para comecar a usar o sistema completo' });
        actions.push({ icon: 'user-plus', text: 'Cadastrar primeiro cliente', onclick: "openModal('client')" });
    }
    actions.push({ icon: 'chart-bar', text: 'Gerar relatorio do periodo', view: 'reports' });
    actions.push({ icon: 'plus-circle', text: 'Criar novo agendamento', onclick: "openModal('appointment')" });

    const iconMap = { success:'check-circle', warning:'exclamation-triangle', danger:'times-circle', info:'info-circle', tip:'lightbulb' };
    const colorMap = { success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)', info:'var(--info)', tip:'#f59e0b' };

    if (insights.length === 0) {
        list.innerHTML = '<div class="insight-item insight-success"><i class="fas fa-check-circle" style="color:var(--success)"></i><span>Tudo em ordem! Seu negocio esta saudavel.</span></div>';
    } else {
        list.innerHTML = insights.map(ins => '<div class="insight-item insight-' + ins.type + '"><div class="insight-left"><i class="fas fa-' + iconMap[ins.type] + '" style="color:' + colorMap[ins.type] + '"></i><span>' + ins.text + '</span></div>' + (ins.action ? '<button class="insight-action-btn" onclick="navigateTo(\'' + ins.view + '\')">' + ins.action + '</button>' : '') + '</div>').join('');
    }
    actionsList.innerHTML = actions.map(act => '<div class="action-item" onclick="' + (act.onclick ? act.onclick : "navigateTo('" + act.view + "')") + '"><span class="action-icon-fa"><i class="fas fa-' + act.icon + '"></i></span><span class="action-text">' + act.text + '</span><i class="fas fa-chevron-right action-arrow"></i></div>').join('');
    updateNotificationBadge(notifCount);
};

function navigateTo(view) {
    const item = document.querySelector('[data-view="' + view + '"]');
    if (item) item.click();
}

function updateStatCardColors() {
    document.querySelectorAll('.stat-comparison').forEach(el => {
        const textContent = el.textContent;
        el.classList.remove('stat-comp-positive', 'stat-comp-negative');
        if (textContent.includes('+')) el.classList.add('stat-comp-positive');
        else if (textContent.includes('-')) el.classList.add('stat-comp-negative');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const dashView = document.getElementById('dashboardView');
    if (!dashView) return;

    // Painel de insights
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'insights-row';
    insightsContainer.innerHTML = `
        <div id="insightsPanel" class="insights-panel">
            <div class="insights-header">
                <div class="insights-title"><i class="fas fa-brain"></i><span>Insights Inteligentes</span></div>
                <span class="insights-badge">IA</span>
            </div>
            <div class="insights-list" id="insightsList">
                <div class="insight-loading"><i class="fas fa-circle-notch fa-spin"></i> Analisando dados...</div>
            </div>
        </div>
        <div id="nextActionsPanel" class="next-actions-panel">
            <div class="next-actions-header">
                <div class="next-actions-title"><i class="fas fa-tasks"></i><span>Proximas Acoes</span></div>
            </div>
            <div class="actions-list" id="actionsList">
                <div class="insight-loading"><i class="fas fa-circle-notch fa-spin"></i> Carregando...</div>
            </div>
        </div>
    `;

    const chartsGrid = dashView.querySelector('.charts-grid');
    if (chartsGrid) chartsGrid.parentNode.insertBefore(insightsContainer, chartsGrid);
    else dashView.appendChild(insightsContainer);

    setTimeout(() => {
        const il = document.getElementById('insightsList');
        if (il && il.querySelector('.insight-loading')) {
            generateInsights({ todayCount: 0, totalClients: 0, revenueRaw: 0, inactiveClients: 0 });
        }
    }, 6000);

    setTimeout(updateStatCardColors, 3000);
});
