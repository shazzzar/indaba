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
let editMode = false;

// DOM
const app = document.getElementById('admin-app');

// Initialize
function init() {
    console.log("🚀 Initializing admin panel...");
    
    // Show loading screen
    app.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px; animation: pulse 2s infinite;">⏳</div>
                <h2 style="color: var(--primary-color);">A carregar...</h2>
                <p style="opacity: 0.6; margin-top: 10px;">A inicializar Firebase</p>
            </div>
        </div>
    `;
    
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        console.log("Auth state changed:", user);
        if (user) {
            console.log("User authenticated:", user.email);
            console.log("User UID:", user.uid);
            isAuthenticated = true;
            currentUser = user;
            render();
            loadTeams();
        } else {
            console.log("No user authenticated");
            isAuthenticated = false;
            currentUser = null;
            render();
        }
    });
}

function login(email, password) {
    console.log("Attempting login with:", email);
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Login successful:", userCredential.user.email);
            console.log("User UID:", userCredential.user.uid);
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert('Erro no login: ' + error.message + '\n\nCódigo: ' + error.code);
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
    
    if (!auth.currentUser) {
        console.error("Utilizador não autenticado! Faz login primeiro.");
        const container = document.getElementById('teams-container');
        if (container) {
            container.innerHTML = `
                <div style="background: rgba(207, 102, 121, 0.2); padding: 30px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--danger-color); margin-bottom: 10px;">🔒 Não autenticado</h3>
                    <p>Precisas fazer login para ver as equipas.</p>
                    <p style="margin-top: 15px; opacity: 0.7;">Verifica se fizeste login corretamente com email e password.</p>
                </div>
            `;
        }
        return;
    }
    
    console.log("Loading teams...");
    console.log("Authenticated user:", auth.currentUser.email);
    
    // Remove old listener if exists
    if (window.teamsListener) {
        db.ref('teams').off('value', window.teamsListener);
    }
    
    // Real-time listener
    window.teamsListener = db.ref('teams').on('value', (snapshot) => {
        const newData = snapshot.val() || {};
        
        console.log("Teams data received:", newData);
        console.log("Number of teams:", Object.keys(newData).length);
        
        // Check if data changed
        const hasChanges = JSON.stringify(newData) !== JSON.stringify(teamsData);
        
        teamsData = newData;
        renderTeams();
        
        // Show update indicator
        if (hasChanges && Object.keys(teamsData).length > 0) {
            showUpdateNotification();
        }
    }, (error) => {
        console.error("Error loading teams:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // Show error to user
        const container = document.getElementById('teams-container');
        if (container) {
            container.innerHTML = `
                <div style="background: rgba(207, 102, 121, 0.2); padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--danger-color); margin-bottom: 10px;">❌ Erro ao carregar equipas</h3>
                    <p><strong>Código:</strong> ${error.code}</p>
                    <p><strong>Mensagem:</strong> ${error.message}</p>
                    <p style="margin-top: 15px; opacity: 0.7;">
                        ${error.code === 'PERMISSION_DENIED' ? 
                            'Faz logout e login novamente. Se o problema persistir, verifica as regras do Firebase Database.' : 
                            'Verifica a tua ligação à internet e as configurações do Firebase.'}
                    </p>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="logout()">Fazer Logout e Login Novamente</button>
                </div>
            `;
        }
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
                    <p style="opacity: 0.6; font-size: 0.9rem; margin-top: 5px;">
                        👤 ${currentUser?.email || 'Admin'} 
                        <span id="live-indicator" style="display: inline-block; margin-left: 15px; padding: 5px 12px; background: rgba(76, 175, 80, 0.2); border-radius: 20px; font-size: 0.85rem;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: #4caf50; border-radius: 50%; margin-right: 5px; animation: pulse 2s infinite;"></span>
                            AO VIVO
                        </span>
                    </p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="edit-mode-btn" onclick="toggleEditMode()" style="padding: 10px 20px; background: ${editMode ? 'var(--danger-color)' : 'rgba(255, 193, 7, 0.3)'}; color: ${editMode ? 'white' : '#ffc107'}; border: 2px solid ${editMode ? 'var(--danger-color)' : '#ffc107'}; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">
                        ${editMode ? '🔓 MODO EDIÇÃO ATIVO' : '🔒 Ativar Modo Edição'}
                    </button>
                    <button class="refresh-btn" onclick="loadTeams()">🔄 Atualizar</button>
                    <button class="logout-btn" onclick="logout()">Sair</button>
                </div>
            </div>
            
            <div id="update-notification" style="display: none; position: fixed; top: 20px; right: 20px; background: var(--success-color); color: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; animation: slideIn 0.3s ease;">
                ✨ Dados atualizados!
            </div>
            
            ${editMode ? `
                <div style="background: rgba(207, 102, 121, 0.2); border: 2px solid var(--danger-color); padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <strong style="color: var(--danger-color);">⚠️ MODO EDIÇÃO ATIVO</strong>
                    <p style="margin: 5px 0 0 0; opacity: 0.8;">Podes editar e eliminar equipas. Cuidado com as ações!</p>
                </div>
            ` : ''}
            
            <div class="stats-overview" id="stats-container">
                <!-- Stats will be injected -->
            </div>
            
            <div class="teams-grid" id="teams-container">
                <!-- Teams will be injected -->
            </div>
            
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
                @keyframes highlight {
                    0% { background: var(--card-bg); }
                    50% { background: rgba(3, 218, 198, 0.2); }
                    100% { background: var(--card-bg); }
                }
            </style>
        `;
        
        loadTeams();
    }
}

function showUpdateNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.style.display = 'none';
                notification.style.animation = 'slideIn 0.3s ease';
            }, 300);
        }, 2000);
    }
}

function renderTeams() {
    const container = document.getElementById('teams-container');
    const statsContainer = document.getElementById('stats-container');
    
    console.log("Rendering teams...");
    console.log("Container exists:", !!container);
    console.log("Stats container exists:", !!statsContainer);
    console.log("Teams data:", teamsData);
    
    if (!container) {
        console.error("Container não encontrado!");
        return;
    }
    
    const teams = Object.entries(teamsData);
    
    console.log("Number of teams to render:", teams.length);
    
    if (teams.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5; padding:40px;">Nenhuma equipa registada ainda.</p>';
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-box">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Equipas Totais</div>
                </div>
            `;
        }
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
        
        // Check if recently updated (last 10 seconds)
        const isRecentlyUpdated = team.lastUpdate && (Date.now() - new Date(team.lastUpdate).getTime()) < 10000;
        
        return `
            <div class="team-card ${isRecentlyUpdated ? 'recently-updated' : ''}" onclick="showTeamDetails('${teamId}')" style="cursor: pointer; ${isRecentlyUpdated ? 'animation: highlight 2s ease;' : ''}">
                <div class="team-header">
                    <div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">
                            #${index + 1}
                            ${isRecentlyUpdated ? '<span style="color: var(--success-color); margin-left: 5px;">🔴 ATIVO</span>' : ''}
                        </div>
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
            
            <h2 style="margin-bottom: 10px; color: var(--primary-color);">
                <span id="team-name-display-${teamId}">${team.teamName || 'Sem nome'}</span>
                ${editMode ? `<button onclick="editTeamName('${teamId}')" style="margin-left: 10px; background: var(--primary-color); color: black; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">✏️ Editar Nome</button>` : ''}
            </h2>
            <p style="opacity: 0.6; margin-bottom: 20px;">ID: ${teamId}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: rgba(3, 218, 198, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                    <div id="team-score-display-${teamId}" style="font-size: 2rem; font-weight: 800; color: var(--secondary-color);">${team.score || 0}</div>
                    <div style="opacity: 0.7; font-size: 0.9rem;">Pontos</div>
                    ${editMode ? `<button onclick="editTeamScore('${teamId}')" style="margin-top: 8px; background: var(--secondary-color); color: black; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.75rem; width: 100%;">✏️ Editar</button>` : ''}
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
            
            ${editMode ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <button onclick="resetTeamProgress('${teamId}')" style="padding: 12px; background: rgba(255, 193, 7, 0.2); color: #ffc107; border: 2px solid #ffc107; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🔄 Resetar Progresso
                    </button>
                    <button onclick="deleteTeam('${teamId}')" style="padding: 12px; background: rgba(207, 102, 121, 0.2); color: var(--danger-color); border: 2px solid var(--danger-color); border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🗑️ Eliminar Equipa
                    </button>
                </div>
            ` : ''}
            
            <h3 style="margin-top: 25px; margin-bottom: 15px; color: var(--secondary-color);">📋 Desafios (${currentIndex}/${challenges.length})</h3>
            ${challengesHtml}
            
            ${pathPoints.length > 0 ? `
                <button onclick="event.stopPropagation(); showMapView('${teamId}')" style="width: 100%; margin-top: 20px; padding: 15px; background: var(--success-color); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer;">
                    🗺️ VER PERCURSO COMPLETO NO MAPA
                </button>
            ` : ''}
            
            ${editMode && pathPoints.length > 5 ? `
                <button onclick="clearTeamGPS('${teamId}')" style="width: 100%; margin-top: 10px; padding: 12px; background: rgba(207, 102, 121, 0.2); color: var(--danger-color); border: 2px solid var(--danger-color); border-radius: 8px; cursor: pointer; font-weight: 600;">
                    🗑️ Limpar Histórico GPS
                </button>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showMapView(teamId) {
    const team = teamsData[teamId];
    if (!team || !team.pathHistory || team.pathHistory.length === 0) {
        alert("Não há dados GPS para mostrar no mapa.");
        return;
    }
    
    const pathPoints = team.pathHistory;
    
    // Create map modal
    const mapModal = document.createElement('div');
    mapModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; flex-direction: column; padding: 20px;';
    
    mapModal.innerHTML = `
        <div style="background: var(--card-bg); border-radius: var(--border-radius); flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative;">
            <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; color: var(--primary-color);">🗺️ Percurso GPS - ${team.teamName}</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.6; font-size: 0.9rem;">${pathPoints.length} pontos registados</p>
                </div>
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: var(--danger-color); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.5rem; cursor: pointer; font-weight: bold;">×</button>
            </div>
            
            <div id="map-${teamId}" style="flex: 1; width: 100%;"></div>
            
            <div style="padding: 15px; background: rgba(0,0,0,0.3); display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
                <div style="text-align: center;">
                    <div style="font-size: 0.8rem; opacity: 0.7;">Início</div>
                    <div style="font-weight: 600; color: var(--success-color);">🟢 ${new Date(pathPoints[0].timestamp).toLocaleString('pt-PT')}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.8rem; opacity: 0.7;">Último Ponto</div>
                    <div style="font-weight: 600; color: var(--danger-color);">🔴 ${new Date(pathPoints[pathPoints.length - 1].timestamp).toLocaleString('pt-PT')}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.8rem; opacity: 0.7;">Total Pontos</div>
                    <div style="font-weight: 600; color: var(--secondary-color);">${pathPoints.length}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(mapModal);
    
    // Initialize map after modal is in DOM
    setTimeout(() => {
        const mapElement = document.getElementById(`map-${teamId}`);
        
        // Default center (Braga, Portugal)
        const defaultCenter = [41.5454, -8.4265];
        const firstPoint = pathPoints[0];
        const centerLat = firstPoint.lat || defaultCenter[0];
        const centerLng = firstPoint.lng || defaultCenter[1];
        
        // Create map
        const map = L.map(`map-${teamId}`).setView([centerLat, centerLng], 14);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Prepare coordinates for polyline
        const coordinates = pathPoints
            .filter(p => p.lat && p.lng)
            .map(p => [p.lat, p.lng]);
        
        if (coordinates.length === 0) {
            alert("Não há coordenadas GPS válidas para mostrar.");
            mapModal.remove();
            return;
        }
        
        // Draw path
        const polyline = L.polyline(coordinates, {
            color: '#03dac6',
            weight: 4,
            opacity: 0.8
        }).addTo(map);
        
        // Add markers for start and end
        if (coordinates.length > 0) {
            // Start marker (green)
            L.marker(coordinates[0], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background: #4caf50; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">🏁</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map).bindPopup(`
                <strong>Início</strong><br>
                ${new Date(pathPoints[0].timestamp).toLocaleString('pt-PT')}
            `);
            
            // End marker (red)
            if (coordinates.length > 1) {
                L.marker(coordinates[coordinates.length - 1], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="background: #cf6679; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">📍</div>',
                        iconSize: [30, 30]
                    })
                }).addTo(map).bindPopup(`
                    <strong>Último Ponto</strong><br>
                    ${new Date(pathPoints[pathPoints.length - 1].timestamp).toLocaleString('pt-PT')}
                `);
            }
            
            // Add markers every 10 points
            coordinates.forEach((coord, index) => {
                if (index > 0 && index < coordinates.length - 1 && index % 10 === 0) {
                    L.circleMarker(coord, {
                        radius: 5,
                        fillColor: '#bb86fc',
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map).bindPopup(`
                        <strong>Ponto ${index + 1}</strong><br>
                        ${new Date(pathPoints[index].timestamp).toLocaleString('pt-PT')}
                    `);
                }
            });
        }
        
        // Fit map to show all points
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        
        // Fix map rendering issue
        setTimeout(() => map.invalidateSize(), 100);
    }, 100);
}

window.showMapView = showMapView;

// Edit team name
function editTeamName(teamId) {
    const team = teamsData[teamId];
    if (!team) return;
    
    const newName = prompt("Novo nome da equipa:", team.teamName || "");
    if (newName !== null && newName.trim() !== "") {
        db.ref(`teams/${teamId}/teamName`).set(newName.trim())
            .then(() => {
                console.log("Nome atualizado com sucesso");
                const display = document.getElementById(`team-name-display-${teamId}`);
                if (display) display.textContent = newName.trim();
            })
            .catch(error => {
                console.error("Erro ao atualizar nome:", error);
                alert("Erro ao atualizar nome: " + error.message);
            });
    }
}

// Edit team score
function editTeamScore(teamId) {
    const team = teamsData[teamId];
    if (!team) return;
    
    const newScore = prompt("Nova pontuação:", team.score || 0);
    if (newScore !== null) {
        const score = parseInt(newScore);
        if (!isNaN(score)) {
            db.ref(`teams/${teamId}/score`).set(score)
                .then(() => {
                    console.log("Pontuação atualizada com sucesso");
                    const display = document.getElementById(`team-score-display-${teamId}`);
                    if (display) display.textContent = score;
                })
                .catch(error => {
                    console.error("Erro ao atualizar pontuação:", error);
                    alert("Erro ao atualizar pontuação: " + error.message);
                });
        } else {
            alert("Por favor insere um número válido!");
        }
    }
}

// Reset team progress
function resetTeamProgress(teamId) {
    const team = teamsData[teamId];
    if (!team) return;
    
    if (confirm(`⚠️ Tens a certeza que queres resetar o progresso de "${team.teamName}"?\n\nIsto vai:\n- Voltar ao desafio 1\n- Manter os pontos atuais\n- Manter o histórico GPS`)) {
        db.ref(`teams/${teamId}`).update({
            currentChallengeIndex: 0,
            view: 'MAIN_LOOP',
            currentMiniChallenge: null
        })
            .then(() => {
                alert("✅ Progresso resetado com sucesso!");
                // Close modal
                document.querySelectorAll('div[style*="position: fixed"]').forEach(el => {
                    if (el.querySelector(`#team-name-display-${teamId}`)) {
                        el.remove();
                    }
                });
            })
            .catch(error => {
                console.error("Erro ao resetar progresso:", error);
                alert("❌ Erro ao resetar progresso: " + error.message);
            });
    }
}

// Clear team GPS history
function clearTeamGPS(teamId) {
    const team = teamsData[teamId];
    if (!team) return;
    
    if (confirm(`⚠️ Tens a certeza que queres limpar o histórico GPS de "${team.teamName}"?\n\nEsta ação não pode ser desfeita!`)) {
        db.ref(`teams/${teamId}/pathHistory`).set([])
            .then(() => {
                alert("✅ Histórico GPS limpo com sucesso!");
                // Refresh details
                document.querySelectorAll('div[style*="position: fixed"]').forEach(el => {
                    if (el.querySelector(`#team-name-display-${teamId}`)) {
                        el.remove();
                    }
                });
                showTeamDetails(teamId);
            })
            .catch(error => {
                console.error("Erro ao limpar GPS:", error);
                alert("❌ Erro ao limpar GPS: " + error.message);
            });
    }
}

// Delete team
function deleteTeam(teamId) {
    const team = teamsData[teamId];
    if (!team) return;
    
    const confirmText = prompt(
        `⚠️ ATENÇÃO: Esta ação é PERMANENTE e não pode ser desfeita!\n\n` +
        `Vais eliminar a equipa "${team.teamName}" com:\n` +
        `- ${team.score || 0} pontos\n` +
        `- ${team.currentChallengeIndex || 0} desafios completados\n` +
        `- ${team.pathHistory?.length || 0} pontos GPS\n\n` +
        `Para confirmar, escreve: DELETE`
    );
    
    if (confirmText === "DELETE") {
        db.ref(`teams/${teamId}`).remove()
            .then(() => {
                alert("✅ Equipa eliminada com sucesso!");
                // Close all modals
                document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
            })
            .catch(error => {
                console.error("Erro ao eliminar equipa:", error);
                alert("❌ Erro ao eliminar equipa: " + error.message);
            });
    } else if (confirmText !== null) {
        alert("❌ Cancelado. Tens de escrever exatamente 'DELETE' para confirmar.");
    }
}

window.editTeamName = editTeamName;
window.editTeamScore = editTeamScore;
window.resetTeamProgress = resetTeamProgress;
window.clearTeamGPS = clearTeamGPS;
window.deleteTeam = deleteTeam;

// Toggle edit mode
function toggleEditMode() {
    editMode = !editMode;
    console.log("Edit mode:", editMode);
    render();
}

window.toggleEditMode = toggleEditMode;

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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.teamsListener && db) {
        db.ref('teams').off('value', window.teamsListener);
    }
});
