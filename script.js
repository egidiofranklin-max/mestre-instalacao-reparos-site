// ======================================================
// 0. ROLAGEM SUAVE
//    - Ao atualizar ou voltar, o navegador reposiciona a página
//      sozinho; nesses casos a rolagem suave só liga depois que
//      a página terminou de carregar, para não deslizar na tela
//    - Nos outros casos (como o "Ver todos os serviços") liga
//      na hora, e continua deslizando como antes
// ======================================================
(function () {
    const raiz = document.documentElement;
    const navegacao = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const tipo = navegacao ? navegacao.type : '';
    const ligar = () => raiz.classList.add('rolagem-suave');

    if (tipo === 'reload' || tipo === 'back_forward') {
        const depoisDeCarregar = () => setTimeout(ligar, 600);
        if (document.readyState === 'complete') depoisDeCarregar();
        else window.addEventListener('load', depoisDeCarregar);
    } else {
        ligar();
    }

    // Voltou para a página pelo histórico (página guardada na memória)
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) { raiz.classList.remove('rolagem-suave'); setTimeout(ligar, 600); }
    });
})();

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

// Tecla ESC fecha a galeria
document.addEventListener('keydown', function (e) {
    const overlay = document.getElementById('galeria-overlay');
    if (e.key === 'Escape' && overlay && overlay.classList.contains('ativa')) {
        toggleGaleria();
    }
});

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
//    - Celular (em pé e deitado): cada frase aparece quando
//      entra na tela; o "Chama o Mestre" aparece por último,
//      quando ele sobe na tela
//    - PC e tablet: a seção inteira anima de uma vez
//    - Anima uma vez só; atualizando a página, anima de novo
// ======================================================
const chamadaUrgente = document.querySelector('.chamada-urgente');
const ehCelular = window.matchMedia('(max-width: 480px), (max-width: 932px) and (orientation: landscape)').matches;

if (chamadaUrgente && ehCelular) {
    const ESPACO = 250; // AJUSTE: tempo mínimo (ms) entre uma frase e outra
    let proximaVez = 0;

    const vigiaFrases = new IntersectionObserver(entries => {
        entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
            .forEach(entry => {
                const agora = performance.now();
                const espera = Math.max(0, proximaVez - agora);
                proximaVez = agora + espera + ESPACO;
                entry.target.style.animationDelay = entry.target.classList.contains('solucao')
                    ? espera + 'ms, ' + (espera + 1400) + 'ms'   // Entrada + respiro depois
                    : espera + 'ms';
                entry.target.classList.add('visivel');
                vigiaFrases.unobserve(entry.target); // Anima só uma vez
            });
    }, {
        threshold: 0.6,                   // AJUSTE: 60% da frase visível
        rootMargin: '0px 0px -8% 0px'     // AJUSTE: dispara um pouco acima do fim da tela
    });

    chamadaUrgente.querySelectorAll('.item-problema, .solucao').forEach(el => vigiaFrases.observe(el));
} else if (chamadaUrgente) {
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
const ZONA_TOPO = 10;   // AJUSTE: nos primeiros 10px do topo o cabeçalho fica sempre aparecendo
const TOLERANCIA = 6;   // AJUSTE: movimentos menores que 6px não escondem nem mostram
let ultimoScroll = 0;

window.addEventListener('scroll', () => {
    const scrollAtual = window.scrollY;

    // Topo da página (inclui o "quique" do iPhone ao puxar para atualizar)
    if (scrollAtual <= ZONA_TOPO) {
        header.classList.remove('header-escondido');
        ultimoScroll = Math.max(scrollAtual, 0);
        return;
    }

    const diferenca = scrollAtual - ultimoScroll;
    if (Math.abs(diferenca) < TOLERANCIA) return;      // Movimento pequeno: ignora

    if (diferenca > 0) {
        header.classList.add('header-escondido');      // Rolando para baixo
    } else {
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

        const numero = secao.querySelector('.avaliacoes-numero');
        const estrelasNota = secao.querySelector('.avaliacoes-estrelas');
        if (dados.rating && numero && estrelasNota) {
            numero.textContent = dados.rating.toFixed(1).replace('.', ',');
            estrelasNota.textContent = estrelas(dados.rating);
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
