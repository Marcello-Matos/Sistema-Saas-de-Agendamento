// ============================================
// FUNÇÃO PARA CARREGAR EVENTOS DO FIREBASE
// ============================================

// 39. Carregar eventos do calendário
async function loadCalendarEvents(fetchInfo, successCallback, failureCallback) {
    if (!currentUserId) {
        console.log('❌ Usuário não logado');
        successCallback([]);
        return;
    }
    
    try {
        console.log('📅 Carregando eventos de:', fetchInfo.startStr, 'até', fetchInfo.endStr);
        
        const snapshot = await db.collection('appointments')
            .where('userId', '==', currentUserId)
            .where('date', '>=', fetchInfo.startStr.split('T')[0])
            .where('date', '<=', fetchInfo.endStr.split('T')[0])
            .orderBy('date', 'asc')
            .orderBy('time', 'asc')
            .get();
        
        console.log('✅ Agendamentos encontrados:', snapshot.size);
        
        const events = [];
        
        // Usar Map para evitar duplicidade de promises
        const clientIds = new Set();
        const serviceIds = new Set();
        const professionalIds = new Set();
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.clientId) clientIds.add(data.clientId);
            if (data.serviceId) serviceIds.add(data.serviceId);
            if (data.professionalId) professionalIds.add(data.professionalId);
        });
        
        // Buscar todos os dados em paralelo
        const [clientDocs, serviceDocs, professionalDocs] = await Promise.all([
            Promise.all(Array.from(clientIds).map(id => 
                db.collection('clients').doc(id).get().catch(() => null)
            )),
            Promise.all(Array.from(serviceIds).map(id => 
                db.collection('services').doc(id).get().catch(() => null)
            )),
            Promise.all(Array.from(professionalIds).map(id => 
                db.collection('professionals').doc(id).get().catch(() => null)
            ))
        ]);
        
        // Criar maps para lookup rápido
        const clientMap = new Map();
        clientDocs.forEach(doc => {
            if (doc && doc.exists) {
                clientMap.set(doc.id, doc.data().name);
            }
        });
        
        const serviceMap = new Map();
        serviceDocs.forEach(doc => {
            if (doc && doc.exists) {
                serviceMap.set(doc.id, doc.data());
            }
        });
        
        const professionalMap = new Map();
        professionalDocs.forEach(doc => {
            if (doc && doc.exists) {
                professionalMap.set(doc.id, doc.data().name);
            }
        });
        
        const colors = loadSavedColors();
        
        // Gerar eventos sem duplicidade
        for (const doc of snapshot.docs) {
            const data = doc.data();
            
            const clientName = clientMap.get(data.clientId) || 'Cliente';
            const serviceData = serviceMap.get(data.serviceId) || { name: 'Serviço', duration: 60, price: 0 };
            const professionalName = professionalMap.get(data.professionalId) || 'Profissional';
            
            const startTime = data.time || '09:00';
            let endTime = startTime;
            
            if (serviceData.duration) {
                const [hours, minutes] = startTime.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes + serviceData.duration;
                const endHours = Math.floor(totalMinutes / 60);
                const endMinutes = totalMinutes % 60;
                endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
            }
            
            // CORES DINÂMICAS BASEADAS NO STATUS
            let backgroundColor = colors.primary; // Padrão
            if (data.status === 'pending') backgroundColor = colors.warning;
            else if (data.status === 'confirmed') backgroundColor = colors.success;
            else if (data.status === 'attended') backgroundColor = colors.secondary;
            else if (data.status === 'absent') backgroundColor = colors.danger;
            else if (data.status === 'cancelled') backgroundColor = adjustColor(colors.text, -20);
            
            events.push({
                id: doc.id,
                title: clientName,
                start: data.date + 'T' + startTime + ':00',
                end: data.date + 'T' + endTime + ':00',
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: '#ffffff',
                extendedProps: {
                    clientName: clientName,
                    serviceName: serviceData.name,
                    professionalName: professionalName,
                    servicePrice: serviceData.price || 0,
                    serviceDuration: serviceData.duration || 60,
                    status: data.status || 'pending',
                    notes: data.notes || '',
                    date: data.date,
                    time: data.time,
                    endTime: endTime
                }
            });
        }
        
        console.log('🎉 Eventos gerados:', events.length);
        successCallback(events);
        
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        failureCallback(error);
    }
}