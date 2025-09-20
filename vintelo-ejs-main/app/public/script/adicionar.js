let selectedPhotos = [];
let selectedSize = '';

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    
    syncFormFields();
    
   
    addValidationListeners();
}

function syncFormFields() {
    const priceInput = document.getElementById('item-price');
    const priceMobileInput = document.getElementById('item-price-mobile');
    const colorInput = document.getElementById('item-color');
    const colorMobileInput = document.getElementById('item-color-mobile');
    
    if (priceInput && priceMobileInput) {
        priceInput.addEventListener('input', () => {
            priceMobileInput.value = priceInput.value;
        });
        priceMobileInput.addEventListener('input', () => {
            priceInput.value = priceMobileInput.value;
        });
    }
    
    if (colorInput && colorMobileInput) {
        colorInput.addEventListener('input', () => {
            colorMobileInput.value = colorInput.value;
        });
        colorMobileInput.addEventListener('input', () => {
            colorInput.value = colorMobileInput.value;
        });
    }
}

function addValidationListeners() {
    const form = document.querySelector('.item-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
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
        showFieldError(field, 'Email inválido');
        return false;
    }
    
    if (field.name === 'price' && value && !isValidPrice(value)) {
        showFieldError(field, 'Preço inválido');
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
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPrice(price) {
    const priceRegex = /^R\$\s?\d+([.,]\d{2})?$/;
    return priceRegex.test(price);
}

// Formatação de preço
function formatPrice(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length === 0) {
        input.value = '';
        return;
    }
    
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',');
    input.value = 'R$ ' + value;
    
    const otherInput = input.id.includes('mobile') ? 
        document.getElementById('item-price') : 
        document.getElementById('item-price-mobile');
    
    if (otherInput) {
        otherInput.value = input.value;
    }
}

function selectMainPhoto() {
    const input = document.getElementById('main-photo-input');
    input.click();
}

function selectPhoto(index) {
    const input = document.getElementById(`thumb-input-${index}`);
    input.click();
}

function handlePhotoUpload(input, targetId) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem.', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 5MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById(targetId);
        img.src = e.target.result;
        img.style.display = 'block';
        
        selectedPhotos[targetId] = file;
        
        showNotification('Foto adicionada com sucesso!', 'success');
    };
    
    reader.readAsDataURL(file);
}

function selectSize(button) {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    button.classList.add('selected');
    selectedSize = button.dataset.size;
    
    const hiddenInput = document.getElementById('selected-size');
    if (hiddenInput) {
        hiddenInput.value = selectedSize;
    }
}

function submitForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    if (!validateForm(form)) {
        showNotification('Por favor, corrija os erros no formulário.', 'error');
        return;
    }
    
    if (!selectedSize) {
        showNotification('Por favor, selecione um tamanho.', 'error');
        return;
    }
    
    Object.keys(selectedPhotos).forEach(key => {
        if (selectedPhotos[key]) {
            formData.append('photos[]', selectedPhotos[key]);
        }
    });

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        
        showNotification('Peça enviada para curadoria com sucesso!', 'success');
        
        resetForm(form);
    }, 2000);
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const event = { target: input };
        if (!validateField(event)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function resetForm(form) {
    form.reset();
    selectedPhotos = [];
    selectedSize = '';
    
    document.querySelectorAll('[id^="thumb-"]').forEach(img => {
        if (img.id !== 'thumb-0') {
            img.style.display = 'none';
            img.src = '';
        }
    });
    
    const mainPhoto = document.getElementById('main-photo');
    mainPhoto.src = 'imagens/add peça.png';

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
    
    document.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
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
    .form-group select.error,
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