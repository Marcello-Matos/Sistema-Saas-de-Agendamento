// ============================================
// settings.js - VERSÃO COM MODAL FUNCIONANDO
// ============================================

console.log('⚙️ Settings.js carregado');

// Configurações padrão
let settings = {
    companyName: 'NOME DA EMPRESA',
    companyEmail: 'editor@editor.com.br',
    companyPhone: '(19)9999-9999',
    companyAddress: 'Av. Fracasso, 1000',
    weekdayHours: '09:00 - 15:00',
    saturdayHours: 'Fechado',
    sundayHours: 'Fechado'
};

// Carregar configurações salvas
try {
    const saved = localStorage.getItem('nexbook_settings');
    if (saved) {
        settings = JSON.parse(saved);
        console.log('Configurações carregadas:', settings);
    }
} catch (e) {
    console.log('Erro ao carregar, usando padrão');
}

// FUNÇÃO PRINCIPAL QUE ABRE O MODAL
window.editSetting = function(campo) {
    console.log('✏️ Editando:', campo);
    
    // Mapeamento dos campos
    const campos = {
        companyName: { label: 'Nome da Empresa', id: 'companyNameField' },
        companyEmail: { label: 'Email de Contato', id: 'companyEmailField' },
        companyPhone: { label: 'Telefone', id: 'companyPhoneField' },
        companyAddress: { label: 'Endereço', id: 'companyAddressField' },
        weekdayHours: { label: 'Segunda à Sexta', id: 'weekdayHoursField' },
        saturdayHours: { label: 'Sábado', id: 'saturdayHoursField' },
        sundayHours: { label: 'Domingo', id: 'sundayHoursField' }
    };
    
    const info = campos[campo];
    if (!info) {
        alert('Campo inválido!');
        return;
    }
    
    const valorAtual = settings[campo] || '';
    
    // USAR PROMPT MESMO (MAIS SIMPLES E GARANTIDO)
    const novoValor = prompt(`Editar ${info.label}:`, valorAtual);
    
    if (novoValor !== null && novoValor.trim() !== '') {
        // Atualizar objeto
        settings[campo] = novoValor.trim();
        
        // Salvar no localStorage
        localStorage.setItem('nexbook_settings', JSON.stringify(settings));
        
        // Atualizar o elemento na tela
        const elemento = document.getElementById(info.id);
        if (elemento) {
            elemento.textContent = novoValor.trim();
            console.log(`✅ Campo ${info.id} atualizado`);
        }
        
        alert('✅ Configuração salva!');
    }
};

// SE QUISER USAR O MODAL (CASO ELE EXISTA)
window.editSettingWithModal = function(campo) {
    console.log('✏️ Editando com modal:', campo);
    
    const campos = {
        companyName: { label: 'Nome da Empresa', id: 'companyNameField' },
        companyEmail: { label: 'Email de Contato', id: 'companyEmailField' },
        companyPhone: { label: 'Telefone', id: 'companyPhoneField' },
        companyAddress: { label: 'Endereço', id: 'companyAddressField' },
        weekdayHours: { label: 'Segunda à Sexta', id: 'weekdayHoursField' },
        saturdayHours: { label: 'Sábado', id: 'saturdayHoursField' },
        sundayHours: { label: 'Domingo', id: 'sundayHoursField' }
    };
    
    const info = campos[campo];
    if (!info) return;
    
    // Pegar o modal
    const modal = document.getElementById('genericModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalFields = document.getElementById('modalFields');
    const saveBtn = document.getElementById('saveModalBtn');
    
    if (!modal || !modalTitle || !modalFields || !saveBtn) {
        // Se modal não existe, usa prompt
        editSetting(campo);
        return;
    }
    
    // Configurar modal
    modalTitle.textContent = `Editar ${info.label}`;
    modalFields.innerHTML = `
        <div style="padding: 20px;">
            <label style="display: block; margin-bottom: 10px; font-weight: 500;">${info.label}</label>
            <input type="text" 
                   id="modalInput" 
                   style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px;"
                   value="${settings[campo] || ''}">
        </div>
    `;
    
    // Configurar botão salvar
    saveBtn.onclick = function() {
        const input = document.getElementById('modalInput');
        if (input && input.value.trim() !== '') {
            settings[campo] = input.value.trim();
            localStorage.setItem('nexbook_settings', JSON.stringify(settings));
            
            const elemento = document.getElementById(info.id);
            if (elemento) elemento.textContent = input.value.trim();
            
            modal.style.display = 'none';
            alert('✅ Salvo!');
        }
    };
    
    // Mostrar modal
    modal.style.display = 'flex';
};

// Atualizar todos os campos na tela
function atualizarTodosCampos() {
    console.log('Atualizando campos...');
    
    const elementos = {
        companyNameField: settings.companyName,
        companyEmailField: settings.companyEmail,
        companyPhoneField: settings.companyPhone,
        companyAddressField: settings.companyAddress,
        weekdayHoursField: settings.weekdayHours,
        saturdayHoursField: settings.saturdayHours,
        sundayHoursField: settings.sundayHours
    };
    
    for (let [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = valor;
            console.log(`Campo ${id} atualizado para: ${valor}`);
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, atualizando campos...');
    atualizarTodosCampos();
});

// Atualizar também depois de 1 segundo
setTimeout(atualizarTodosCampos, 1000);