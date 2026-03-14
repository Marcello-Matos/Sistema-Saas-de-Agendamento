// cores.js - Sistema completo de personalização de cores

class ColorManager {
    constructor() {
        this.defaultColors = {
            primary: '#667eea',
            primaryDark: '#5a67d8',
            primaryLight: '#edf2ff',
            secondary: '#764ba2',
            secondaryDark: '#5f3a8d',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            background: '#f8fafc',
            bgPrimary: '#ffffff',
            bgSecondary: '#f1f5f9',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            shadow: 'rgba(0, 0, 0, 0.1)'
        };
        
        this.currentColors = { ...this.defaultColors };
        this.init();
    }

    init() {
        this.loadColors();
        this.watchColorChanges();
        this.applyColors();
    }

    loadColors() {
        try {
            const saved = localStorage.getItem('nexbook_colors');
            if (saved) {
                this.currentColors = { ...this.defaultColors, ...JSON.parse(saved) };
            } else {
                this.loadColorsFromFirebase();
            }
        } catch (e) {
            console.warn('Erro ao carregar cores:', e);
        }
        this.applyColors();
    }

    async loadColorsFromFirebase() {
        try {
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                const doc = await firebase.firestore().collection('users').doc(userId).get();
                if (doc.exists && doc.data().customColors) {
                    this.currentColors = { ...this.defaultColors, ...doc.data().customColors };
                    localStorage.setItem('nexbook_colors', JSON.stringify(this.currentColors));
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar cores do Firebase:', e);
        }
    }

    setupColorPickers() {
        const colors = [
            { picker: 'primaryColorPicker', input: 'primaryColorInput', key: 'primary' },
            { picker: 'secondaryColorPicker', input: 'secondaryColorInput', key: 'secondary' },
            { picker: 'backgroundColorPicker', input: 'backgroundColorInput', key: 'background' },
            { picker: 'successColorPicker', input: 'successColorInput', key: 'success' }
        ];

        colors.forEach(({ picker, input, key }) => {
            const pickerEl = document.getElementById(picker);
            const inputEl = document.getElementById(input);
            
            if (pickerEl && inputEl) {
                const pickr = Pickr.create({
                    el: pickerEl,
                    theme: 'classic',
                    default: this.currentColors[key],
                    components: {
                        preview: true,
                        opacity: true,
                        hue: true,
                        interaction: {
                            hex: true,
                            rgba: true,
                            input: true,
                            save: true
                        }
                    }
                });

                pickr.on('change', (color) => {
                    const hex = color.toHEXA().toString();
                    inputEl.value = hex;
                    this.currentColors[key] = hex;
                    this.updateRelatedColors(key, hex);
                    this.applyColors();
                });

                inputEl.value = this.currentColors[key];
            }
        });
    }

    updateRelatedColors(key, value) {
        const variations = {
            primary: {
                primaryDark: this.darkenColor(value, 0.12),
                primaryLight: this.lightenColor(value, 0.95)
            },
            secondary: {
                secondaryDark: this.darkenColor(value, 0.15)
            },
            success: {},
            background: {
                bgPrimary: this.lightenColor(value, 0.02),
                bgSecondary: this.lightenColor(value, 0.96),
                border: this.lightenColor(value, 0.88)
            }
        };

        Object.assign(this.currentColors, variations[key]);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    darkenColor(hex, amount) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const darkened = {
            r: Math.max(0, Math.floor(rgb.r * (1 - amount))),
            g: Math.max(0, Math.floor(rgb.g * (1 - amount))),
            b: Math.max(0, Math.floor(rgb.b * (1 - amount)))
        };
        
        return this.rgbToHex(darkened.r, darkened.g, darkened.b);
    }

    lightenColor(hex, amount) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const lightened = {
            r: Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount)),
            g: Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount)),
            b: Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount))
        };
        
        return this.rgbToHex(lightened.r, lightened.g, lightened.b);
    }

    applyColors() {
        const root = document.documentElement;
        
        Object.entries(this.currentColors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        this.updateGradients();
        this.updateCharts();
        this.updateCalendar();
    }

    updateGradients() {
        const gradientStyles = `
            --gradient-primary: linear-gradient(135deg, var(--primary) 0%, var(--primaryDark) 100%);
            --gradient-secondary: linear-gradient(135deg, var(--secondary) 0%, var(--secondaryDark) 100%);
            --gradient-success: linear-gradient(135deg, var(--success) 0%, ${this.darkenColor(this.currentColors.success, 0.15)} 100%);
        `;
        
        let style = document.getElementById('dynamic-gradients');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-gradients';
            document.head.appendChild(style);
        }
        style.textContent = `:root { ${gradientStyles} }`;
    }

    updateCharts() {
        if (typeof window.renderDashboardCharts === 'function') {
            window.renderDashboardCharts();
        }
        if (typeof window.renderReportsCharts === 'function') {
            window.renderReportsCharts();
        }
    }

    updateCalendar() {
        if (window.calendar) {
            setTimeout(() => {
                window.calendar.refetchEvents();
            }, 100);
        }
    }

    watchColorChanges() {
        const observer = new MutationObserver(() => {
            const computed = getComputedStyle(document.documentElement);
            const primary = computed.getPropertyValue('--primary');
            const secondary = computed.getPropertyValue('--secondary');
            
            if (primary !== this.currentColors.primary || secondary !== this.currentColors.secondary) {
                this.currentColors.primary = primary;
                this.currentColors.secondary = secondary;
                localStorage.setItem('nexbook_colors', JSON.stringify(this.currentColors));
            }
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    async saveColors() {
        try {
            localStorage.setItem('nexbook_colors', JSON.stringify(this.currentColors));
            
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                await firebase.firestore().collection('users').doc(userId).update({
                    customColors: this.currentColors,
                    colorsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            console.log('Cores salvas!');
            return true;
        } catch (e) {
            console.error('Erro ao salvar cores:', e);
            return false;
        }
    }

    resetColors() {
        this.currentColors = { ...this.defaultColors };
        localStorage.removeItem('nexbook_colors');
        this.applyColors();
        this.saveColors();
    }
}

// Inicialização
let colorManager;

document.addEventListener('DOMContentLoaded', () => {
    colorManager = new ColorManager();
});

// Funções públicas para HTML
window.openDesignModal = () => {
    document.getElementById('designModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => colorManager?.setupColorPickers(), 100);
};

window.closeDesignModal = () => {
    document.getElementById('designModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

window.saveDesignColors = () => {
    colorManager.saveColors().then((success) => {
        if (success) {
            showToast?.('Design salvo!', 'success');
            closeDesignModal();
        }
    });
};

window.resetDesignColors = () => {
    if (confirm('Resetar cores padrão?')) {
        colorManager.resetColors();
        showToast?.('Cores resetadas!', 'success');
    }
};

// Export global
window.ColorManager = ColorManager;
window.colorManager = colorManager;