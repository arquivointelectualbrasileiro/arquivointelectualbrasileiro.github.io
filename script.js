document.addEventListener('DOMContentLoaded', function() {

    // Preserva a origem entre a landing page e o checkout da Hotmart.
    // O parâmetro SCK é o identificador nativo de campanhas para produtores.
    const landingParams = new URLSearchParams(window.location.search);
    const attributionParams = [
        'sck',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term'
    ];
    const checkoutLinks = document.querySelectorAll('a[href*="pay.hotmart.com"]');

    checkoutLinks.forEach(link => {
        const checkoutUrl = new URL(link.href);

        attributionParams.forEach(param => {
            const value = landingParams.get(param);
            if (value) {
                checkoutUrl.searchParams.set(param, value);
            }
        });

        link.href = checkoutUrl.toString();

        link.addEventListener('click', () => {
            if (typeof window.gtag !== 'function') {
                return;
            }

            window.gtag('event', 'cta_checkout_click', {
                cta_placement: link.dataset.ctaPlacement || 'unknown',
                offer: link.dataset.offer || 'unknown',
                sck: landingParams.get('sck') || 'unknown',
                campaign_source: landingParams.get('utm_source') || 'unknown',
                campaign_medium: landingParams.get('utm_medium') || 'unknown',
                campaign_name: landingParams.get('utm_campaign') || 'unknown',
                campaign_content: landingParams.get('utm_content') || 'unknown'
            });
        });
    });

    // Animação de Scroll (Fade-in)
    const fadeElements = document.querySelectorAll('.fade-in-section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Animação inicial para elementos que já estão na tela (como o cabeçalho)
    const initialFadeElements = document.querySelectorAll('.fade-in');
    initialFadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // --- NOVO: Funcionalidade do FAQ Interativo ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fecha todos os outros itens abertos para ter apenas um aberto por vez
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Abre ou fecha o item clicado
            item.classList.toggle('active');
        });
    });
    
});
