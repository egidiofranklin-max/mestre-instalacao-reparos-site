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

// ======================================================
// 5. AVALIAÇÕES DO GOOGLE (Places API)
//    - Só busca quando o visitante chega perto da seção
//    - Guarda o resultado no navegador por 24 horas
//    - Se o Google não responder, a seção continua escondida
// ======================================================
(function () {
    const secao = document.getElementById('avaliacoes');
    if (!secao) return;

    const CHAVE_API = 'AIzaSyAInPIKaYmFyPfcxFzbo8_xUstYFn2XFB0';
    const PLACE_ID = 'ChIJvfwombEjSI4RU9InqBMsYHQ';
    const MEMORIA = 'mestre-avaliacoes-v1';
    const VALIDADE = 24 * 60 * 60 * 1000; // 24 horas
    const CORES = ['#1a73e8', '#e37400', '#188038', '#a142f4', '#d93025', '#12b5cb', '#c5221f', '#5f6368'];

    function lerMemoria() {
        try {
            const salvo = JSON.parse(localStorage.getItem(MEMORIA));
            if (salvo && Date.now() - salvo.quando < VALIDADE) return salvo.dados;
        } catch (e) { /* navegador sem memória liberada: segue sem */ }
        return null;
    }

    function gravarMemoria(dados) {
        try { localStorage.setItem(MEMORIA, JSON.stringify({ quando: Date.now(), dados })); } catch (e) { }
    }

    async function buscarNoGoogle() {
        const resposta = await fetch(
            'https://places.googleapis.com/v1/places/' + PLACE_ID + '?languageCode=pt-BR',
            { headers: { 'X-Goog-Api-Key': CHAVE_API, 'X-Goog-FieldMask': 'rating,googleMapsUri,reviews' } }
        );
        if (!resposta.ok) throw new Error('Google respondeu ' + resposta.status);
        return resposta.json();
    }

    function estrelas(n) {
        const cheias = Math.round(n || 0);
        return '★'.repeat(cheias) + '☆'.repeat(5 - cheias);
    }

    function montarCartao(avaliacao) {
        const autor = avaliacao.authorAttribution || {};
        const nome = autor.displayName || 'Cliente Google';
        const texto = (avaliacao.text && avaliacao.text.text) || (avaliacao.originalText && avaliacao.originalText.text) || '';

        const cartao = document.createElement('article');
        cartao.className = 'avaliacao-card';

        const topo = document.createElement('div');
        topo.className = 'avaliacao-autor';

        // Inicial colorida, igual o Google faz quando o cliente não tem foto
        const inicial = document.createElement('span');
        inicial.className = 'avaliacao-inicial';
        inicial.textContent = nome.trim().charAt(0).toUpperCase();
        inicial.style.backgroundColor = CORES[nome.length % CORES.length];
        inicial.setAttribute('aria-hidden', 'true');

        if (autor.photoUri) {
            const foto = document.createElement('img');
            foto.className = 'avaliacao-foto';
            foto.src = autor.photoUri;
            foto.alt = '';
            foto.width = 42; foto.height = 42;
            foto.loading = 'lazy';
            foto.referrerPolicy = 'no-referrer';
            foto.onerror = () => foto.replaceWith(inicial);
            topo.appendChild(foto);
        } else {
            topo.appendChild(inicial);
        }

        const identificacao = document.createElement('div');
        const linkNome = document.createElement(autor.uri ? 'a' : 'span');
        linkNome.className = 'avaliacao-nome';
        linkNome.textContent = nome;
        if (autor.uri) { linkNome.href = autor.uri; linkNome.target = '_blank'; linkNome.rel = 'noopener noreferrer'; }
        const quando = document.createElement('span');
        quando.className = 'avaliacao-quando';
        quando.textContent = avaliacao.relativePublishTimeDescription || '';
        identificacao.append(linkNome, quando);
        topo.appendChild(identificacao);

        const notaCliente = document.createElement('div');
        notaCliente.className = 'avaliacao-estrelas';
        notaCliente.textContent = estrelas(avaliacao.rating);
        notaCliente.setAttribute('aria-label', 'Nota ' + avaliacao.rating + ' de 5');

        const paragrafo = document.createElement('p');
        paragrafo.className = 'avaliacao-texto';
        paragrafo.textContent = texto;

        cartao.append(topo, notaCliente, paragrafo);
        return cartao;
    }

    function mostrar(dados) {
        const lista = (dados.reviews || []).filter(a => a.rating >= 4 && ((a.text && a.text.text) || (a.originalText && a.originalText.text)));
        if (!lista.length) return; // nada para mostrar: seção continua escondida

        if (dados.rating) {
            secao.querySelector('.avaliacoes-numero').textContent = dados.rating.toFixed(1).replace('.', ',');
            secao.querySelector('.avaliacoes-estrelas').textContent = estrelas(dados.rating);
        }
        if (dados.googleMapsUri) secao.querySelector('.avaliacoes-link').href = dados.googleMapsUri;

        const trilho = secao.querySelector('.avaliacoes-trilho');
        const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        lista.forEach(a => trilho.appendChild(montarCartao(a)));
        if (!semMovimento) {
            // Segunda cópia dos cartões para a faixa rodar sem emenda
            lista.forEach(a => {
                const copia = montarCartao(a);
                copia.setAttribute('aria-hidden', 'true');
                trilho.appendChild(copia);
            });
            trilho.style.setProperty('--duracao', (lista.length * 9) + 's');
        }

        // No celular, encostar o dedo para a faixa para ler
        const faixa = secao.querySelector('.avaliacoes-faixa');
        let soltar;
        faixa.addEventListener('touchstart', () => { clearTimeout(soltar); faixa.classList.add('parado'); }, { passive: true });
        faixa.addEventListener('touchend', () => { soltar = setTimeout(() => faixa.classList.remove('parado'), 2500); }, { passive: true });

        secao.hidden = false;
    }

    async function carregar() {
        let dados = lerMemoria();
        if (!dados) {
            try {
                dados = await buscarNoGoogle();
                gravarMemoria(dados);
            } catch (e) {
                return; // sem resposta do Google: seção fica escondida
            }
        }
        mostrar(dados);
    }

    // Só busca quando o visitante chega perto (a 600px) da seção
    const vigia = secao.previousElementSibling || secao;
    if ('IntersectionObserver' in window) {
        const observador = new IntersectionObserver((entradas) => {
            if (entradas.some(e => e.isIntersecting)) { observador.disconnect(); carregar(); }
        }, { rootMargin: '0px 0px 600px 0px' });
        observador.observe(document.getElementById('portfolio') || vigia);
    } else {
        carregar();
    }
})();
