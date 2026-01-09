// Firebase Configuration (mesma do script.js)
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

// Initialize Firebase
let db, auth;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    auth = firebase.auth();
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// State
let isAuthenticated = false;
let currentUser = null;
let teamsData = {};

// DOM
const app = document.getElementById('admin-app');

// Initialize
function init() {
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            isAuthenticated = true;
            currentUser = user;
            render();
            loadTeams();
        } else {
            isAuthenticated = false;
            currentUser = null;
            render();
        }
    });
}

function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Login successful:", userCredential.user.email);
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert('Erro no login: ' + error.message);
        });
}

function logout() {
    auth.signOut()
        .then(() => {
            console.log("Logout successful");
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
}

function loadTeams() {
    if (!db) {
        console.error("Firebase não está inicializado");
        return;
    }
    
    db.ref('teams').on('value', (snapshot) => {
        teamsData = snapshot.val() || {};
        renderTeams();
    });
}

function render() {
    if (!isAuthenticated) {
        app.innerHTML = `
            <div class="login-container">
                <h1 style="text-align: center; margin-bottom: 30px;">🔐 Admin Login</h1>
                <input type="email" id="admin-email" placeholder="Email" style="width: 100%; padding: 15px; border: 2px solid var(--primary-color); border-radius: var(--border-radius); background: var(--bg-color); color: var(--text-color); font-size: 1rem; margin-bottom: 15px;" />
                <input type="password" id="admin-password" placeholder="Password" style="width: 100%; padding: 15px; border: 2px solid var(--primary-color); border-radius: var(--border-radius); background: var(--bg-color); color: var(--text-color); font-size: 1rem; margin-bottom: 15px;" />
                <button class="btn-primary" onclick="handleLogin()">ENTRAR</button>
                <p style="text-align: center; margin-top: 20px; font-size: 0.85rem; opacity: 0.6;">
                    Use as credenciais de administrador configuradas no Firebase Authentication
                </p>
            </div>
        `;
    } else {
        app.innerHTML = `
            <div class="admin-header">
                <div>
                    <h1>📊 Painel de Administração - Indaba Challenge</h1>
                    <p style="opacity: 0.6; font-size: 0.9rem; margin-top: 5px;">👤 ${currentUser?.email || 'Admin'}</p>
                </div>
                <div>
                    <button class="refresh-btn" onclick="loadTeams()">🔄 Atualizar</button>
                    <button class="logout-btn" onclick="logout()">Sair</button>
                </div>
            </div>
            
            <div class="stats-overview" id="stats-container">
                <!-- Stats will be injected -->
            </div>
            
            <div class="teams-grid" id="teams-container">
                <!-- Teams will be injected -->
            </div>
        `;
        
        loadTeams();
    }
}

function renderTeams() {
    const container = document.getElementById('teams-container');
    const statsContainer = document.getElementById('stats-container');
    
    if (!container) return;
    
    const teams = Object.entries(teamsData);
    
    if (teams.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5; padding:40px;">Nenhuma equipa registada ainda.</p>';
        return;
    }
    
    // Calculate stats
    const totalTeams = teams.length;
    const avgScore = Math.round(teams.reduce((sum, [_, t]) => sum + (t.score || 0), 0) / totalTeams);
    const topScore = Math.max(...teams.map(([_, t]) => t.score || 0));
    const finishedTeams = teams.filter(([_, t]) => t.view === 'FINISH').length;
    
    // Render stats
    statsContainer.innerHTML = `
        <div class="stat-box">
            <div class="stat-value">${totalTeams}</div>
            <div class="stat-label">Equipas Totais</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${avgScore}</div>
            <div class="stat-label">Pontuação Média</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${topScore}</div>
            <div class="stat-label">Melhor Pontuação</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${finishedTeams}</div>
            <div class="stat-label">Equipas Terminadas</div>
        </div>
    `;
    
    // Sort teams by score (descending)
    teams.sort((a, b) => (b[1].score || 0) - (a[1].score || 0));
    
    // Render team cards
    container.innerHTML = teams.map(([teamId, team], index) => {
        const totalChallenges = team.challengePool?.length || 10;
        const progress = ((team.currentChallengeIndex || 0) / totalChallenges) * 100;
        const lastUpdate = team.lastUpdate ? new Date(team.lastUpdate).toLocaleString('pt-PT') : 'Nunca';
        const pathPoints = team.pathHistory?.length || 0;
        
        return `
            <div class="team-card" onclick="showTeamDetails('${teamId}')" style="cursor: pointer;">
                <div class="team-header">
                    <div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">#${index + 1}</div>
                        <div class="team-name">${team.teamName || 'Sem nome'}</div>
                    </div>
                    <div class="team-score">${team.score || 0} pts</div>
                </div>
                
                <div class="team-info">
                    <strong>Estado:</strong> ${getViewName(team.view)}
                </div>
                
                <div class="team-info">
                    <strong>Desafio:</strong> ${team.currentChallengeIndex || 0} / ${totalChallenges}
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%">
                        ${Math.round(progress)}%
                    </div>
                </div>
                
                <div class="path-info">
                    📍 ${pathPoints} pontos GPS registados
                </div>
                
                <div class="team-info" style="margin-top: 10px; font-size: 0.75rem;">
                    <strong>Última atualização:</strong><br>${lastUpdate}
                </div>
                
                ${team.currentMiniChallenge ? `
                    <div class="team-info" style="background: rgba(187, 134, 252, 0.1); padding: 8px; border-radius: 6px; margin-top: 10px;">
                        <strong>Mini Desafio Ativo:</strong><br>
                        <small>${team.currentMiniChallenge}</small>
                    </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); opacity: 0.6; font-size: 0.85rem;">
                    🔍 Clica para ver detalhes completos
                </div>
            </div>
        `;
    }).join('');
}

function showTeamDetails(teamId) {
    const team = teamsData[teamId];
    if (!team) return;
    
    const pathPoints = team.pathHistory || [];
    const challenges = team.challengePool || [];
    const currentIndex = team.currentChallengeIndex || 0;
    
    // Build GPS history HTML
    let gpsHtml = '<p style="opacity: 0.5;">Sem histórico GPS</p>';
    if (pathPoints.length > 0) {
        gpsHtml = `
            <div style="max-height: 200px; overflow-y: auto;">
                ${pathPoints.slice(-10).reverse().map((point, i) => `
                    <div style="background: rgba(255,255,255,0.05); padding: 8px; margin-bottom: 5px; border-radius: 4px; font-size: 0.85rem;">
                        <strong>${pathPoints.length - i}.</strong> 
                        Lat: ${point.lat?.toFixed(6) || 'N/A'}, 
                        Lng: ${point.lng?.toFixed(6) || 'N/A'}<br>
                        <span style="opacity: 0.6;">${point.timestamp ? new Date(point.timestamp).toLocaleString('pt-PT') : 'N/A'}</span>
                    </div>
                `).join('')}
                ${pathPoints.length > 10 ? `<p style="text-align: center; opacity: 0.5; font-size: 0.8rem;">... e mais ${pathPoints.length - 10} pontos</p>` : ''}
            </div>
        `;
    }
    
    // Build challenges HTML
    let challengesHtml = '<p style="opacity: 0.5;">Sem desafios</p>';
    if (challenges.length > 0) {
        challengesHtml = `
            <div style="max-height: 300px; overflow-y: auto;">
                ${challenges.map((challenge, i) => {
                    const isCompleted = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    return `
                        <div style="background: ${isCompleted ? 'rgba(76, 175, 80, 0.1)' : isCurrent ? 'rgba(3, 218, 198, 0.1)' : 'rgba(255,255,255,0.05)'}; padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid ${isCompleted ? '#4caf50' : isCurrent ? '#03dac6' : 'transparent'};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                <strong style="color: ${isCompleted ? '#4caf50' : isCurrent ? '#03dac6' : '#fff'};">
                                    ${isCompleted ? '✅' : isCurrent ? '▶️' : '⏸️'} Desafio #${challenge.id}
                                </strong>
                                <span style="font-size: 0.8rem; opacity: 0.7;">${challenge.type === 'input' ? '📝 Input' : '✔️ Done'}</span>
                            </div>
                            <div style="font-size: 0.85rem; opacity: 0.8; white-space: pre-wrap;">${challenge.text?.substring(0, 100)}${challenge.text?.length > 100 ? '...' : ''}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div style="background: var(--card-bg); border-radius: var(--border-radius); max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 30px; position: relative;">
            <button onclick="this.closest('div').parentElement.remove()" style="position: absolute; top: 15px; right: 15px; background: var(--danger-color); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">×</button>
            
            <h2 style="margin-bottom: 10px; color: var(--primary-color);">${team.teamName || 'Sem nome'}</h2>
            <p style="opacity: 0.6; margin-bottom: 20px;">ID: ${teamId}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: rgba(3, 218, 198, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 800; color: var(--secondary-color);">${team.score || 0}</div>
                    <div style="opacity: 0.7; font-size: 0.9rem;">Pontos</div>
                </div>
                <div style="background: rgba(187, 134, 252, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 800; color: var(--primary-color);">${currentIndex}</div>
                    <div style="opacity: 0.7; font-size: 0.9rem;">Desafios Feitos</div>
                </div>
                <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 800; color: var(--success-color);">${pathPoints.length}</div>
                    <div style="opacity: 0.7; font-size: 0.9rem;">Pontos GPS</div>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="margin-bottom: 8px;"><strong>Estado:</strong> ${getViewName(team.view)}</div>
                <div style="margin-bottom: 8px;"><strong>Última atualização:</strong> ${team.lastUpdate ? new Date(team.lastUpdate).toLocaleString('pt-PT') : 'Nunca'}</div>
                ${team.currentMiniChallenge ? `<div><strong>Mini Desafio:</strong> ${team.currentMiniChallenge}</div>` : ''}
            </div>
            
            <h3 style="margin-top: 25px; margin-bottom: 15px; color: var(--secondary-color);">📋 Desafios (${currentIndex}/${challenges.length})</h3>
            ${challengesHtml}
            
            <h3 style="margin-top: 25px; margin-bottom: 15px; color: var(--secondary-color);">📍 Histórico GPS (últimos 10)</h3>
            ${gpsHtml}
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.showTeamDetails = showTeamDetails;

function getViewName(view) {
    const names = {
        'SETUP': '⚙️ Configuração',
        'INTRO': '📖 Tutorial',
        'TRAVEL': '🚗 Viagem',
        'AUTOGRAPH_INTRO': '✍️ Autógrafos',
        'MAIN_LOOP': '🎮 Em Jogo',
        'FINISH': '🏁 Terminado'
    };
    return names[view] || view;
}

// Global functions
window.handleLogin = () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (email && password) {
        login(email, password);
    } else {
        alert('Por favor preenche email e password!');
    }
};

// Start
init();

// Auto-refresh every 30 seconds
setInterval(() => {
    if (isAuthenticated) {
        loadTeams();
    }
}, 30000);
