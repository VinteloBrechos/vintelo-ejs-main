let currentSection = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    loadProfileData();
    addFormListeners();
    setupNotificationToggles();
}

function loadProfileData() {
    const profileData = {
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '(11) 99999-9999',
        memberSince: 'Janeiro 2024',
        stats: {
            orders: 12,
            favorites: 5,
            reviews: 3
        }
    };
    updateProfileDisplay(profileData);
}
function updateProfileDisplay(data) {
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-email').textContent = data.email;

    const stats = document.querySelectorAll('.stat-number');
    stats[0].textContent = data.stats.orders;
    stats[1].textContent = data.stats.favorites;
    stats[2].textContent = data.stats.reviews;
}

function addFormListeners() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhone);
    }
}

function showSection(sectionId) {
    document.querySelector('.content-wrapper').style.display = 'none';
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        currentSection = sectionId;
        window.scrollTo(0, 0);
        loadSectionData(sectionId);
    }
}
function hideAllSections() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.querySelector('.content-wrapper').style.display = 'flex';
    currentSection = null;
    window.scrollTo(0, 0);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'orders':
            loadOrdersData();
            break;
        case 'favorites':
            loadFavoritesData();
            break;
        case 'addresses':
            loadAddressesData();
            break;
        case 'payment':
            loadPaymentData();
            break;
    }
}

function loadOrdersData() {
    showNotification('Pedidos carregados com sucesso!', 'success');
}

function loadFavoritesData() {
    showNotification('Favoritos carregados!', 'info');
}
function loadAddressesData() {
    console.log('Carregando endereços...');
}

function loadPaymentData() {

    console.log('Carregando métodos de pagamento...');
}

function editProfilePhoto() {
    const input = document.getElementById('profile-photo-input');
    input.click();
}
function handleProfilePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem.', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 2MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('profile-img');
        img.src = e.target.result;
        
        showNotification('Foto do perfil atualizada!', 'success');
    };
    
    reader.readAsDataURL(file);
}

function updatePersonalInfo(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    if (!validatePersonalInfo(data)) {
        return;
    }
    setTimeout(() => {
        document.getElementById('profile-name').textContent = `${data.firstName} ${data.lastName}`;
        document.getElementById('profile-email').textContent = data.email;
        
        showNotification('Informações atualizadas com sucesso!', 'success');
    }, 1000);
}

function validatePersonalInfo(data) {
    if (!data.firstName || !data.lastName) {
        showNotification('Nome e sobrenome são obrigatórios.', 'error');
        return false;
    }
    
    if (!isValidEmail(data.email)) {
        showNotification('E-mail inválido.', 'error');
        return false;
    }
    
    return true;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();

    clearFieldError(event);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'E-mail inválido');
        return false;
    }
    
    return true;
}

function clearFieldError(event) {
    const field = event.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('error');
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatPhone(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (value.length < 14) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    }
    
    event.target.value = value;
}
function setupNotificationToggles() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const notificationName = this.closest('.notification-item').querySelector('h3').textContent;
            const status = this.checked ? 'ativadas' : 'desativadas';
            
            showNotification(`Notificações de "${notificationName}" ${status}.`, 'info');
        });
    });
}

function toggleOrderDetails(button) {
    const orderCard = button.closest('.order-card');
    const orderDetails = orderCard.querySelector('.order-details');
    
    if (orderDetails.style.display === 'none' || !orderDetails.style.display) {
        orderDetails.style.display = 'block';
        button.textContent = 'Ocultar Detalhes';
    } else {
        orderDetails.style.display = 'none';
        button.textContent = 'Ver Detalhes';
    }
}

function toggleTracking(button) {
    const orderCard = button.closest('.order-card');
    const trackingDetails = orderCard.querySelector('.tracking-details');
    
    if (trackingDetails) {
        if (trackingDetails.style.display === 'none' || !trackingDetails.style.display) {
            trackingDetails.style.display = 'block';
            button.textContent = 'Ocultar Rastreamento';
        } else {
            trackingDetails.style.display = 'none';
            const buttonText = button.textContent.includes('Ver') ? 'Ver Rastreamento' : 'Rastrear Pedido';
            button.textContent = buttonText;
        }
    }
}

function viewOrder(orderId) {
    showNotification(`Carregando detalhes do pedido #${orderId}...`, 'info');

    setTimeout(() => {
        showNotification(`Detalhes do pedido #${orderId} carregados!`, 'success');
    }, 1500);
}

function removeFavorite(itemId) {
    if (confirm('Deseja remover este item dos favoritos?')) {
        const favoriteItem = event.target.closest('.favorite-item');
        favoriteItem.style.opacity = '0.5';
        
        setTimeout(() => {
            favoriteItem.remove();
            showNotification('Item removido dos favoritos.', 'success');
            const statNumber = document.querySelectorAll('.stat-number')[1];
            const currentCount = parseInt(statNumber.textContent);
            statNumber.textContent = currentCount - 1;
        }, 300);
    }
}

function editAddress(addressId) {
    const addressItem = document.querySelector(`[data-address-id="${addressId}"]`);
    if (!addressItem) return;

    const addressInfo = addressItem.querySelector('.address-info');
    const name = addressInfo.querySelector('h3').textContent;
    const addressLines = addressInfo.querySelectorAll('p');

    document.getElementById('modal-title').textContent = 'Editar Endereço';
    document.getElementById('address-name').value = name;

    const cepText = addressLines[2].textContent;
    const cep = cepText.replace('CEP: ', '');
    document.getElementById('address-cep').value = cep;

    const fullAddress = addressLines[0].textContent;
    const addressParts = fullAddress.split(', ');
    document.getElementById('address-street').value = addressParts[0] || '';
    document.getElementById('address-number').value = addressParts[1] || '';

    const locationText = addressLines[1].textContent;
    const locationParts = locationText.split(' - ');
    document.getElementById('address-neighborhood').value = locationParts[0] || '';
    
    if (locationParts[1]) {
        const cityState = locationParts[1].split(', ');
        document.getElementById('address-city').value = cityState[0] || '';
        document.getElementById('address-state').value = cityState[1] || '';
    }

    const form = document.querySelector('.address-form');
    form.setAttribute('data-edit-id', addressId);

    document.getElementById('address-modal').style.display = 'block';
}

function deleteAddress(addressId) {
    if (confirm('Deseja excluir este endereço?')) {
        const addressItem = event.target.closest('.address-item');
        addressItem.style.opacity = '0.5';
        
        setTimeout(() => {
            addressItem.remove();
            showNotification('Endereço excluído com sucesso.', 'success');
        }, 300);
    }
}

function addNewAddress() {
    document.getElementById('modal-title').textContent = 'Adicionar Novo Endereço';
    document.getElementById('address-modal').style.display = 'block';
    clearAddressForm();
}

function closeAddressModal() {
    document.getElementById('address-modal').style.display = 'none';
    clearAddressForm();
}

function clearAddressForm() {
    const form = document.querySelector('.address-form');
    form.reset();
    form.removeAttribute('data-edit-id');
}

function saveAddress(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const addressData = {
        name: formData.get('addressName'),
        cep: formData.get('cep'),
        street: formData.get('street'),
        number: formData.get('number'),
        neighborhood: formData.get('neighborhood'),
        city: formData.get('city'),
        state: formData.get('state'),
        complement: formData.get('complement')
    };
    
    if (!isValidCEP(addressData.cep)) {
        showNotification('CEP inválido. Use o formato 00000-000', 'error');
        return;
    }
    
    const editId = event.target.getAttribute('data-edit-id');
    
    if (editId) {
        updateAddressInList(editId, addressData);
        showNotification('Endereço atualizado com sucesso!', 'success');
    } else {
        addAddressToList(addressData);
        showNotification('Endereço adicionado com sucesso!', 'success');
    }
    
    closeAddressModal();
}

function addAddressToList(addressData) {
    const addressesList = document.querySelector('.addresses-list');
    const addButton = addressesList.querySelector('.add-address-btn');
    
    const addressItem = createAddressElement(addressData, Date.now());
    addressesList.insertBefore(addressItem, addButton);
}

function createAddressElement(addressData, id) {
    const addressItem = document.createElement('section');
    addressItem.className = 'address-item';
    addressItem.setAttribute('data-address-id', id);
    
    const complement = addressData.complement ? `, ${addressData.complement}` : '';
    
    addressItem.innerHTML = `
        <section class="address-info">
            <h3>${addressData.name}</h3>
            <p>${addressData.street}, ${addressData.number}${complement}</p>
            <p>${addressData.neighborhood} - ${addressData.city}, ${addressData.state}</p>
            <p>CEP: ${addressData.cep}</p>
        </section>
        <section class="address-actions">
            <button class="edit-address-btn" onclick="editAddress(${id})">Editar</button>
            <button class="delete-address-btn" onclick="deleteAddress(${id})">Excluir</button>
        </section>
    `;
    
    return addressItem;
}

function updateAddressInList(id, addressData) {
    const addressItem = document.querySelector(`[data-address-id="${id}"]`);
    if (addressItem) {
        const newElement = createAddressElement(addressData, id);
        addressItem.parentNode.replaceChild(newElement, addressItem);
    }
}

function searchCEP() {
    const cep = document.getElementById('address-cep').value.replace(/\D/g, '');
    
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('address-street').value = data.logradouro || '';
                    document.getElementById('address-neighborhood').value = data.bairro || '';
                    document.getElementById('address-city').value = data.localidade || '';
                    document.getElementById('address-state').value = data.uf || '';
                    document.getElementById('address-number').focus();
                } else {
                    showNotification('CEP não encontrado', 'error');
                }
            })
            .catch(() => {
                showNotification('Erro ao buscar CEP', 'error');
            });
    }
}

function isValidCEP(cep) {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
}

function formatCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    input.value = value;
    
    if (value.length === 9) {
        searchCEP();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const cepInput = document.getElementById('address-cep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            formatCEP(this);
        });
    }

    const modal = document.getElementById('address-modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeAddressModal();
            }
        });
    }
});

function editPayment(paymentId) {
    showNotification(`Editando método de pagamento #${paymentId}...`, 'info');
}

function deletePayment(paymentId) {
    if (confirm('Deseja remover este método de pagamento?')) {
        const paymentItem = event.target.closest('.payment-item');
        paymentItem.style.opacity = '0.5';
        
        setTimeout(() => {
            paymentItem.remove();
            showNotification('Método de pagamento removido.', 'success');
        }, 300);
    }
}

function addNewPayment() {
    showNotification('Abrindo formulário de novo cartão...', 'info');
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        maxWidth: '300px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });

    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

const errorStyles = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #e74c3c;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    }
    
    .field-error {
        display: block;
        margin-top: 5px;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

document.addEventListener('keydown', function(event) {

    if (event.key === 'Escape' && currentSection) {
        hideAllSections();
    }
});