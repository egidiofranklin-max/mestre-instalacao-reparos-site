// ======================================================
// 1. FUNÇÃO DA GALERIA DE FOTOS (PORTFÓLIO)
// ======================================================
function toggleGaleria() {
    const overlay = document.getElementById('galeria-overlay');
    if (overlay) {
        overlay.classList.toggle('ativa');
        document.body.style.overflow = overlay.classList.contains('ativa') ? 'hidden' : 'auto';
    }
}

// ======================================================
// 2. SISTEMA DE DÚVIDAS FREQUENTES (FAQ SANFONA)
// ======================================================
document.addEventListener('DOMContentLoaded', function() {
    const faqBotoes = document.querySelectorAll('.faq-pergunta');

    faqBotoes.forEach(botao => {
        botao.addEventListener('click', function() {
            this.classList.toggle('ativa');
            const resposta = this.nextElementSibling;
            if (resposta.style.maxHeight) {
                resposta.style.maxHeight = null;
            } else {
                resposta.style.maxHeight = resposta.scrollHeight + "px";
            }
        });
    });
});

// ======================================================
// 3. GATILHO DE ROLAGEM (SESSÃO DE EMERGÊNCIA)
// ======================================================
document.addEventListener("DOMContentLoaded", function() {
    const observerOptions = {
        // AJUSTE AQUI: 0.6 significa que 60% da seção precisa estar visível
        threshold: 0.6,
        // AJUSTE AQUI: margem negativa de 50px para "segurar" o disparo
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animar');
                // IMPORTANTE: Unobserve para não ficar repetindo a animação toda vez que rolar
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const target = document.querySelector('.chamada-urgente');
    if (target) {
        observer.observe(target);
    }
});


      let ultimoScroll = 0;
      const header = document.querySelector("header");

      window.addEventListener("scroll", () => {
        const scrollAtual = window.pageYOffset;
        if (scrollAtual <= 0) {
          header.classList.remove("header-escondido");
          return;
        }
        if (scrollAtual > ultimoScroll && !header.classList.contains("header-escondido")) {
          header.classList.add("header-escondido");
        } else if (scrollAtual < ultimoScroll && header.classList.contains("header-escondido")) {
          header.classList.remove("header-escondido");
        }
        ultimoScroll = scrollAtual;
      });
    