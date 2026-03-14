// ============================================
// FUNÇÕES DE MÁSCARA
// ============================================

// 50. Máscara de moeda
function mascaraMoeda(input) {
    let v = input.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = v;
}

// 51. Máscara de CPF
function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
}

// 52. Máscara de telefone
function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = v;
}

// 53. Máscara de CEP
function mascaraCEP(input) {
    let v = input.value.replace(/\D/g, '');
    v = v.replace(/^(\d{5})(\d)/, '$1-$2');
    input.value = v;
}

// 54. Buscar CEP
async function buscarCep() {
    const cep = document.getElementById('modalCep')?.value.replace(/\D/g, '');
    if (cep && cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('modalAddress').value = data.logradouro || '';
                document.getElementById('modalNeighborhood').value = data.bairro || '';
                document.getElementById('modalCity').value = data.localidade || '';
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }
}