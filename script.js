/*==================== NAVIGATION MENU ====================*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');

// Menu show
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

// Menu hidden
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

// Remove menu mobile when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
});

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 80;
        const sectionId = current.getAttribute('id');
        const link = document.querySelector(`.nav__link[href*="${sectionId}"]`);

        if (link) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        }
    });
}

window.addEventListener('scroll', scrollActive);

/*==================== CHANGE HEADER BACKGROUND ON SCROLL ====================*/
function scrollHeader() {
    const header = document.getElementById('header');
    if (this.scrollY >= 80) {
        header.style.boxShadow = '0 4px 16px rgba(0, 33, 71, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 33, 71, 0.08)';
    }
}

window.addEventListener('scroll', scrollHeader);

/*==================== SMOOTH SCROLL ====================*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/*==================== SCROLL REVEAL ANIMATION ====================*/
// Simple scroll reveal implementation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(element => {
    observer.observe(element);
});

/*==================== CONTACT FORM ====================*/
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitButton.disabled = true;

        try {
            // Here you can integrate with your email service
            // For now, we'll create a mailto link as fallback
            
            const mailtoLink = `mailto:agnesbenites@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
                `Nome: ${formData.name}\n` +
                `Email: ${formData.email}\n` +
                `Telefone: ${formData.phone}\n` +
                `Assunto: ${formData.subject}\n\n` +
                `Mensagem:\n${formData.message}`
            )}`;

            // Open mailto link
            window.location.href = mailtoLink;

            // Show success message
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Mensagem preparada! Seu cliente de e-mail será aberto.';
            formMessage.style.display = 'block';

            // Reset form
            contactForm.reset();

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            // Show error message
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato via WhatsApp.';
            formMessage.style.display = 'block';

            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        } finally {
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

/*==================== CALENDLY INTEGRATION ====================*/
// Configure your Calendly link here
const calendlyLink = document.getElementById('calendly-link');
if (calendlyLink) {
    calendlyLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // IMPORTANT: Replace this URL with your actual Calendly link
        const YOUR_CALENDLY_URL = 'https://calendly.com/seu-usuario/consultoria-juridica';
        
        // Check if user has set their Calendly URL
        if (YOUR_CALENDLY_URL.includes('seu-usuario')) {
            alert('Por favor, configure seu link do Calendly no arquivo script.js\n\nProcure por "YOUR_CALENDLY_URL" e substitua pela sua URL do Calendly.');
            return;
        }
        
        // Open Calendly in new tab
        window.open(YOUR_CALENDLY_URL, '_blank');
    });
}

/*==================== SCROLL TO TOP BUTTON ====================*/
const scrollTopButton = document.createElement('button');
scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopButton.className = 'scroll-top';
scrollTopButton.setAttribute('aria-label', 'Voltar ao topo');
document.body.appendChild(scrollTopButton);

// Add scroll-top button styles dynamically
const scrollTopStyles = document.createElement('style');
scrollTopStyles.textContent = `
    .scroll-top {
        position: fixed;
        bottom: 6rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: var(--transition-base);
        box-shadow: var(--shadow-lg);
        z-index: 998;
    }
    
    .scroll-top.show {
        opacity: 1;
        visibility: visible;
    }
    
    .scroll-top:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
    }
    
    @media screen and (max-width: 768px) {
        .scroll-top {
            bottom: 5rem;
            right: 1rem;
            width: 45px;
            height: 45px;
        }
    }
`;
document.head.appendChild(scrollTopStyles);

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
        scrollTopButton.classList.add('show');
    } else {
        scrollTopButton.classList.remove('show');
    }
});

// Scroll to top functionality
scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

/*==================== PRELOAD FONTS ====================*/
// Ensure fonts are loaded before showing content
if ('fonts' in document) {
    Promise.all([
        document.fonts.load('1rem Playfair Display'),
        document.fonts.load('1rem Montserrat')
    ]).then(() => {
        document.body.style.opacity = '1';
    });
}

/*==================== PERFORMANCE OPTIMIZATION ====================*/
// Lazy load images if implemented
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

/*==================== UTILITIES ====================*/
// Format phone numbers
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        
        e.target.value = value;
    });
});

/*==================== CONSOLE MESSAGE ====================*/
console.log('%c Agnes Benites - Consultoria Jurídica ', 'background: #002147; color: #FFD580; font-size: 16px; padding: 10px; font-weight: bold;');
console.log('%c Website desenvolvido com dedicação 💼⚖️ ', 'background: #FF6F61; color: white; font-size: 14px; padding: 8px;');
console.log('\n📧 Contato: agnesbenites@gmail.com');
console.log('📱 WhatsApp: (11) 97713-5615');
console.log('🌐 100% online para todo o Brasil\n');

/*==================== INITIAL SETUP ====================*/
document.addEventListener('DOMContentLoaded', () => {
    // Set initial body opacity for font loading
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    // Trigger initial scroll active
    scrollActive();
    
    // Log page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`⚡ Página carregada em ${Math.round(loadTime)}ms`);
    });
});
