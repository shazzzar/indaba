// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs6Ohn2Qy4BC7eZkEfUtJ3btFs8wkoim0",
  authDomain: "indaba-36353.firebaseapp.com",
  databaseURL: "https://indaba-36353-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "indaba-36353",
  storageBucket: "indaba-36353.firebasestorage.app",
  messagingSenderId: "901928657998",
  appId: "1:901928657998:web:2387a8aa82fcc0b20f0f1f",
  measurementId: "G-WTQ9S1G0JV"
};

console.log("🚀 Indaba Challenge - Script carregado!");

// Initialize Firebase
let db, auth, storage;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    auth = firebase.auth();
    storage = firebase.storage();
    
    // Enable anonymous authentication for teams
    auth.signInAnonymously().catch((error) => {
        console.error("Anonymous auth error:", error);
    });
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Data
const MAIN_CHALLENGES = [
    {
        id: 1,
        text: "1. Devem contar quantos passos são do theatro circo até o chafariz",
        type: "input",
        validate: (ans) => {
            const n = parseInt(ans);
            return !isNaN(n) && n >= 200 && n <= 300;
        },
        errorMsg: "Resposta incorreta. Tenta novamente."
    },
    {
        id: 2,
        text: "2. Toda a equipa deve fazer um nó diferente e devem tirar uma fotografia (onde todos aparecem)",
        type: "done"
    },
    {
        id: 3,
        text: "3. GRIVN FNZ ULGLTIZURZ VN VJFRKZ MVHGV OLXZO",
        type: "done",
        image: "unnamed.png"
    },
    {
        id: 4,
        text: "4. Procura o local onde a pedra do Paço Medieval repousa... (Texto longo)...\nPergunta: Introduz o número total de caminhos que divergem a partir do centro",
        type: "input",
        validate: (ans) => {
            const a = ans.toLowerCase().trim();
            return a === "8" || a === "oito";
        },
        errorMsg: "Resposta errada. Conta melhor os raios da estrela."
    },
    {
        id: 5,
        text: "5. Há quem diga que a sabedoria não se mede aos palmos... (Texto longo)...\nPergunta: Qual é o ano de fundação indicado na placa informativa oficial na parede da Sé?",
        type: "input",
        validate: (ans) => ans.trim() === "1089",
        errorMsg: "Ano incorreto. Verifica a placa na parede da Sé."
    },
    {
        id: 6,
        text: "6. Segue em direção ao ocidente... (Texto longo)...\nPergunta: No topo da fachada do Arco da Porta Nova, quantos pináculos existem no total?",
        type: "input",
        validate: (ans) => {
            const a = ans.toLowerCase().trim();
            return a === "4" || a === "quatro";
        },
        errorMsg: "Resposta errada. Conta apenas os pináculos no topo."
    },
    {
        id: 7,
        text: "7. Dirige-te ao 'estômago' de Braga. Procura o local onde as cores das frutas e o cheiro do peixe se misturam.\n\nGR.V.M .M V.D.. . .NS.N.R .M. S.NH.R. D. M.RC.D. . F.Z.R . N. D.R..T.",
        type: "done"
    },
    {
        id: 9,
        text: "9. Procurem o local onde o 'Presidente' descansa o olhar... (Texto longo)...\nPergunta: Quantas SALENAJ existem no total na parte LATFNORF deste OICIFIDE? (usa a pergunta para dares a tua resposta)",
        type: "input",
        validate: (ans) => ans.toUpperCase().trim() === "SIESSAZED",
        errorMsg: "Resposta incorreta. Decifra o código da pergunta."
    },
    {
        id: 10,
        text: "10. Convence um estranho a desenhar-te num guardanapo/papel para um mapa para chegar ao Bom Jesus, o melhor mapa ganha",
        type: "done"
    }
];

const MINI_CHALLENGES = [
    "Encontrem e escrevam o nome de uma loja ou estabelecimento comercial que tenha mais de 15 letras",
    "Encontrem uma data gravada em cima de uma porta ou numa janela (que não seja uma igreja) e enviem uma fotografia",
    "Encontrem uma rua com o nome de um animal ou de uma planta e escrevam o nome dessa rua.",
    "Tirem uma foto com todos os elementos da equipa no ar ao mesmo tempo (num local emblemático de braga).",
    "Imitem a pose de uma estátua que encontrarem no caminho. Foto ao lado dela.",
    "Tirem uma foto da maior extensão de água que encontrarem",
    "Tirem uma fotografia onde toda a equipa apareça refletida, mas sem ser num espelho ou numa montra",
    "Tirem uma foto de um animal que não seja de carne e osso.",
    "Encontrem um cartaz ou panfleto de um evento que ainda vá acontecer este ano. Escrevam a data desse evento",
    "Encontrem uma planta ou árvore a crescer diretamente de uma parede",
    "Encontrem uma loja ou rua com o nome mais curto possível",
    "Fotografem 5 objetos azuis diferentes numa única imagem (2+ objetos iguais a outro grupo equivale a 0 pontos)",
    "Encontrem um objeto de rua que tenha exatamente a mesma altura que o vosso elemento mais alto"
];

// App State
let state = {
    view: 'SETUP', // SETUP, INTRO, TRAVEL, TRAVEL_RESULT, MAIN_LOOP, MINI_CHALLENGE_VIEW, FINISH
    score: 200,
    teamName: '',
    teamId: null, // Firebase key
    challengePool: [],
    currentChallengeIndex: 0,
    miniChallengePool: [],
    currentMiniChallenge: null,
    currentMiniChallengeMedia: null, // URL da imagem/vídeo enviado
    hasSeenAutographTask: false,
    pathHistory: [], // [{lat, lng, timestamp}]
    lastUpdate: null
};

// DOM Elements
const app = document.getElementById('view-container');
const scoreDisplay = document.getElementById('score-display');
const teamDisplay = document.getElementById('hud-team-name');
const hud = document.getElementById('hud');
const fab = document.getElementById('mini-challenge-fab');
const miniOverlay = document.getElementById('mini-challenge-overlay');

// Initialization
function init() {
    console.log("🔧 Iniciando aplicação...");
    console.log("DOM Elements check:");
    console.log("- app:", document.getElementById('view-container'));
    console.log("- scoreDisplay:", document.getElementById('score-display'));
    console.log("- teamDisplay:", document.getElementById('hud-team-name'));
    console.log("- hud:", document.getElementById('hud'));
    console.log("- fab:", document.getElementById('mini-challenge-fab'));
    console.log("- miniOverlay:", document.getElementById('mini-challenge-overlay'));
    
    loadState();
    console.log("✅ State carregado:", state);
    
    render();
    console.log("✅ Render executado");
    
    initGPS();
    console.log("✅ GPS inicializado");

    // Mini Challenge Listeners
    const btnCloseMini = document.getElementById('btn-close-mini');
    const btnStartMini = document.getElementById('btn-start-mini');
    
    console.log("Botões mini challenge:", { btnCloseMini, btnStartMini });
    
    fab.addEventListener('click', () => {
        console.log("FAB clicado! currentMiniChallenge:", state.currentMiniChallenge);
        // Se já tem um mini desafio ativo, vai direto para a view
        if (state.currentMiniChallenge) {
            changeView('MINI_CHALLENGE_VIEW');
        } else {
            // Se não tem, mostra o tutorial
            miniOverlay.classList.remove('hidden');
            renderMiniOverlay();
        }
    });

    if (btnCloseMini) {
        btnCloseMini.addEventListener('click', () => {
            miniOverlay.classList.add('hidden');
        });
    }

    if (btnStartMini) {
        btnStartMini.addEventListener('click', () => {
            console.log("Aceitar desafio clicado!");
            if (state.miniChallengePool.length > 0) {
                miniOverlay.classList.add('hidden');
                startMiniChallenge();
            }
        });
    }

    // Initialize randomization if starting new
    if (state.challengePool.length === 0) {
        state.challengePool = shuffle([...MAIN_CHALLENGES]);
        console.log("✅ Desafios principais embaralhados:", state.challengePool.length);
    }
    if (state.miniChallengePool.length === 0) {
        state.miniChallengePool = shuffle([...MINI_CHALLENGES]);
        console.log("✅ Mini desafios embaralhados:", state.miniChallengePool.length);
    }
    
    console.log("✅ Inicialização completa!");
}

// GPS Tracking
function initGPS() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const point = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: new Date().toISOString()
                };
                state.pathHistory.push(point);
                // Optional: Optimize storage if array gets too huge
                saveState();
                updateGPSIndicator(true);
            },
            (error) => {
                console.error("GPS Error:", error);
                updateGPSIndicator(false);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    } else {
        alert("GPS não suportado neste dispositivo.");
    }
}

function updateGPSIndicator(active) {
    const el = document.getElementById('gps-status');
    if (el) {
        el.style.color = active ? 'var(--success-color)' : 'var(--danger-color)';
        el.title = active ? "GPS Ativo" : "GPS Inativo";
    }
}

// State Management
function loadState() {
    const saved = localStorage.getItem('indabaState_v1');
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };

        // Ensure pathHistory exists if loading from old state
        if (!state.pathHistory) state.pathHistory = [];
        
        // If we have a teamId, load from Firebase
        if (state.teamId && db) {
            db.ref('teams/' + state.teamId).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const firebaseData = snapshot.val();
                    state = { ...state, ...firebaseData, teamId: state.teamId };
                    render();
                }
            });
        }
    }
}

function saveState() {
    state.lastUpdate = new Date().toISOString();
    localStorage.setItem('indabaState_v1', JSON.stringify(state));
    
    // Save to Firebase if teamId exists
    if (state.teamId && db) {
        const teamData = {
            teamName: state.teamName,
            score: state.score,
            view: state.view,
            currentChallengeIndex: state.currentChallengeIndex,
            pathHistory: state.pathHistory,
            lastUpdate: state.lastUpdate,
            challengePool: state.challengePool.map(c => ({ id: c.id, text: c.text, type: c.type })),
            currentMiniChallenge: state.currentMiniChallenge,
            currentMiniChallengeMedia: state.currentMiniChallengeMedia
        };
        
        db.ref('teams/' + state.teamId).set(teamData).catch(err => {
            console.error("Erro ao guardar no Firebase:", err);
        });
    }
}

function updateScore(amount) {
    state.score += amount;
    scoreDisplay.innerText = state.score;
    // Animate
    scoreDisplay.style.color = amount > 0 ? '#4caf50' : '#cf6679';
    setTimeout(() => scoreDisplay.style.color = '#03dac6', 500);
    saveState();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Rendering
function render() {
    scoreDisplay.innerText = state.score;
    teamDisplay.innerText = state.teamName || "Equipa";

    if (state.view === 'SETUP') {
        hud.classList.add('hidden');
        fab.classList.add('hidden');
        app.innerHTML = `
            <div class="view-card">
                <h1>BEM-VINDOS</h1>
                <p>Introduzam o nome da vossa equipa para começar.</p>
                <input type="text" id="input-team-name" placeholder="Nome da Equipa">
                <button class="btn-primary" onclick="handleSetup()">COMEÇAR</button>
            </div>
        `;
    } else {
        hud.classList.remove('hidden');
        fab.classList.remove('hidden');
    }

    if (state.view === 'INTRO') {
        app.innerHTML = `
            <div class="view-card">
                <h2>TUTORIAL</h2>
                <ul style="text-align:left; margin-bottom:20px; list-style-position: inside;">
                    <li>Começam com <strong>200 pontos</strong>.</li>
                    <li>Ganhem pontos a completar desafios.</li>
                    <li>Peçam ajuda se precisarem (Custo: 50 pontos).</li>
                </ul>
                <button class="btn-primary" onclick="changeView('TRAVEL')">PRÓXIMO</button>
            </div>
        `;
    }

    if (state.view === 'TRAVEL') {
        app.innerHTML = `
            <div class="view-card">
                <h2>PRIMEIRA MISSÃO</h2>
                <p>Ir do apeadeiro até Braga</p>
                <p>Escolham o vosso meio de transporte:</p>
                <button class="btn-danger" onclick="handleTravel(-100)">CARRO (-100 pts)</button>
                <button class="btn-secondary" onclick="handleTravel(5)">TRANSPORTES (+5 pts/p)</button>
                <button class="btn-success" onclick="handleTravel(100)">A PÉ / BOLEIA (+100 pts)</button>
            </div>
        `;
    }

    if (state.view === 'AUTOGRAPH_INTRO') {
        app.innerHTML = `
            <div class="view-card">
                <h2>DESAFIO PERMANENTE</h2>
                <h3>AUTÓGRAFOS</h3>
                <p>O jogo começou! Arranjem uma folha e caneta.</p>
                <p><strong>Objetivo:</strong> Colecionar o maior número de autógrafos de desconhecidos até ao fim do jogo.</p>
                <p><em>Este desafio decorre em paralelo com os outros!</em></p>
                <button class="btn-primary" onclick="changeView('MAIN_LOOP')">ENTENDIDO, VAMOS LÁ!</button>
            </div>
        `;
    }

    if (state.view === 'MAIN_LOOP') {
        if (state.currentChallengeIndex >= state.challengePool.length) {
            changeView('FINISH');
            return;
        }

        const challenge = state.challengePool[state.currentChallengeIndex];

        let actionsHtml = '';
        if (challenge.type === 'input') {
            actionsHtml = `
                <input type="text" id="challenge-answer" placeholder="A tua resposta...">
                <button class="btn-primary" onclick="checkAnswer(${challenge.id})">SUBMETER</button>
            `;
        } else {
            actionsHtml = `<button class="btn-success" onclick="nextChallenge()">FEITO!</button>`;
        }

        let imageHtml = '';
        if (challenge.image) {
            imageHtml = `<img src="${challenge.image}" alt="Imagem do desafio" style="max-width: 100%; margin: 20px 0; border-radius: 8px;">`;
        }

        app.innerHTML = `
            <div class="view-card">
                <h2>DESAFIO #${state.currentChallengeIndex + 1}</h2>
                <div class="challenge-text">${challenge.text}</div>
                ${imageHtml}
                ${actionsHtml}
                <div style="margin-top:20px;">
                    <button class="btn-danger" style="font-size:0.8rem; padding:10px;" onclick="buyHelp()">PEDIR AJUDA (-50)</button>
                </div>
            </div>
        `;
    }
    
    if (state.view === 'MINI_CHALLENGE_VIEW') {
        if (!state.currentMiniChallenge) {
            changeView('MAIN_LOOP');
            return;
        }
        
        app.innerHTML = `
            <div class="view-card">
                <h2>📝 MINI DESAFIO</h2>
                <div class="challenge-text" style="margin: 20px 0; padding: 15px; background: rgba(3, 218, 198, 0.1); border-radius: 8px;">
                    ${state.currentMiniChallenge}
                </div>
                
                ${state.currentMiniChallengeMedia ? `
                    <div style="margin: 20px 0; text-align: center;">
                        <p style="color: var(--success-color); margin-bottom: 10px;">✅ Ficheiro enviado!</p>
                        ${state.currentMiniChallengeMedia.includes('.mp4') || state.currentMiniChallengeMedia.includes('.mov') || state.currentMiniChallengeMedia.includes('.webm') ?
                            `<video src="${state.currentMiniChallengeMedia}" controls style="max-width: 100%; border-radius: 8px;"></video>` :
                            `<img src="${state.currentMiniChallengeMedia}" alt="Mini Desafio" style="max-width: 100%; border-radius: 8px;">`
                        }
                    </div>
                    <button class="btn-success" onclick="completeMiniChallenge()">✅ ENVIAR E CONCLUIR</button>
                    <button class="btn-secondary" style="margin-top: 10px;" onclick="changeView('MAIN_LOOP')">◀️ VOLTAR PARA O DESAFIO PRINCIPAL</button>
                ` : `
                    <div style="margin: 20px 0;">
                        <p style="margin-bottom: 15px; opacity: 0.8;">Envia uma foto ou vídeo a comprovar que completaste o desafio:</p>
                        <input type="file" id="mini-media-input" accept="image/*,video/*" style="display: none;" onchange="handleMiniMediaUpload(event)">
                        <button class="btn-primary" onclick="document.getElementById('mini-media-input').click()">
                            📷 ESCOLHER FOTO/VÍDEO
                        </button>
                        <div id="upload-progress" style="display: none; margin-top: 15px;">
                            <div style="background: rgba(255,255,255,0.1); height: 30px; border-radius: 15px; overflow: hidden;">
                                <div id="upload-bar" style="background: var(--secondary-color); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: black; font-weight: 600; font-size: 0.9rem;"></div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-secondary" style="margin-top: 10px;" onclick="changeView('MAIN_LOOP')">◀️ VOLTAR PARA O DESAFIO PRINCIPAL</button>
                    <p style="text-align: center; margin-top: 15px; opacity: 0.6; font-size: 0.85rem;">O teu progresso ficará guardado</p>
                `}
            </div>
        `;
    }

    if (state.view === 'FINISH') {
        fab.classList.add('hidden');
        app.innerHTML = `
            <div class="view-card">
                <h1>FIM DO JOGO!</h1>
                <h2>PONTUAÇÃO FINAL: ${state.score}</h2>
                <div class="challenge-text">
                    11. Depois de conquistarem as praças e os segredos da cidade, é hora de rumar ao norte... (Desafio Final)
                </div>
                <p>Parabéns por completarem a Indaba Challenge!</p>
            </div>
        `;
    }
    
    // Update FAB appearance based on mini challenge status
    if (state.currentMiniChallenge) {
        fab.style.background = 'var(--danger-color)';
        fab.style.animation = 'pulse 2s infinite';
        fab.title = 'Tens um mini desafio ativo! Clica para continuar';
    } else {
        fab.style.background = '';
        fab.style.animation = '';
        fab.title = 'Queres mais pontos?';
    }
}

function renderMiniOverlay() {
    const introDiv = document.getElementById('mini-challenge-intro');
    const startBtn = document.getElementById('btn-start-mini');

    if (state.miniChallengePool.length === 0) {
        startBtn.disabled = true;
        startBtn.innerText = "SEM MAIS DESAFIOS";
    } else {
        startBtn.disabled = false;
        startBtn.innerText = "ACEITAR DESAFIO";
    }
}


// Actions
window.handleSetup = () => {
    const name = document.getElementById('input-team-name').value;
    if (name) {
        state.teamName = name;
        
        // Create unique team ID if not exists
        if (!state.teamId && db) {
            state.teamId = db.ref('teams').push().key;
        }
        
        changeView('INTRO');
    }
};

window.changeView = (newView) => {
    state.view = newView;
    saveState();
    render();
};

window.handleTravel = (points) => {
    updateScore(points);
    changeView('AUTOGRAPH_INTRO');
};

window.checkAnswer = (id) => {
    const input = document.getElementById('challenge-answer');
    const challenge = state.challengePool.find(c => c.id === id);
    if (challenge && challenge.validate(input.value)) {
        alert("Correto!");
        nextChallenge();
    } else {
        alert(challenge.errorMsg || "Errado!");
        input.value = "";
    }
};

window.nextChallenge = () => {
    state.currentChallengeIndex++;
    saveState();
    render();
};

window.buyHelp = () => {
    if (confirm("Tens a certeza? Custa 50 pontos.")) {
        updateScore(-50);
        alert("Pede ajuda a alguém na rua ou consulta o Google Maps!");
    }
};

function startMiniChallenge() {
    if (state.miniChallengePool.length > 0) {
        const nextMini = state.miniChallengePool.pop();
        state.currentMiniChallenge = nextMini;
        state.currentMiniChallengeMedia = null; // Reset media
        saveState();
        changeView('MINI_CHALLENGE_VIEW');
    }
}

window.handleMiniMediaUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert("Ficheiro muito grande! Máximo 10MB.");
        return;
    }
    
    const progressDiv = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-bar');
    
    if (progressDiv && progressBar) {
        progressDiv.style.display = 'block';
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
    }
    
    try {
        // Upload to Firebase Storage
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`mini-challenges/${state.teamId}/${Date.now()}_${file.name}`);
        
        const uploadTask = fileRef.put(file);
        
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = Math.round(progress) + '%';
                }
            },
            (error) => {
                console.error('Upload error:', error);
                alert('❌ Erro ao enviar ficheiro: ' + error.message);
                if (progressDiv) progressDiv.style.display = 'none';
            },
            async () => {
                // Upload complete
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                state.currentMiniChallengeMedia = downloadURL;
                saveState();
                render();
            }
        );
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Erro ao enviar ficheiro: ' + error.message);
        if (progressDiv) progressDiv.style.display = 'none';
    }
};

window.completeMiniChallenge = () => {
    updateScore(50);
    state.currentMiniChallenge = null;
    state.currentMiniChallengeMedia = null;
    saveState();
    changeView('MAIN_LOOP');
};

