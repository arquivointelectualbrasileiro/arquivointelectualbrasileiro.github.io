document.addEventListener('DOMContentLoaded', function() {

    // --- Funcionalidade do FAQ (Accordion) ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Fecha todos os outros itens para manter apenas um aberto
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Alterna a classe 'active' no item clicado
            item.classList.toggle('active');
        });
    });

    // --- Funcionalidade de Fade-in ao Rolar ---
    const fadeOnScroll = (selector) => {
        const sections = document.querySelectorAll(selector);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Opcional: para de observar o elemento uma vez que ele está visível
                    // observer.unobserve(entry.target); 
                }
            });
        }, {
            threshold: 0.1 // A animação começa quando 10% do elemento está visível
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    };

    // Aplica o efeito de fade-in ao carregar a página
    const fadeInOnLoad = document.querySelectorAll('.fade-in');
    setTimeout(() => {
        fadeInOnLoad.forEach(el => el.style.opacity = '1');
    }, 100);

    // Aplica o efeito de fade-in nas seções durante o scroll
    fadeOnScroll('.fade-in-section');

});
