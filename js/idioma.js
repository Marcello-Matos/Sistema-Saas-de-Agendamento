// ======================================
// SISTEMA DE IDIOMA - COMPLETO E FUNCIONAL CORRIGIDO
// ======================================

// Objeto de traduções COMPLETO com TODOS os idiomas
const translations = {
    'pt-BR': {
        // Dashboard
        'dashboardTitle': 'Dashboard Inteligente',
        'dashboardSubtitle': 'Visão geral do seu negócio com insights em tempo real',
        'last7days': 'Últimos 7 dias',
        'last30days': 'Últimos 30 dias',
        'thisMonth': 'Este mês',
        'custom': 'Personalizado',
        'allProfessionals': 'Todos profissionais',
        'allServices': 'Todos serviços',
        'to': 'até',
        'apply': 'Aplicar',
        'today': 'Hoje',
        'appointmentsToday': 'Agendamentos hoje',
        'vsYesterday': 'vs ontem',
        'revenueToday': 'Faturamento hoje',
        'professionals': 'Profissionais',
        'clients': 'Clientes',
        'active': 'Ativos',
        'appointmentsPerDay': 'Agendamentos por dia',
        'mostWantedServices': 'Serviços mais procurados',
        'nextAppointments': 'Próximos agendamentos',
        'sendWhatsApp': 'Enviar via WhatsApp',
        'newAppointment': 'Novo agendamento',
        
        // Navegação
        'dashboard': 'Dashboard',
        'calendar': 'Calendário',
        'services': 'Serviços',
        'reports': 'Relatórios',
        'settings': 'Configurações',
        
        // Gerais
        'search': 'Buscar...',
        'searchClient': 'Buscar aluno...',
        'loading': 'Carregando...',
        'loadingAppointments': 'Carregando agendamentos...',
        'loadingStudents': 'Carregando alunos...',
        'myProfile': 'Meu Perfil',
        'logout': 'Sair',
        
        // Profissionais
        'name': 'Nome',
        'specialty': 'Especialidade',
        'phone': 'Telefone',
        'status': 'Status',
        'actions': 'Ações',
        'newProfessional': 'Novo Profissional',
        
        // Serviços
        'duration': 'Duração',
        'description': 'Descrição',
        'newService': 'Novo Serviço',
        
        // Clientes
        'photo': 'Foto',
        'birthdate': 'Data Nasc.',
        'plan': 'Plano',
        'origin': 'Origem',
        'value': 'Valor',
        'startDate': 'Data Início',
        'city': 'Cidade',
        'newClient': 'Novo Cliente',
        'totalpass': 'Total Pass',
        'wellhub': 'Well Hub',
        
        // Relatórios
        'reportsTitle': 'Relatórios e Análises',
        'last90days': 'Últimos 90 dias',
        'lastYear': 'Último ano',
        'allPeriod': 'Todo período',
        'generalReport': 'Relatório Geral',
        'total': 'Total',
        'activeClients': 'Clientes Ativos',
        'vsPreviousPeriod': 'vs período anterior',
        'appointments': 'Agendamentos',
        'revenue': 'Faturamento',
        'attendanceRate': 'Taxa de Comparecimento',
        'appointmentsEvolution': 'Evolução de Agendamentos',
        'selectedPeriod': 'Período selecionado',
        'distributionByOrigin': 'Distribuição por Origem',
        'totalpassVsWellhub': 'Total Pass vs Well Hub vs Direto',
        'performanceByProfessional': 'Desempenho por Profissional',
        'appointmentsPeriod': 'Agendamentos no período',
        'studentReport': 'Relatório do Aluno',
        'downloadPDF': 'Download PDF',
        'close': 'Fechar',
        
        // Configurações
        'language': 'Idioma',
        'interfaceLanguage': 'Idioma da Interface',
        'selectLanguage': 'Selecione o idioma do sistema',
        'generalSettings': 'Configurações Gerais',
        'companyName': 'Nome da Empresa',
        'contactEmail': 'Email de Contato',
        'address': 'Endereço',
        'workingHours': 'Horário de Funcionamento',
        'mondayToFriday': 'Segunda à Sexta',
        'saturday': 'Sábado',
        'sunday': 'Domingo',
        'closed': 'Fechado',
        'notifications': 'Notificações',
        'confirmationEmail': 'Email de Confirmação',
        'sendConfirmationEmail': 'Enviar confirmação por email',
        'smsReminder': 'SMS de Lembrete',
        'sendReminder1h': 'Enviar lembrete 1h antes',
        'whatsapp': 'WhatsApp',
        'whatsappNotifications': 'Notificações via WhatsApp',
        'integrations': 'Integrações',
        'syncGoogle': 'Sincronizar com Google',
        'onlinePayments': 'Pagamentos Online',
        'acceptPayments': 'Aceitar pagamentos',
        'connect': 'Conectar',
        'setup': 'Configurar',
        'edit': 'Editar',
        
        // Design
        'designColors': 'Design & Cores',
        'customizeSystemColors': 'Personalizar Cores do Sistema',
        'changeLayoutColors': 'Altere as cores principais do layout completo',
        'design': 'DESIGN',
        'livePreview': 'Pré-visualização em Tempo Real',
        'changesAppliedInstantly': 'As mudanças são aplicadas instantaneamente',
        'primaryColor': 'Cor Primária',
        'secondaryColor': 'Cor Secundária',
        'backgroundColor': 'Cor de Fundo',
        'successColor': 'Cor de Sucesso',
        'customizeDesign': 'Personalizar Design',
        'resetDefault': 'Resetar Padrão',
        'saveDesign': 'Salvar Design',
        
        // WhatsApp
        'sendReminderWhatsApp': 'Enviar Lembrete via WhatsApp',
        'confirmAppointmentData': 'Confirme os dados do agendamento',
        'whatsappNumber': 'Número do WhatsApp',
        'addCustomMessage': 'Adicionar mensagem personalizada',
        'customMessage': 'Digite sua mensagem adicional...',
        'sendNow': 'Enviar Agora',
        'selectStudentReminder': 'Selecione o aluno para enviar o lembrete',
        
        // Dias da semana
        'monday': 'Segunda',
        'tuesday': 'Terça',
        'wednesday': 'Quarta',
        'thursday': 'Quinta',
        'friday': 'Sexta',
        'saturday': 'Sábado',
        'sunday': 'Domingo'
    },
    
    'en': {
        // Dashboard
        'dashboardTitle': 'Smart Dashboard',
        'dashboardSubtitle': 'Business overview with real-time insights',
        'last7days': 'Last 7 days',
        'last30days': 'Last 30 days',
        'thisMonth': 'This month',
        'custom': 'Custom',
        'allProfessionals': 'All professionals',
        'allServices': 'All services',
        'to': 'to',
        'apply': 'Apply',
        'today': 'Today',
        'appointmentsToday': 'Appointments today',
        'vsYesterday': 'vs yesterday',
        'revenueToday': 'Revenue today',
        'professionals': 'Professionals',
        'clients': 'Clients',
        'active': 'Active',
        'appointmentsPerDay': 'Appointments per day',
        'mostWantedServices': 'Most wanted services',
        'nextAppointments': 'Next appointments',
        'sendWhatsApp': 'Send via WhatsApp',
        'newAppointment': 'New appointment',
        
        // Navigation
        'dashboard': 'Dashboard',
        'calendar': 'Calendar',
        'services': 'Services',
        'reports': 'Reports',
        'settings': 'Settings',
        
        // General
        'search': 'Search...',
        'searchClient': 'Search student...',
        'loading': 'Loading...',
        'loadingAppointments': 'Loading appointments...',
        'loadingStudents': 'Loading students...',
        'myProfile': 'My Profile',
        'logout': 'Logout',
        
        // Professionals
        'name': 'Name',
        'specialty': 'Specialty',
        'phone': 'Phone',
        'status': 'Status',
        'actions': 'Actions',
        'newProfessional': 'New Professional',
        
        // Services
        'duration': 'Duration',
        'description': 'Description',
        'newService': 'New Service',
        
        // Clients
        'photo': 'Photo',
        'birthdate': 'Birth date',
        'plan': 'Plan',
        'origin': 'Origin',
        'value': 'Value',
        'startDate': 'Start date',
        'city': 'City',
        'newClient': 'New Client',
        'totalpass': 'Total Pass',
        'wellhub': 'Well Hub',
        
        // Reports
        'reportsTitle': 'Reports & Analytics',
        'last90days': 'Last 90 days',
        'lastYear': 'Last year',
        'allPeriod': 'All period',
        'generalReport': 'General Report',
        'total': 'Total',
        'activeClients': 'Active Clients',
        'vsPreviousPeriod': 'vs previous period',
        'appointments': 'Appointments',
        'revenue': 'Revenue',
        'attendanceRate': 'Attendance Rate',
        'appointmentsEvolution': 'Appointments Evolution',
        'selectedPeriod': 'Selected period',
        'distributionByOrigin': 'Distribution by Origin',
        'totalpassVsWellhub': 'Total Pass vs Well Hub vs Direct',
        'performanceByProfessional': 'Performance by Professional',
        'appointmentsPeriod': 'Appointments in period',
        'studentReport': 'Student Report',
        'downloadPDF': 'Download PDF',
        'close': 'Close',
        
        // Settings
        'language': 'Language',
        'interfaceLanguage': 'Interface Language',
        'selectLanguage': 'Select system language',
        'generalSettings': 'General Settings',
        'companyName': 'Company Name',
        'contactEmail': 'Contact Email',
        'address': 'Address',
        'workingHours': 'Working Hours',
        'mondayToFriday': 'Monday to Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday',
        'closed': 'Closed',
        'notifications': 'Notifications',
        'confirmationEmail': 'Confirmation Email',
        'sendConfirmationEmail': 'Send confirmation email',
        'smsReminder': 'SMS Reminder',
        'sendReminder1h': 'Send reminder 1h before',
        'whatsapp': 'WhatsApp',
        'whatsappNotifications': 'WhatsApp Notifications',
        'integrations': 'Integrations',
        'syncGoogle': 'Sync with Google',
        'onlinePayments': 'Online Payments',
        'acceptPayments': 'Accept payments',
        'connect': 'Connect',
        'setup': 'Setup',
        'edit': 'Edit',
        
        // Design
        'designColors': 'Design & Colors',
        'customizeSystemColors': 'Customize System Colors',
        'changeLayoutColors': 'Change main layout colors',
        'design': 'DESIGN',
        'livePreview': 'Live Preview',
        'changesAppliedInstantly': 'Changes are applied instantly',
        'primaryColor': 'Primary Color',
        'secondaryColor': 'Secondary Color',
        'backgroundColor': 'Background Color',
        'successColor': 'Success Color',
        'customizeDesign': 'Customize Design',
        'resetDefault': 'Reset to Default',
        'saveDesign': 'Save Design',
        
        // WhatsApp
        'sendReminderWhatsApp': 'Send Reminder via WhatsApp',
        'confirmAppointmentData': 'Confirm appointment data',
        'whatsappNumber': 'WhatsApp Number',
        'addCustomMessage': 'Add custom message',
        'customMessage': 'Type your additional message...',
        'sendNow': 'Send Now',
        'selectStudentReminder': 'Select student to send reminder',
        
        // Week days
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday'
    },
    
    'es': {
        // Dashboard
        'dashboardTitle': 'Dashboard Inteligente',
        'dashboardSubtitle': 'Visión general de su negocio con información en tiempo real',
        'last7days': 'Últimos 7 días',
        'last30days': 'Últimos 30 días',
        'thisMonth': 'Este mes',
        'custom': 'Personalizado',
        'allProfessionals': 'Todos los profesionales',
        'allServices': 'Todos los servicios',
        'to': 'hasta',
        'apply': 'Aplicar',
        'today': 'Hoy',
        'appointmentsToday': 'Citas hoy',
        'vsYesterday': 'vs ayer',
        'revenueToday': 'Ingresos hoy',
        'professionals': 'Profesionales',
        'clients': 'Clientes',
        'active': 'Activos',
        'appointmentsPerDay': 'Citas por día',
        'mostWantedServices': 'Servicios más buscados',
        'nextAppointments': 'Próximas citas',
        'sendWhatsApp': 'Enviar vía WhatsApp',
        'newAppointment': 'Nueva cita',
        
        // Navegación
        'dashboard': 'Dashboard',
        'calendar': 'Calendario',
        'services': 'Servicios',
        'reports': 'Informes',
        'settings': 'Configuración',
        
        // Generales
        'search': 'Buscar...',
        'searchClient': 'Buscar alumno...',
        'loading': 'Cargando...',
        'loadingAppointments': 'Cargando citas...',
        'loadingStudents': 'Cargando alumnos...',
        'myProfile': 'Mi Perfil',
        'logout': 'Cerrar sesión',
        
        // Profesionales
        'name': 'Nombre',
        'specialty': 'Especialidad',
        'phone': 'Teléfono',
        'status': 'Estado',
        'actions': 'Acciones',
        'newProfessional': 'Nuevo Profesional',
        
        // Servicios
        'duration': 'Duración',
        'description': 'Descripción',
        'newService': 'Nuevo Servicio',
        
        // Clientes
        'photo': 'Foto',
        'birthdate': 'Fecha Nac.',
        'plan': 'Plan',
        'origin': 'Origen',
        'value': 'Valor',
        'startDate': 'Fecha Inicio',
        'city': 'Ciudad',
        'newClient': 'Nuevo Cliente',
        'totalpass': 'Total Pass',
        'wellhub': 'Well Hub',
        
        // Informes
        'reportsTitle': 'Informes y Análisis',
        'last90days': 'Últimos 90 días',
        'lastYear': 'Último año',
        'allPeriod': 'Todo el período',
        'generalReport': 'Informe General',
        'total': 'Total',
        'activeClients': 'Clientes Activos',
        'vsPreviousPeriod': 'vs período anterior',
        'appointments': 'Citas',
        'revenue': 'Ingresos',
        'attendanceRate': 'Tasa de Asistencia',
        'appointmentsEvolution': 'Evolución de Citas',
        'selectedPeriod': 'Período seleccionado',
        'distributionByOrigin': 'Distribución por Origen',
        'totalpassVsWellhub': 'Total Pass vs Well Hub vs Directo',
        'performanceByProfessional': 'Rendimiento por Profesional',
        'appointmentsPeriod': 'Citas en el período',
        'studentReport': 'Informe del Alumno',
        'downloadPDF': 'Descargar PDF',
        'close': 'Cerrar',
        
        // Configuración
        'language': 'Idioma',
        'interfaceLanguage': 'Idioma de la Interfaz',
        'selectLanguage': 'Seleccione el idioma del sistema',
        'generalSettings': 'Configuración General',
        'companyName': 'Nombre de la Empresa',
        'contactEmail': 'Email de Contacto',
        'address': 'Dirección',
        'workingHours': 'Horario de Funcionamiento',
        'mondayToFriday': 'Lunes a Viernes',
        'saturday': 'Sábado',
        'sunday': 'Domingo',
        'closed': 'Cerrado',
        'notifications': 'Notificaciones',
        'confirmationEmail': 'Email de Confirmación',
        'sendConfirmationEmail': 'Enviar confirmación por email',
        'smsReminder': 'SMS Recordatorio',
        'sendReminder1h': 'Enviar recordatorio 1h antes',
        'whatsapp': 'WhatsApp',
        'whatsappNotifications': 'Notificaciones vía WhatsApp',
        'integrations': 'Integraciones',
        'syncGoogle': 'Sincronizar con Google',
        'onlinePayments': 'Pagos Online',
        'acceptPayments': 'Aceptar pagos',
        'connect': 'Conectar',
        'setup': 'Configurar',
        'edit': 'Editar',
        
        // Diseño
        'designColors': 'Diseño y Colores',
        'customizeSystemColors': 'Personalizar Colores del Sistema',
        'changeLayoutColors': 'Cambie los colores principales del diseño',
        'design': 'DISEÑO',
        'livePreview': 'Vista Previa en Tiempo Real',
        'changesAppliedInstantly': 'Los cambios se aplican instantáneamente',
        'primaryColor': 'Color Primario',
        'secondaryColor': 'Color Secundario',
        'backgroundColor': 'Color de Fondo',
        'successColor': 'Color de Éxito',
        'customizeDesign': 'Personalizar Diseño',
        'resetDefault': 'Restablecer',
        'saveDesign': 'Guardar Diseño',
        
        // WhatsApp
        'sendReminderWhatsApp': 'Enviar Recordatorio vía WhatsApp',
        'confirmAppointmentData': 'Confirme los datos de la cita',
        'whatsappNumber': 'Número de WhatsApp',
        'addCustomMessage': 'Agregar mensaje personalizado',
        'customMessage': 'Escriba su mensaje adicional...',
        'sendNow': 'Enviar Ahora',
        'selectStudentReminder': 'Seleccione el alumno para enviar recordatorio',
        
        // Días de la semana
        'monday': 'Lunes',
        'tuesday': 'Martes',
        'wednesday': 'Miércoles',
        'thursday': 'Jueves',
        'friday': 'Viernes',
        'saturday': 'Sábado',
        'sunday': 'Domingo'
    }
};

// ======================================
// VARIÁVEL GLOBAL DO IDIOMA ATUAL
// ======================================
let currentLanguage = 'pt-BR';

// ======================================
// FUNÇÃO PRINCIPAL DE MUDANÇA DE IDIOMA
// ======================================
function changeLanguage(lang) {
    // Verifica se o idioma existe
    if (!translations[lang]) {
        console.error(`Idioma não suportado: ${lang}`);
        return;
    }
    
    // Salva a preferência
    currentLanguage = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
    
    // Atualiza TODOS os elementos com data-i18n
    updateAllTranslations(lang);
    
    // Atualiza placeholders
    updateAllPlaceholders(lang);
    
    // Atualiza títulos de páginas
    updatePageTitles(lang);
    
    // Dispara evento personalizado para componentes que precisam ser atualizados
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    
    console.log(`🌍 Idioma alterado para: ${lang}`);
}

// ======================================
// ATUALIZA TODOS OS TEXTOS
// ======================================
function updateAllTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[lang]?.[key];
        
        if (translation) {
            // Verifica se o elemento tem filhos (como ícones)
            if (element.children.length > 0) {
                // Preserva os ícones, atualiza apenas o texto
                let hasTextNode = false;
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                        node.textContent = translation;
                        hasTextNode = true;
                    }
                });
                
                // Se não encontrou nó de texto, adiciona o texto após os ícones
                if (!hasTextNode) {
                    element.appendChild(document.createTextNode(' ' + translation));
                }
            } else {
                element.textContent = translation;
            }
        }
    });
}

// ======================================
// ATUALIZA TODOS OS PLACEHOLDERS
// ======================================
function updateAllPlaceholders(lang) {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = translations[lang]?.[key];
        
        if (translation) {
            element.placeholder = translation;
        }
    });
}

// ======================================
// ATUALIZA TÍTULOS DE PÁGINAS
// ======================================
function updatePageTitles(lang) {
    // Atualiza título da aba do navegador
    const pageTitle = document.querySelector('title');
    if (pageTitle && pageTitle.hasAttribute('data-i18n')) {
        const key = pageTitle.getAttribute('data-i18n');
        const translation = translations[lang]?.[key];
        if (translation) {
            pageTitle.textContent = translation;
        }
    }
}

// ======================================
// FUNÇÃO PARA OBTER TEXTO TRADUZIDO
// ======================================
function t(key, lang = currentLanguage) {
    return translations[lang]?.[key] || key;
}

// ======================================
// FUNÇÃO PARA ATUALIZAR TRADUÇÃO ESPECÍFICA
// ======================================
function updateTranslation(key, lang = currentLanguage) {
    const elements = document.querySelectorAll(`[data-i18n="${key}"]`);
    const translation = translations[lang]?.[key];
    
    elements.forEach(el => {
        if (translation) {
            if (el.children.length > 0) {
                let hasTextNode = false;
                el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                        node.textContent = translation;
                        hasTextNode = true;
                    }
                });
                if (!hasTextNode) {
                    el.appendChild(document.createTextNode(' ' + translation));
                }
            } else {
                el.textContent = translation;
            }
        }
    });
}

// ======================================
// FUNÇÃO PARA ATUALIZAR ELEMENTOS GERADOS DINAMICAMENTE
// ======================================
function applyTranslationsToDynamicContent(container, lang = currentLanguage) {
    if (!container) return;
    
    container.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[lang]?.[key];
        
        if (translation) {
            if (element.children.length > 0) {
                let hasTextNode = false;
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                        node.textContent = translation;
                        hasTextNode = true;
                    }
                });
                if (!hasTextNode) {
                    element.appendChild(document.createTextNode(' ' + translation));
                }
            } else {
                element.textContent = translation;
            }
        }
    });
    
    container.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = translations[lang]?.[key];
        if (translation) {
            element.placeholder = translation;
        }
    });
}

// ======================================
// INICIALIZAÇÃO AO CARREGAR A PÁGINA
// ======================================
document.addEventListener('DOMContentLoaded', function() {
    // Carrega idioma salvo ou padrão
    const savedLang = localStorage.getItem('language');
    currentLanguage = (savedLang && translations[savedLang]) ? savedLang : 'pt-BR';
    
    // Configura o select de idioma
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        changeLanguage(currentLanguage);
        
        // Listener para mudança de idioma
        languageSelect.addEventListener('change', function(e) {
            changeLanguage(e.target.value);
        });
    } else {
        // Se não tem select, ainda assim aplica o idioma salvo
        changeLanguage(currentLanguage);
    }
    
    // Observa mudanças no DOM para traduzir conteúdo dinâmico
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    applyTranslationsToDynamicContent(node, currentLanguage);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// ======================================
// EXPÕE FUNÇÕES GLOBALMENTE
// ======================================
window.changeLanguage = changeLanguage;
window.t = t;
window.updateTranslation = updateTranslation;
window.applyTranslationsToDynamicContent = applyTranslationsToDynamicContent;
window.currentLanguage = currentLanguage;