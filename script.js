// ======================================================
// 1. GALERIA DE FOTOS (PORTFÓLIO)
//    Chamada pelos botões "VER GALERIA" e "FECHAR" no HTML
// ======================================================
function toggleGaleria() {
    const overlay = document.getElementById('galeria-overlay');
    if (!overlay) return;

    overlay.classList.toggle('ativa');
    // Trava a rolagem da página enquanto a galeria está aberta
    document.body.style.overflow = overlay.classList.contains('ativa') ? 'hidden' : 'auto';
}

// ======================================================
// 2. DÚVIDAS FREQUENTES (FAQ SANFONA)
// ======================================================
document.querySelectorAll('.faq-pergunta').forEach(botao => {
    botao.addEventListener('click', function () {
        this.classList.toggle('ativa');
        const resposta = this.nextElementSibling;
        resposta.style.maxHeight = resposta.style.maxHeight ? null : resposta.scrollHeight + 'px';
    });
});

// ======================================================
// 3. GATILHO DE ROLAGEM (SEÇÃO "O TELHADO VAZOU?")
//    Adiciona a classe "animar" quando a seção aparece na tela
// ======================================================
const chamadaUrgente = document.querySelector('.chamada-urgente');

if (chamadaUrgente) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animar');
                observer.unobserve(entry.target); // Anima só uma vez
            }
        });
    }, {
        threshold: 0.6,                    // AJUSTE: 60% da seção precisa estar visível
        rootMargin: '0px 0px -50px 0px'    // AJUSTE: margem de 50px para "segurar" o disparo
    });

    observer.observe(chamadaUrgente);
}

// ======================================================
// 4. CABEÇALHO QUE SE ESCONDE AO ROLAR PARA BAIXO
//    e volta ao rolar para cima (efeito no celular)
// ======================================================
const header = document.querySelector('header');
let ultimoScroll = 0;

window.addEventListener('scroll', () => {
    const scrollAtual = window.scrollY;

    if (scrollAtual <= 0) {
        header.classList.remove('header-escondido');
        return;
    }

    if (scrollAtual > ultimoScroll) {
        header.classList.add('header-escondido');      // Rolando para baixo
    } else if (scrollAtual < ultimoScroll) {
        header.classList.remove('header-escondido');   // Rolando para cima
    }

    ultimoScroll = scrollAtual;
}, { passive: true });
