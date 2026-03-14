// ============================================
// CALENDÁRIO PROFISSIONAL
// ============================================

// 38. Inicializar calendário
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.warn('⚠️ Elemento do calendário não encontrado');
        return;
    }
    
    if (calendar) {
        try {
            calendar.destroy();
        } catch (e) {
            console.warn('Erro ao destruir calendário anterior:', e);
        }
    }
    
    console.log('📅 Inicializando calendário profissional...');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        timeZone: 'local',
        firstDay: 0,
        weekNumbers: true,
        weekText: 'S',
        
        initialView: window.innerWidth <= 768 ? 'timeGridDay' : 'dayGridMonth',
        height: 'auto',
        contentHeight: 'auto',
        aspectRatio: 1.8,
        handleWindowResize: true,
        windowResizeDelay: 100,
        
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Agenda'
        },
        
        views: {
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayHeaderFormat: { weekday: 'short' },
                displayEventTime: false,
                eventLimit: 3,
                eventLimitText: "mais",
                dayMaxEvents: true,
                fixedWeekCount: false,
                showNonCurrentDates: true,
                highlightToday: true
            },
            timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00',
                slotMinTime: '06:00:00',
                slotMaxTime: '22:00:00',
                allDaySlot: false,
                nowIndicator: true,
                displayEventTime: true,
                displayEventEnd: true,
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }
            },
            timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' },
                slotDuration: '00:30:00',
                slotLabelInterval: '01:00',
                slotMinTime: '06:00:00',
                slotMaxTime: '22:00:00',
                allDaySlot: false,
                nowIndicator: true,
                displayEventTime: true,
                displayEventEnd: true,
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false
                }
            },
            listWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                listDayFormat: { weekday: 'long', month: 'numeric', day: 'numeric' },
                listDaySideFormat: { hour: '2-digit', minute: '2-digit' },
                noEventsText: 'Nenhum agendamento para esta semana'
            }
        },
        
        events: loadCalendarEvents,
        
        editable: true,
        selectable: true,
        selectMirror: true,
        selectOverlap: true,
        eventDurationEditable: true,
        eventStartEditable: true,
        eventResizableFromStart: true,
        dragScroll: true,
        longPressDelay: 200,
        eventLongPressDelay: 200,
        selectLongPressDelay: 200,
        
        select: function(info) {
            const startDate = info.startStr.split('T')[0];
            const startTime = info.startStr.split('T')[1]?.substring(0, 5) || '09:00';
            openModal('appointment', startDate, startTime);
            calendar.unselect();
        },
        
        eventClick: function(info) {
            showAppointmentDetails(info.event);
        },
        
        eventDrop: async function(info) {
            try {
                const eventId = info.event.id;
                const newStart = info.event.start;

                const year  = newStart.getFullYear();
                const month = String(newStart.getMonth() + 1).padStart(2, '0');
                const day   = String(newStart.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const timeStr = `${String(newStart.getHours()).padStart(2, '0')}:${String(newStart.getMinutes()).padStart(2, '0')}`;

                await db.collection('appointments').doc(eventId).update({
                    date: dateStr,
                    time: timeStr,
                    updatedAt: new Date().toISOString()
                });

                showNotification('Agendamento movido com sucesso!', 'success');
                await loadAllData();

            } catch (error) {
                console.error('Erro ao mover agendamento:', error);
                showNotification('Erro ao mover agendamento', 'error');
                info.revert();
            }
        },

        eventResize: async function(info) {
            try {
                const eventId = info.event.id;
                const newStart = info.event.start;
                const newEnd = info.event.end;
                
                if (newEnd) {
                    const diffMs = newEnd - newStart;
                    const newDuration = Math.round(diffMs / 60000);
                    
                    const appointmentDoc = await db.collection('appointments').doc(eventId).get();
                    const appointmentData = appointmentDoc.data();
                    
                    const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
                    const serviceDuration = serviceDoc.exists ? serviceDoc.data().duration : 60;
                    
                    if (Math.abs(newDuration - serviceDuration) > 15) {
                        if (confirm('Deseja alterar a duração deste agendamento?')) {
                            await db.collection('appointments').doc(eventId).update({
                                customDuration: newDuration,
                                updatedAt: new Date().toISOString()
                            });
                        } else {
                            info.revert();
                        }
                    }
                }
                
                showNotification('Duração atualizada!', 'success');
                
            } catch (error) {
                console.error('Erro ao redimensionar:', error);
                showNotification('Erro ao redimensionar', 'error');
                info.revert();
            }
        },
        
        eventMouseEnter: function(info) {
            const props = info.event.extendedProps;
            const startTime = info.event.start ? 
                info.event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                props.time || '--:--';
            
            const endTime = info.event.end ? 
                info.event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                props.endTime || '--:--';
            
            const colors = loadSavedColors();
            
            const tooltip = document.createElement('div');
            tooltip.className = 'event-tooltip';
            tooltip.id = 'event-tooltip';
            tooltip.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px;">${props.clientName || 'Cliente'}</div>
                <div style="font-size: 11px;">${startTime} - ${endTime}</div>
                <div style="font-size: 11px; margin-top: 3px;">
                    <span style="color: ${colors.primary};">${props.serviceName || 'Serviço'}</span> com ${props.professionalName || 'Profissional'}
                </div>
                <div style="font-size: 11px; margin-top: 3px;">
                    Status: ${getStatusText(props.status)}
                </div>
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = info.el.getBoundingClientRect();
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        },
        
        eventMouseLeave: function() {
            const tooltip = document.getElementById('event-tooltip');
            if (tooltip) tooltip.remove();
        },
        
        datesSet: function(info) {
            const viewTitle = info.view.title;
            const titleElement = document.querySelector('.page-title h1');
            if (titleElement) {
                titleElement.innerHTML = `<i class="fas fa-calendar-alt" style="margin-right: 10px;"></i>Calendário - ${viewTitle}`;
            }
        },
        
        eventDidMount: function(info) {
            const props = info.event.extendedProps;
            
            info.el.classList.add(`event-status-${props.status || 'pending'}`);
            
            const eventContent = info.el.querySelector('.fc-event-title');
            if (eventContent) {
                const icon = document.createElement('i');
                icon.className = getStatusIcon(props.status);
                icon.style.marginRight = '5px';
                eventContent.prepend(icon);
            }
            
            const timeElement = info.el.querySelector('.fc-event-time');
            if (timeElement) {
                timeElement.style.fontWeight = '500';
                timeElement.style.fontSize = '11px';
            }
            
            if (info.view.type === 'dayGridMonth') {
                const titleElement = info.el.querySelector('.fc-event-title');
                if (titleElement) {
                    titleElement.innerHTML = props.clientName || 'Cliente';
                }
            }
        }
    });
    
    calendar.render();
    console.log('✅ Calendário profissional inicializado com sucesso!');
}