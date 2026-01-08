# 🎮 Indaba Challenge - Sistema de Jogo Interativo

Sistema completo de caça ao tesouro/desafios para a cidade de Braga, com tracking GPS e painel de administração em tempo real.

## 📁 Estrutura do Projeto

```
IndabaProject/
├── index.html              # Interface principal para jogadores
├── admin.html              # Painel de administração
├── setup-admin.html        # Configuração inicial do admin (usar 1x)
├── script.js               # Lógica do jogo + Firebase
├── admin.js                # Lógica do painel admin
├── styles.css              # Estilos globais
├── unnamed.png             # Imagem para desafio 3
├── PDF/
│   └── INDABA RESPOSTAS.pdf
└── Documentação/
    ├── FIREBASE_SETUP.md       # Guia completo de setup
    └── GUIA_AUTENTICACAO.md    # Guia de autenticação
```

## 🚀 Início Rápido

### 1. Configurar Firebase (Primeira Vez)

Segue o guia detalhado em [FIREBASE_SETUP.md](FIREBASE_SETUP.md):

1. Cria projeto no Firebase Console
2. Ativa Realtime Database
3. Ativa Authentication (Email/Password + Anónimo)
4. Configura regras de segurança
5. Copia credenciais para `script.js` e `admin.js`

### 2. Criar Utilizador Admin

1. Abre `setup-admin.html` no browser
2. Cria um utilizador admin com email e password
3. Guarda as credenciais! 📝

### 3. Começar a Usar

**Jogadores:**
```bash
# Abre no browser
index.html
```

**Administradores:**
```bash
# Abre no browser
admin.html
```

## 🎯 Funcionalidades

### 🎲 Para Jogadores (index.html)

- ✅ **10 Desafios Principais** em Braga
- ✅ **Sistema de Pontos** (começam com 200)
- ✅ **Mini Desafios** (+50 pts cada)
- ✅ **Tracking GPS** automático
- ✅ **Desafios com Imagens** (ex: desafio 3)
- ✅ **Cifras e Códigos** para decifrar
- ✅ **Sistema de Ajuda** (-50 pts)
- ✅ **Dados guardados em tempo real**

### 📊 Para Admins (admin.html)

- ✅ **Dashboard em Tempo Real**
- ✅ **Ver todas as equipas**
- ✅ **Estatísticas Globais**:
  - Total de equipas
  - Pontuação média
  - Melhor pontuação
  - Equipas que terminaram
- ✅ **Progresso Individual**:
  - Pontos de cada equipa
  - Desafios completados
  - Pontos GPS registados
  - Mini desafio ativo
- ✅ **Ordenação por Pontuação**
- ✅ **Auto-refresh a cada 30s**

### 🔐 Segurança

- ✅ **Firebase Authentication**
- ✅ **Autenticação Anónima** para jogadores
- ✅ **Email/Password** para admins
- ✅ **Regras de Segurança** no Database
- ✅ **Gestão de Sessões** automática

## 🗺️ Desafios Implementados

1. **Theatro Circo → Chafariz** - Contar passos
2. **Nós Diferentes** - Foto de equipa
3. **CIFRA ATBASH** - Fotografia em equipa (com imagem)
4. **Paço Medieval** - Contar caminhos da estrela
5. **Sé de Braga** - Ano de fundação
6. **Arco da Porta Nova** - Contar pináculos
7. **Mercado Municipal** - Vídeo com código
8. *(Desafio 8 não existe - intencional)*
9. **Edifício Presidente** - Decifrar código
10. **Mapa para Bom Jesus** - Desenho de estranho

### Mini Desafios (13 total)

- Lojas com +15 letras
- Datas gravadas
- Ruas com nomes de animais/plantas
- Foto em equipa no ar
- Imitar estátua
- E mais 8 desafios aleatórios!

## 💾 Estrutura de Dados Firebase

```javascript
teams/
  └── [teamId]/
      ├── teamName: "Nome da Equipa"
      ├── score: 250
      ├── view: "MAIN_LOOP"
      ├── currentChallengeIndex: 3
      ├── lastUpdate: "2026-01-08T..."
      ├── pathHistory: [{lat, lng, timestamp}, ...]
      ├── challengePool: [...]
      └── currentMiniChallenge: "..."
```

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Realtime Database + Authentication)
- **APIs**: Geolocation API
- **Frameworks**: Nenhum! Puro JavaScript
- **Estilo**: CSS Variables, Dark Theme

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge (últimas versões)
- ✅ Mobile e Desktop
- ✅ GPS necessário para tracking
- ✅ Conexão internet necessária (Firebase)

## 🎨 Interface

- **Dark Mode** nativo
- **Design Responsivo**
- **Animações Suaves**
- **Feedback Visual** em todas as ações
- **Material Design** inspirado

## 📖 Documentação Adicional

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Setup completo do Firebase
- [GUIA_AUTENTICACAO.md](GUIA_AUTENTICACAO.md) - Guia de autenticação

## 🐛 Resolução de Problemas

### Firebase não conecta
```javascript
// Verifica se substituíste as credenciais em:
// - script.js (linhas 2-10)
// - admin.js (linhas 2-10)
// - setup-admin.html (linhas 63-71)
```

### GPS não funciona
- Permite acesso à localização no browser
- Usa HTTPS em produção (obrigatório)
- Verifica se o dispositivo tem GPS

### Admin não consegue fazer login
- Confirma que criaste o utilizador em `setup-admin.html`
- Verifica se Email/Password está ativo no Firebase Console
- Limpa cache do browser e tenta novamente

## 🚀 Deploy

### Opção 1: Firebase Hosting (Recomendado)
```bash
# Instala Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializa projeto
firebase init hosting

# Deploy
firebase deploy
```

### Opção 2: Netlify
1. Arrasta a pasta para Netlify Drop
2. Configurado automaticamente!

### Opção 3: GitHub Pages
1. Push para repositório GitHub
2. Ativa GitHub Pages nas settings
3. URL: `https://[username].github.io/[repo]`

## 📊 Estatísticas do Projeto

- **Ficheiros**: 8 principais
- **Linhas de Código**: ~1000+
- **Desafios**: 10 principais + 13 mini
- **Tempo de Desenvolvimento**: [configurável]

## 👥 Créditos

Desenvolvido para o **Indaba Challenge** em Braga, Portugal.

## 📄 Licença

Este projeto é de uso interno. Todos os direitos reservados.

---

**Versão**: 2.0 (com Firebase Authentication)  
**Última Atualização**: Janeiro 2026
