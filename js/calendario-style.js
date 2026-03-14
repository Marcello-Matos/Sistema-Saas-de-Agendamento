// ============================================
// CSS DO CALENDÁRIO COM CORES DINÂMICAS
// ============================================

// 72. Adicionar estilos do calendário
function addCalendarStyles() {
    if (document.getElementById('calendar-styles')) return;
    
    const colors = loadSavedColors();
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'calendar-styles';
    styleSheet.textContent = `
        .fc {
            font-family: 'Google Sans', 'Roboto', system-ui, sans-serif;
            background: ${isColorLight(colors.background) ? '#ffffff' : adjustColor(colors.background, 10)};
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        .dark-theme .fc {
            background: ${isColorLight(colors.background) ? adjustColor(colors.background, -20) : colors.background};
        }
        
        .fc-toolbar {
            margin-bottom: 24px !important;
        }
        
        .fc-toolbar-title {
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            color: ${colors.text};
        }
        
        .dark-theme .fc-toolbar-title {
            color: ${isColorLight(colors.text) ? colors.text : '#f3f4f6'};
        }
        
        .fc-button {
            background: transparent !important;
            border: 1px solid ${colors.borderColor || '#e5e7eb'} !important;
            color: ${colors.text} !important;
            font-weight: 500 !important;
            padding: 8px 16px !important;
            border-radius: 24px !important;
            transition: all 0.2s;
            text-transform: capitalize !important;
            box-shadow: none !important;
        }
        
        .dark-theme .fc-button {
            border-color: ${adjustColor(colors.background, 30)} !important;
            color: ${isColorLight(colors.text) ? colors.text : '#f3f4f6'} !important;
        }
        
        .fc-button:hover {
            background: ${colors.primary}20 !important;
            border-color: ${colors.primary} !important;
        }
        
        .fc-button-active {
            background: ${colors.primary} !important;
            border-color: ${colors.primary} !important;
            color: white !important;
        }
        
        .fc-button-active:hover {
            background: ${adjustColor(colors.primary, -20)} !important;
        }
        
        .fc-col-header-cell {
            background: ${isColorLight(colors.background) ? '#f9fafb' : adjustColor(colors.background, 10)};
            padding: 14px 0;
            font-weight: 600;
            color: ${colors.text};
            border: none;
        }
        
        .dark-theme .fc-col-header-cell {
            background: ${adjustColor(colors.background, -10)};
            color: ${isColorLight(colors.text) ? colors.text : '#f3f4f6'};
        }
        
        .fc-col-header-cell-cushion {
            text-decoration: none;
            color: inherit;
        }
        
        .fc-daygrid-day {
            border: 1px solid ${colors.borderColor || '#f3f4f6'} !important;
            transition: background 0.2s;
        }
        
        .dark-theme .fc-daygrid-day {
            border-color: ${adjustColor(colors.background, 20)} !important;
        }
        
        .fc-daygrid-day:hover {
            background: ${isColorLight(colors.background) ? '#f9fafb' : adjustColor(colors.background, 10)};
            cursor: pointer;
        }
        
        .fc-day-today {
            background: ${colors.primary}10 !important;
        }
        
        .fc-day-today .fc-daygrid-day-number {
            background: ${colors.primary};
            color: white !important;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin: 4px;
        }
        
        .fc-daygrid-day-number {
            color: ${colors.text};
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 8px !important;
        }
        
        .dark-theme .fc-daygrid-day-number {
            color: ${isColorLight(colors.text) ? colors.text : '#f3f4f6'};
        }
        
        .fc-event {
            border: none !important;
            border-radius: 6px !important;
            padding: 4px 6px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            margin: 2px 0 !important;
            transition: transform 0.1s, box-shadow 0.1s;
            font-weight: 500;
        }
        
        .fc-event:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .event-status-pending {
            background: linear-gradient(135deg, ${colors.warning}, ${adjustColor(colors.warning, 20)}) !important;
        }
        
        .event-status-confirmed {
            background: linear-gradient(135deg, ${colors.success}, ${adjustColor(colors.success, 20)}) !important;
        }
        
        .event-status-attended {
            background: linear-gradient(135deg, ${colors.secondary}, ${adjustColor(colors.secondary, 20)}) !important;
        }
        
        .event-status-absent {
            background: linear-gradient(135deg, ${colors.danger}, ${adjustColor(colors.danger, 20)}) !important;
        }
        
        .event-status-cancelled {
            background: linear-gradient(135deg, ${colors.textLight}, ${adjustColor(colors.textLight, -20)}) !important;
        }
        
        .fc-timegrid-slot {
            height: 40px !important;
            border-color: ${colors.borderColor || '#f3f4f6'} !important;
        }
        
        .dark-theme .fc-timegrid-slot {
            border-color: ${adjustColor(colors.background, 20)} !important;
        }
        
        .fc-timegrid-slot-label {
            font-size: 12px;
            color: ${colors.textLight};
            font-weight: 500;
        }
        
        .dark-theme .fc-timegrid-slot-label {
            color: ${isColorLight(colors.textLight) ? colors.textLight : '#9ca3af'};
        }
        
        .fc-timegrid-now-indicator-line {
            border-color: ${colors.primary} !important;
            border-width: 2px !important;
        }
        
        .fc-timegrid-now-indicator-arrow {
            border-color: ${colors.primary} !important;
            color: ${colors.primary} !important;
        }
        
        .fc-scrollgrid {
            border: 1px solid ${colors.borderColor || '#f3f4f6'} !important;
            border-radius: 12px;
            overflow: hidden;
        }
        
        .dark-theme .fc-scrollgrid {
            border-color: ${adjustColor(colors.background, 20)} !important;
        }
        
        .fc-scrollgrid td {
            border-color: ${colors.borderColor || '#f3f4f6'} !important;
        }
        
        .dark-theme .fc-scrollgrid td {
            border-color: ${adjustColor(colors.background, 20)} !important;
        }
        
        .event-tooltip {
            position: fixed;
            background: ${isColorLight(colors.background) ? '#ffffff' : adjustColor(colors.background, 10)};
            color: ${colors.text};
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border: 1px solid ${colors.borderColor || '#e5e7eb'};
            z-index: 9999;
            pointer-events: none;
            max-width: 250px;
            animation: fadeIn 0.2s;
        }
        
        .dark-theme .event-tooltip {
            background: ${adjustColor(colors.background, 10)};
            color: ${isColorLight(colors.text) ? colors.text : '#f3f4f6'};
            border-color: ${adjustColor(colors.background, 30)};
        }
        
        .event-tooltip::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 10px;
            background: ${isColorLight(colors.background) ? '#ffffff' : adjustColor(colors.background, 10)};
            border-right: 1px solid ${colors.borderColor || '#e5e7eb'};
            border-bottom: 1px solid ${colors.borderColor || '#e5e7eb'};
            transform: translateX(-50%) rotate(45deg);
        }
        
        .dark-theme .event-tooltip::after {
            background: ${adjustColor(colors.background, 10)};
            border-color: ${adjustColor(colors.background, 30)};
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .google-notification {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${isColorLight(colors.background) ? '#ffffff' : adjustColor(colors.background, 10)};
            color: ${colors.text};
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s;
            z-index: 10000;
            border-left: 4px solid ${colors.primary};
        }
        
        .dark-theme .google-notification {
            background: ${adjustColor(colors.background, 10)};
            color: ${isColorLight(colors.text) ? colors.text : '#f3f4f6'};
        }
        
        .google-notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .google-notification.success {
            border-left-color: ${colors.success};
        }
        
        .google-notification.error {
            border-left-color: ${colors.danger};
        }
        
        .google-notification i {
            font-size: 20px;
        }
        
        @media (max-width: 768px) {
            .fc-toolbar {
                flex-direction: column;
                gap: 16px;
            }
            
            .fc-toolbar-chunk {
                display: flex;
                justify-content: center;
                width: 100%;
            }
            
            .fc .fc-button {
                padding: 6px 12px !important;
                font-size: 12px !important;
            }
            
            .fc-daygrid-day-number {
                font-size: 12px;
            }
            
            .fc {
                padding: 16px;
            }
        }
    `;
    
    document.head.appendChild(styleSheet);
}