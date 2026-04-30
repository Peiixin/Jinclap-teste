document.addEventListener('DOMContentLoaded', () => {
    
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');
    const bottomSheet = document.getElementById('bottom-sheet');
    const sheetOverlay = document.getElementById('sheet-overlay');

    // ---- NAVEGAÇÃO BOTTOM BAR E TABS ----
    window.showSection = function(sectionId) {
        // Esconder todas as seções
        sections.forEach(sec => sec.classList.remove('active'));
        
        // Desmarcar todos os botões da Bottom Nav
        navItems.forEach(item => item.classList.remove('active'));
        
        // Mostrar seção ativa
        const activeSection = document.getElementById(sectionId);
        if(activeSection) activeSection.classList.add('active');
        
        // Marcar botão ativo
        const activeNav = document.getElementById(`nav-${sectionId}`);
        if(activeNav) {
            activeNav.classList.add('active');
        } else {
            // Se for uma seção do menu "Mais", marca o botão "Mais"
            const btnMais = document.getElementById('nav-mais');
            if(btnMais) btnMais.classList.add('active');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ---- BOTTOM SHEET (MAIS OPÇÕES) ----
    window.toggleSheet = function() {
        if(bottomSheet.classList.contains('active')) {
            bottomSheet.classList.remove('active');
            sheetOverlay.classList.remove('active');
        } else {
            bottomSheet.classList.add('active');
            sheetOverlay.classList.add('active');
        }
    };

    // ---- CORE FETCH ----
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

    // ---- RENDER: DESTAQUES (HOME) ----
    async function loadDestaques() {
        const data = await fetchData('data/destaques.json');
        if (!data) return;
        const container = document.getElementById('destaques-container');
        container.innerHTML = '';
        data.forEach(d => {
            container.innerHTML += `
                <div class="destaque-card">
                    <img src="${d.imagem}" alt="${d.nome}">
                    <div class="destaque-content">
                        <span class="destaque-tag">${d.tipo}</span>
                        <div class="destaque-nome">${d.nome}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted);">${d.detalhe}</div>
                    </div>
                </div>
            `;
        });
    }

    // ---- RENDER: JOGO DA RODADA (HOME) ----
    async function loadJogoRodada() {
        const jogos = await fetchData('data/jogos.json');
        if (!jogos || jogos.length === 0) return;
        const j = jogos[0];
        const container = document.getElementById('jogo-rodada-container');
        
        let statusClass = 'placar-status';
        let statusText = j.status;
        if (j.status === 'EM ANDAMENTO' || j.status === 'AO VIVO') {
            statusClass += ' ao-vivo';
            statusText = '🔴 AO VIVO';
        }

        container.innerHTML = `
            <div class="placar-card" style="border-color: var(--primary);">
                <div class="placar-header">
                    <span>${j.modalidade}</span>
                    <span class="${statusClass}">${statusText}</span>
                </div>
                <div class="placar-teams">
                    <div class="team-col">
                        <div class="team-logo-bg">🛡️</div>
                        <div class="team-name">${j.timeA}</div>
                    </div>
                    <div class="score-center">
                        <span class="score-num">${j.placarA !== null ? j.placarA : '-'}</span>
                        <span class="score-div">:</span>
                        <span class="score-num">${j.placarB !== null ? j.placarB : '-'}</span>
                    </div>
                    <div class="team-col">
                        <div class="team-logo-bg">🛡️</div>
                        <div class="team-name">${j.timeB}</div>
                    </div>
                </div>
                <div style="text-align: center; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-top: 20px;">
                    📅 ${j.dia_titulo} - ${j.horario}
                </div>
            </div>
        `;
    }

    // ---- RENDER: AGENDA DE JOGOS ----
    let todosJogos = [];
    async function loadJogos() {
        todosJogos = await fetchData('data/jogos.json');
        if (!todosJogos) return;

        const diasUnicos = [...new Set(todosJogos.map(j => j.dia_id))];
        const filtroDiv = document.getElementById('dias-filter');
        filtroDiv.innerHTML = '';

        diasUnicos.forEach((dia, index) => {
            const btn = document.createElement('button');
            if (index === 0) btn.classList.add('active');
            const jogoExemplo = todosJogos.find(j => j.dia_id === dia);
            btn.innerText = jogoExemplo ? jogoExemplo.dia_titulo : dia;
            
            btn.onclick = () => {
                document.querySelectorAll('#dias-filter button').forEach(b => b.classList.remove('active'));
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
            let statusClass = 'placar-status';
            let statusText = j.status;
            if (j.status === 'EM ANDAMENTO' || j.status === 'AO VIVO') {
                statusClass += ' ao-vivo';
                statusText = '🔴 AO VIVO';
            }
            lista.innerHTML += `
                <div class="placar-card">
                    <div class="placar-header">
                        <span>${j.modalidade} • ${j.horario}</span>
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                    <div class="placar-teams">
                        <div class="team-col">
                            <div class="team-logo-bg">🛡️</div>
                            <div class="team-name">${j.timeA}</div>
                        </div>
                        <div class="score-center">
                            <span class="score-num">${j.placarA !== null ? j.placarA : '-'}</span>
                            <span class="score-div">:</span>
                            <span class="score-num">${j.placarB !== null ? j.placarB : '-'}</span>
                        </div>
                        <div class="team-col">
                            <div class="team-logo-bg">🛡️</div>
                            <div class="team-name">${j.timeB}</div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // ---- RENDER: CLASSIFICACAO ----
    async function loadClassificacao() {
        const data = await fetchData('data/classificacao.json');
        if (!data) return;
        const tbody = document.querySelector('#tabela-classificacao tbody');
        tbody.innerHTML = '';
        data.sort((a, b) => b.pontos - a.pontos);
        data.forEach((c, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight: 800;">${c.turma}</td>
                    <td class="pts-col">${c.pontos}</td>
                    <td style="color:var(--text-muted);">${c.saldoGols}</td>
                </tr>
            `;
        });
    }

    // ---- RENDER: ELENCOS ----
    async function loadTimes() {
        const times = await fetchData('data/times.json');
        if (!times) return;
        const grid = document.getElementById('times-grid');
        grid.innerHTML = '';
        times.forEach(t => {
            let logoHTML = t.logo.length > 2 && t.logo.includes('.') 
                ? `<img src="${t.logo}" alt="Logo">` 
                : `${t.logo}`;

            grid.innerHTML += `
                <div class="time-card">
                    <div class="team-logo-bg" style="border-color: ${t.cor};">${logoHTML}</div>
                    <div class="time-card-info">
                        <h3>${t.nome}</h3>
                        <p>"${t.slogan}"</p>
                    </div>
                </div>
            `;
        });
    }

    // ---- RENDER: CHAVEAMENTOS ----
    async function loadChaveamentos() {
        const data = await fetchData('data/chaveamentos.json');
        if (!data) return;
        const container = document.getElementById('chaveamentos-container');
        container.innerHTML = '';

        data.forEach(mod => {
            let html = `<h3 style="color:var(--primary); margin: 2rem 0 1rem 0; font-family:var(--font-display);">${mod.modalidade}</h3>`;
            
            mod.fases.forEach(fase => {
                let confrontosHTML = fase.confrontos.map(conf => `
                    <div class="placar-card" style="margin-bottom: 1rem; padding: 1rem;">
                        <div class="placar-teams" style="justify-content: flex-start; gap: 15px;">
                            <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; ${conf.placarA > conf.placarB ? 'font-weight:900; color:var(--text-main);' : 'font-weight:600; color:var(--text-muted);'}">
                                    <div style="display:flex; align-items:center; gap:10px;"><div style="width:25px; height:25px; background:rgba(255,255,255,0.05); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;">🛡️</div> ${conf.timeA}</div>
                                    <div style="font-size:1.2rem; font-family:var(--font-display);">${conf.placarA !== null ? conf.placarA : '-'}</div>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; ${conf.placarB > conf.placarA ? 'font-weight:900; color:var(--text-main);' : 'font-weight:600; color:var(--text-muted);'}">
                                    <div style="display:flex; align-items:center; gap:10px;"><div style="width:25px; height:25px; background:rgba(255,255,255,0.05); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;">🛡️</div> ${conf.timeB}</div>
                                    <div style="font-size:1.2rem; font-family:var(--font-display);">${conf.placarB !== null ? conf.placarB : '-'}</div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align:center; font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-top:10px; text-transform:uppercase;">${conf.status}</div>
                    </div>
                `).join('');

                html += `
                    <div>
                        <div style="margin-bottom: 0.8rem; font-weight: 800; color: var(--text-muted); font-size: 0.9rem;">${fase.nome}</div>
                        ${confrontosHTML}
                    </div>
                `;
            });
            container.innerHTML += html;
        });
    }

    // ---- RENDER: ARQUIVOS & NOTÍCIAS ----
    async function loadListagens() {
        // Arquivos
        const arq = await fetchData('data/arquivos.json');
        const gridArq = document.getElementById('arquivos-grid');
        if(arq && gridArq) {
            gridArq.innerHTML = '';
            arq.forEach(pasta => {
                let links = pasta.links.map(l => `<a href="${l.url}" target="_blank" style="display:block; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; color:var(--text-main); text-decoration:none; margin-bottom:5px; font-weight:600;">🔗 ${l.titulo}</a>`).join('');
                gridArq.innerHTML += `<div class="placar-card"><h3 style="margin-bottom:1rem; color:var(--primary);">📁 ${pasta.categoria}</h3>${links}</div>`;
            });
        }
        
        // Noticias
        const noti = await fetchData('data/noticias.json');
        const gridNoti = document.getElementById('noticias-grid');
        if(noti && gridNoti) {
            gridNoti.innerHTML = '';
            noti.forEach(n => {
                gridNoti.innerHTML += `
                    <div class="placar-card" style="padding:0; overflow:hidden;">
                        <img src="${n.imagem}" style="width:100%; height:180px; object-fit:cover;">
                        <div style="padding: 1.5rem;">
                            <div style="color:var(--accent); font-size:0.75rem; font-weight:800; margin-bottom:8px;">${n.data}</div>
                            <h3 style="margin-bottom:10px; font-family:var(--font-display); line-height:1.2;">${n.titulo}</h3>
                            <p style="font-size:0.9rem; color:var(--text-muted);">${n.resumo}</p>
                        </div>
                    </div>
                `;
            });
        }
    }

    // ---- RENDER: ENQUETE ----
    async function loadEnquete() {
        const enquete = await fetchData('data/enquete.json');
        if (!enquete) return;
        document.getElementById('pergunta-enquete').innerText = enquete.pergunta;
        const form = document.getElementById('form-enquete');
        const resultadosDiv = document.getElementById('resultados-enquete');
        const jaVotou = localStorage.getItem('voto_interclasse_2026');
        
        if (jaVotou) {
            form.style.display = 'none';
            resultadosDiv.style.display = 'flex';
            renderResultados(enquete.opcoes, jaVotou);
        } else {
            form.style.display = 'block';
            resultadosDiv.style.display = 'none';
            const opcoesDiv = document.getElementById('opcoes-enquete');
            opcoesDiv.innerHTML = '';
            enquete.opcoes.forEach(opt => {
                opcoesDiv.innerHTML += `
                    <label style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.03); padding:1.2rem; border-radius:12px; border:1px solid var(--border-light);">
                        <input type="radio" name="voto" value="${opt.id}" style="width:22px; height:22px; accent-color:var(--primary);">
                        <span style="font-weight:700; font-size:1rem;">${opt.texto}</span>
                    </label>
                `;
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
            let corBarra = opt.id === meuVotoId ? 'var(--accent)' : 'var(--primary)';
            let txtMeuVoto = opt.id === meuVotoId ? ' <span style="font-size:0.7rem; color:#fff; background:var(--accent); padding:2px 6px; border-radius:4px;">SEU VOTO</span>' : '';
            
            resultadosDiv.innerHTML += `
                <div style="background:rgba(255,255,255,0.02); padding:1rem; border-radius:12px; border:1px solid var(--border-light);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:800; font-size:0.9rem;">
                        <span>${opt.texto}${txtMeuVoto}</span>
                        <span style="color:${corBarra};">${porcentagem}%</span>
                    </div>
                    <div style="height:10px; background:rgba(255,255,255,0.05); border-radius:5px; overflow:hidden;">
                        <div style="height:100%; width:${porcentagem}%; background:${corBarra}; border-radius:5px;"></div>
                    </div>
                </div>
            `;
        });
    }

    // INICIALIZAÇÃO
    loadDestaques();
    loadJogoRodada();
    loadJogos();
    loadClassificacao();
    loadTimes();
    loadChaveamentos();
    loadListagens();
    loadEnquete();
});
