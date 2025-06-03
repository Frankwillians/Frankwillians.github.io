// JavaScript específico para a página de serviços

document.addEventListener('DOMContentLoaded', function() {
    // Tabs de tecnologia
    const techTabs = document.querySelectorAll('.tech-tab');
    const techContents = document.querySelectorAll('.tech-content');
    
    techTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class de todas as tabs
            techTabs.forEach(t => t.classList.remove('active'));
            
            // Adiciona active class à tab clicada
            this.classList.add('active');
            
            // Esconde todos os conteúdos
            techContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostra o conteúdo correspondente
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });
    
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            
            // Verifica se o item já está ativo
            const isActive = faqItem.classList.contains('active');
            
            // Fecha todos os itens
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Se o item clicado não estava ativo, abre-o
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
    
    // Animação de entrada para elementos
    const animateElements = document.querySelectorAll('.tech-content-inner, .pricing-card, .faq-item');
    
    function checkIfInView() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }
    
    window.addEventListener('scroll', checkIfInView);
    checkIfInView();
});
