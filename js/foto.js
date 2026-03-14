// ============================================
// FUNÇÕES DE FOTO
// ============================================

// 43. Abrir câmera
function openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handlePhotoSelect(e);
    input.click();
}

// 44. Upload da galeria
function uploadFromGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handlePhotoSelect(e);
    input.click();
}

// 45. Manipular seleção de foto
function handlePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhotoBase64 = e.target.result;
        
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${currentPhotoBase64}" alt="Preview">`;
        }
    };
    reader.readAsDataURL(file);
}   