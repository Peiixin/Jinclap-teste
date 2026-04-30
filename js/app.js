document.addEventListener('DOMContentLoaded', () => {
    // SPA
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');

    window.showSection = function(sectionId) {
        sections.forEach(sec => sec.classList.remove('active'));
        links.forEach(link => link.classList.remove('active'));

        document.getElementById(sectionId).classList.add('active');
        const activeLink = document.querySelector(`nav a[onclick="showSection('${sectionId}')"]`);
        if (activeLink) activeLink.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function fetchData(url) {
        try {
            const response = await fetch(url + '?t=' + new Date().getTime()); 
            if (!response.ok) throw new Error('Erro ao carregar ' + url);
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function loadNoticias() {
        const noticias = await fetchData('data/noticias.json');
        if (!noticias) return;
        const grid = document.getElementById('noticias-grid');
        grid.innerHTML = '';
        noticias.forEach(n => {
            const card = document.createElement('div');
            card.className = 'card';
            const badge = n.destaque ? '<span class="badge destaque">🔥 Destaque</span>' : '<span class="badge">Notícia</span>';
            card.innerHTML = `
                <div class="card-img-wrapper">
                    ${badge}
                    <img src="${n.imagem}" alt="${n.titulo}">
                </div>
                <div class="card-body">
                    <div class="card-date">${n.data}</div>
                    <h3 class="card-title">${n.titulo}</h3>
                    <p class="card-text">${n.resumo}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // JOGOS COM FILTRO DE DIAS
    let todosJogos = [];
    async function loadJogos() {
        todosJogos = await fetchData('data/jogos.json');
        if (!todosJogos) return;

        const diasUnicos = [...new Set(todosJogos.map(j => j.dia_id))];
        const filtroDiv = document.getElementById('dias-filter');
        filtroDiv.innerHTML = '';

        diasUnicos.forEach((dia, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-dia';
            if (index === 0) btn.classList.add('active');
            
            // Encontrar titulo
            const jogoExemplo = todosJogos.find(j => j.dia_id === dia);
            btn.innerText = jogoExemplo ? jogoExemplo.dia_titulo : dia;
            
            btn.onclick = () => {
                document.querySelectorAll('.btn-dia').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderJogos(dia);
            };
            filtroDiv.appendChild(btn);
        });

        if(diasUnicos.length > 0) renderJogos(diasUnicos[0]);
    }

    function renderJogos(diaFiltro) {
        const lista = document.getElementById('jogos-lista');
        lista.innerHTML = '';
        const jogosDia = todosJogos.filter(j => j.dia_id === diaFiltro);

        jogosDia.forEach(j => {
            const placarA = j.placarA !== null ? j.placarA : '-';
            const placarB = j.placarB !== null ? j.placarB : '-';
            let statusClass = 'jogo-status';
            let statusText = j.status;
            if (j.status === 'EM ANDAMENTO' || j.status === 'AO VIVO') {
                statusClass += ' ao-vivo';
                statusText = '🔴 AO VIVO';
            }
            const div = document.createElement('div');
            div.className = 'jogo-card';
            div.innerHTML = `
                <div class="jogo-header">
                    <span class="jogo-modalidade">${j.modalidade}</span>
                    <span class="${statusClass}">${statusText}</span>
                </div>
                <div class="jogo-placar-container">
                    <div class="time-box"><span class="time-nome">${j.timeA}</span></div>
                    <div class="placar-box">
                        <span class="placar-numero">${placarA}</span>
                        <span class="placar-vs">X</span>
                        <span class="placar-numero">${placarB}</span>
                    </div>
                    <div class="time-box"><span class="time-nome">${j.timeB}</span></div>
                </div>
                <div class="jogo-data">📅 Horário: ${j.horario}</div>
            `;
            lista.appendChild(div);
        });
    }

    // CHAVEAMENTOS
    async function loadChaveamentos() {
        const data = await fetchData('data/chaveamentos.json');
        if (!data) return;
        const container = document.getElementById('chaveamentos-container');
        container.innerHTML = '';

        data.forEach(mod => {
            const divMod = document.createElement('div');
            divMod.className = 'chaveamento-modalidade';
            divMod.innerHTML = `<h3>${mod.modalidade}</h3>`;
            
            mod.fases.forEach(fase => {
                const faseDiv = document.createElement('div');
                faseDiv.className = 'fase-bracket';
                faseDiv.innerHTML = `<div class="fase-titulo">${fase.nome}</div>`;
                
                fase.confrontos.forEach(conf => {
                    faseDiv.innerHTML += `
                        <div class="confronto-item">
                            <div class="confronto-times">
                                <div class="confronto-linha">
                                    <span>${conf.timeA}</span>
                                    <span>${conf.placarA !== null ? conf.placarA : '-'}</span>
                                </div>
                                <div class="confronto-linha">
                                    <span>${conf.timeB}</span>
                                    <span>${conf.placarB !== null ? conf.placarB : '-'}</span>
                                </div>
                                <div class="confronto-status">${conf.status}</div>
                            </div>
                        </div>
                    `;
                });
                divMod.appendChild(faseDiv);
            });
            container.appendChild(divMod);
        });
    }

    // CLASSIFICACAO
    async function loadClassificacao() {
        const data = await fetchData('data/classificacao.json');
        if (!data) return;
        const tbody = document.querySelector('#tabela-classificacao tbody');
        tbody.innerHTML = '';
        data.sort((a, b) => b.pontos - a.pontos);
        data.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}º</td>
                <td style="font-weight: 700;">${c.turma}</td>
                <td class="td-pontos">${c.pontos}</td>
                <td>${c.vitorias}</td>
                <td>${c.derrotas}</td>
                <td>${c.saldoGols}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // TIMES (COM LOGO E SLOGAN)
    async function loadTimes() {
        const times = await fetchData('data/times.json');
        if (!times) return;
        const grid = document.getElementById('times-grid');
        grid.innerHTML = '';
        times.forEach(t => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.borderTop = `4px solid ${t.cor}`;
            
            let logoHTML = t.logo.length > 2 && t.logo.includes('.') 
                ? `<img src="${t.logo}" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; border-radius: 50%;">` 
                : `<div style="font-size: 3rem;">${t.logo}</div>`;

            card.innerHTML = `
                <div class="card-body" style="align-items: center; text-align: center;">
                    ${logoHTML}
                    <h3 class="card-title" style="color: ${t.cor}; margin-top: 15px; margin-bottom: 0;">${t.nome}</h3>
                    <div style="font-size: 0.8rem; background: rgba(0,0,0,0.2); padding: 2px 10px; border-radius: 4px; margin-top: 5px;">TURMA: ${t.turma}</div>
                    <p class="card-date" style="margin-top: 10px; color: var(--text-muted); font-size: 0.9rem;"><em>"${t.slogan}"</em></p>
                    <div style="margin-top: 15px; width: 100%; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 5px; text-align: left;">
                            ${t.jogadores.map(j => `<li style="font-weight: 500; font-size: 0.9rem;">⚽ ${j}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // ARQUIVOS
    async function loadArquivos() {
        const data = await fetchData('data/arquivos.json');
        if (!data) return;
        const grid = document.getElementById('arquivos-grid');
        grid.innerHTML = '';
        data.forEach(pasta => {
            const card = document.createElement('div');
            card.className = 'pasta-card';
            let linksHTML = pasta.links.map(l => `<a href="${l.url}" target="_blank" class="link-item">${l.titulo}</a>`).join('');
            card.innerHTML = `
                <div class="pasta-titulo">📁 ${pasta.categoria}</div>
                <div>${linksHTML}</div>
            `;
            grid.appendChild(card);
        });
    }

    // ENQUETE
    async function loadEnquete() {
        const enquete = await fetchData('data/enquete.json');
        if (!enquete) return;
        document.getElementById('pergunta-enquete').innerText = enquete.pergunta;
        const form = document.getElementById('form-enquete');
        const resultadosDiv = document.getElementById('resultados-enquete');
        const jaVotou = localStorage.getItem('voto_interclasse_2026');
        if (jaVotou) {
            form.style.display = 'none';
            resultadosDiv.style.display = 'block';
            renderResultados(enquete.opcoes, jaVotou);
        } else {
            form.style.display = 'block';
            resultadosDiv.style.display = 'none';
            const opcoesDiv = document.getElementById('opcoes-enquete');
            opcoesDiv.innerHTML = '';
            enquete.opcoes.forEach(opt => {
                const label = document.createElement('label');
                label.className = 'opcao-label';
                label.innerHTML = `
                    <input type="radio" name="voto" value="${opt.id}">
                    <span>${opt.texto}</span>
                `;
                opcoesDiv.appendChild(label);
            });
        }
    }
    window.registrarVoto = function() {
        const selecionado = document.querySelector('input[name="voto"]:checked');
        if (!selecionado) return alert('Selecione uma opção antes de confirmar!');
        localStorage.setItem('voto_interclasse_2026', selecionado.value);
        loadEnquete();
    };
    function renderResultados(opcoesBase, meuVotoId) {
        const resultadosDiv = document.getElementById('resultados-enquete');
        resultadosDiv.innerHTML = '';
        let totalVotos = 0;
        const opcoesComVotos = opcoesBase.map(opt => {
            let votos = opt.votos_iniciais;
            if (opt.id === meuVotoId) votos += 1;
            totalVotos += votos;
            return { ...opt, votos };
        });
        opcoesComVotos.sort((a, b) => b.votos - a.votos);
        opcoesComVotos.forEach(opt => {
            const porcentagem = totalVotos === 0 ? 0 : Math.round((opt.votos / totalVotos) * 100);
            const item = document.createElement('div');
            item.className = 'resultado-item';
            let labelMeuVoto = opt.id === meuVotoId ? '<span style="color:var(--accent); font-size:0.8rem; background:rgba(245,158,11,0.2); padding:2px 6px; border-radius:4px; margin-left:8px;">Seu Voto</span>' : '';
            item.innerHTML = `
                <div class="resultado-info">
                    <span>${opt.texto} ${labelMeuVoto}</span>
                    <span style="color: var(--primary);">${porcentagem}%</span>
                </div>
                <div class="resultado-barra-bg">
                    <div class="resultado-barra-fill" style="width: 0%;"></div>
                </div>
            `;
            resultadosDiv.appendChild(item);
            setTimeout(() => { item.querySelector('.resultado-barra-fill').style.width = `${porcentagem}%`; }, 50);
        });
    }

    // INIT
    loadNoticias();
    loadJogos();
    loadChaveamentos();
    loadClassificacao();
    loadTimes();
    loadArquivos();
    loadEnquete();
});
