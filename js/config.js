// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

// Variáveis globais
let auth, db, storage;
let currentUser = null;
let currentUserId = null;
let appointmentsChart, servicesChart, calendar;
let reportsLineChart, reportsPieChart, reportsBarChart;
let editingId = null;
let currentModalType = null;
let currentPhotoBase64 = null;
let isMobileSidebarOpen = false;
let globalSearchTerm = '';

// Variáveis para os color pickers
let primaryPicker, secondaryPicker, backgroundPicker, successPicker;

// Cache para evitar buscas repetidas
const cache = {
    clients: new Map(),
    services: new Map(),
    professionals: new Map(),
    lastFetch: 0
};

// Cores padrão do sistema
const defaultColors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    background: '#f3f4f6',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    text: '#1f2937',
    textLight: '#6b7280'
};