// ============================================
// FUNÇÕES DE CORES - CORRIGIDAS PARA O CSS
// ============================================

// Cores padrão do sistema - usando as variáveis do CSS
const defaultColors = {
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f5f9',
    bgCard: '#ffffff',
    borderColor: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    nexbookPrimary: '#D91828',
    nexbookSecondary: '#D91414',
    nexbookDark: '#591218',
    nexbookDeep: '#8C0D0D',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
};

// Carregar cores salvas
function loadSavedColors() {
    try {
        const saved = localStorage.getItem('nexbook_colors');
        if (saved) {
            const colors = JSON.parse(saved);
            applyColorsToCSS(colors);
            return colors;
        }
    } catch (e) {
        console.error('Erro ao carregar cores:', e);
    }
    return defaultColors;
}

// Aplicar cores ao CSS - CORRIGIDO para usar as variáveis do seu CSS
function applyColorsToCSS(colors) {
    const root = document.documentElement;
    
    // Cores NEXBOOK (principais)
    root.style.setProperty('--nexbook-primary', colors.nexbookPrimary);
    root.style.setProperty('--nexbook-secondary', colors.nexbookSecondary);
    root.style.setProperty('--nexbook-dark', colors.nexbookDark);
    root.style.setProperty('--nexbook-deep', colors.nexbookDeep);
    
    // Atualizar gradiente NEXBOOK
    root.style.setProperty('--nexbook-gradient', `linear-gradient(135deg, ${colors.nexbookPrimary}, ${colors.nexbookSecondary}, ${colors.nexbookDeep})`);
    root.style.setProperty('--nexbook-gradient-totalpass', `linear-gradient(135deg, ${colors.nexbookPrimary}, ${colors.nexbookDeep})`);
    root.style.setProperty('--nexbook-gradient-wellhub', `linear-gradient(135deg, ${colors.nexbookSecondary}, ${colors.nexbookDark})`);
    
    // Cor de fundo suave
    root.style.setProperty('--nexbook-soft', adjustColor(colors.nexbookPrimary, 40) + '20');
    
    // Cores de fundo
    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--bg-card', colors.bgCard);
    root.style.setProperty('--bg-card-hover', adjustColor(colors.bgCard, -10));
    root.style.setProperty('--hover-bg', colors.bgTertiary);
    
    // Cores de borda
    root.style.setProperty('--border-color', colors.borderColor);
    
    // Cores de texto
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-tertiary', colors.textTertiary);
    root.style.setProperty('--text-muted', colors.textMuted);
    
    // Cores de status
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--danger', colors.danger);
    root.style.setProperty('--info', colors.info);
    
    // Cores de status com transparência
    root.style.setProperty('--success-light', colors.success + '20');
    root.style.setProperty('--warning-light', colors.warning + '20');
    root.style.setProperty('--danger-light', colors.danger + '20');
    root.style.setProperty('--info-light', colors.info + '20');
    
    // Shadows (baseadas na cor primária)
    root.style.setProperty('--shadow', `0 4px 6px -1px ${colors.nexbookPrimary}20, 0 2px 4px -1px ${colors.nexbookPrimary}10`);
    root.style.setProperty('--shadow-lg', `0 10px 15px -3px ${colors.nexbookPrimary}30, 0 4px 6px -2px ${colors.nexbookPrimary}20`);
    
    // Salvar no localStorage
    localStorage.setItem('nexbook_colors', JSON.stringify(colors));
    
    // Atualizar gráficos com novas cores
    updateAllChartsColors(colors);
}

// Ajustar cor (clarear/escurecer) - MANTIDO
function adjustColor(hex, percent) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Verificar se cor é clara - MANTIDO
function isColorLight(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

// Abrir modal de design - ATUALIZADO com as novas variáveis
function openDesignModal() {
    const modal = document.getElementById('designModal');
    if (!modal) return;
    
    const currentColors = loadSavedColors();
    
    modal.style.display = 'flex';
    
    // Inicializar color pickers
    setTimeout(() => {
        // Primary Color (nexbookPrimary)
        if (!primaryPicker) {
            primaryPicker = Pickr.create({
                el: '#primaryColorPicker',
                theme: 'classic',
                default: currentColors.nexbookPrimary,
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: false,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        input: true,
                        clear: false,
                        save: true
                    }
                }
            });
            
            primaryPicker.on('save', (color) => {
                const hex = color.toHEXA().toString();
                document.getElementById('primaryColorInput').value = hex;
                updateColor('nexbookPrimary', hex);
            });
        } else {
            primaryPicker.setColor(currentColors.nexbookPrimary);
        }
        
        // Secondary Color (nexbookSecondary)
        if (!secondaryPicker) {
            secondaryPicker = Pickr.create({
                el: '#secondaryColorPicker',
                theme: 'classic',
                default: currentColors.nexbookSecondary,
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: false,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        input: true,
                        clear: false,
                        save: true
                    }
                }
            });
            
            secondaryPicker.on('save', (color) => {
                const hex = color.toHEXA().toString();
                document.getElementById('secondaryColorInput').value = hex;
                updateColor('nexbookSecondary', hex);
            });
        } else {
            secondaryPicker.setColor(currentColors.nexbookSecondary);
        }
        
        // Background Color (bgPrimary)
        if (!backgroundPicker) {
            backgroundPicker = Pickr.create({
                el: '#backgroundColorPicker',
                theme: 'classic',
                default: currentColors.bgPrimary,
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: false,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        input: true,
                        clear: false,
                        save: true
                    }
                }
            });
            
            backgroundPicker.on('save', (color) => {
                const hex = color.toHEXA().toString();
                document.getElementById('backgroundColorInput').value = hex;
                updateColor('bgPrimary', hex);
            });
        } else {
            backgroundPicker.setColor(currentColors.bgPrimary);
        }
        
        // Success Color
        if (!successPicker) {
            successPicker = Pickr.create({
                el: '#successColorPicker',
                theme: 'classic',
                default: currentColors.success,
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: false,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        input: true,
                        clear: false,
                        save: true
                    }
                }
            });
            
            successPicker.on('save', (color) => {
                const hex = color.toHEXA().toString();
                document.getElementById('successColorInput').value = hex;
                updateColor('success', hex);
            });
        } else {
            successPicker.setColor(currentColors.success);
        }
        
        // Atualizar inputs
        document.getElementById('primaryColorInput').value = currentColors.nexbookPrimary;
        document.getElementById('secondaryColorInput').value = currentColors.nexbookSecondary;
        document.getElementById('backgroundColorInput').value = currentColors.bgPrimary;
        document.getElementById('successColorInput').value = currentColors.success;
    }, 100);
}

// Fechar modal de design - MANTIDO
function closeDesignModal() {
    const modal = document.getElementById('designModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Atualizar cor específica - CORRIGIDO
function updateColor(type, hex) {
    const currentColors = loadSavedColors();
    currentColors[type] = hex;
    applyColorsToCSS(currentColors);
}

// Resetar cores para o padrão - CORRIGIDO
function resetDesignColors() {
    if (confirm('Tem certeza que deseja resetar todas as cores para o padrão?')) {
        applyColorsToCSS(defaultColors);
        
        // Atualizar pickers
        if (primaryPicker) primaryPicker.setColor(defaultColors.nexbookPrimary);
        if (secondaryPicker) secondaryPicker.setColor(defaultColors.nexbookSecondary);
        if (backgroundPicker) backgroundPicker.setColor(defaultColors.bgPrimary);
        if (successPicker) successPicker.setColor(defaultColors.success);
        
        // Atualizar inputs
        document.getElementById('primaryColorInput').value = defaultColors.nexbookPrimary;
        document.getElementById('secondaryColorInput').value = defaultColors.nexbookSecondary;
        document.getElementById('backgroundColorInput').value = defaultColors.bgPrimary;
        document.getElementById('successColorInput').value = defaultColors.success;
        
        showNotification('Cores resetadas com sucesso!', 'success');
    }
}

// Salvar design - MANTIDO
function saveDesignColors() {
    closeDesignModal();
    showNotification('Design salvo com sucesso!', 'success');
}

// Atualizar cores de todos os gráficos - CORRIGIDO
function updateAllChartsColors(colors) {
    // Gráfico de agendamentos
    if (appointmentsChart) {
        appointmentsChart.updateOptions({
            colors: [colors.success, colors.danger],
            grid: { borderColor: colors.borderColor }
        });
    }
    
    // Gráfico de planos
    if (servicesChart) {
        servicesChart.updateOptions({
            colors: [colors.nexbookPrimary, colors.nexbookSecondary, colors.success, colors.warning, colors.danger],
            tooltip: { theme: isColorLight(colors.bgPrimary) ? 'light' : 'dark' }
        });
    }
    
    // Gráficos de relatórios
    if (reportsLineChart) {
        reportsLineChart.updateOptions({
            colors: [colors.nexbookPrimary]
        });
    }
    
    if (reportsPieChart) {
        reportsPieChart.updateOptions({
            colors: [colors.nexbookPrimary, colors.nexbookSecondary, colors.warning]
        });
    }
    
    if (reportsBarChart) {
        reportsBarChart.updateOptions({
            colors: [colors.nexbookSecondary]
        });
    }
}