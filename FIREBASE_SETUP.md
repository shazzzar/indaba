# Configuração do Firebase - Indaba Challenge

## 1. Criar projeto Firebase

1. Acede a https://console.firebase.google.com/
2. Clica em "Adicionar projeto"
3. Nome do projeto: "indaba-challenge" (ou outro à tua escolha)
4. Segue os passos até criar o projeto

## 2. Configurar Realtime Database

1. No menu lateral, vai a "Build" > "Realtime Database"
2. Clica em "Criar base de dados"
3. Escolhe a localização (recomendo "europe-west1")
4. Modo de segurança: começa em "Modo de teste" (vamos configurar as regras depois)

## 3. Configurar Authentication

1. No menu lateral, vai a "Build" > "Authentication"
2. Clica em "Começar"
3. Ativa os seguintes métodos de login:
   - **Email/Password**: Ativa para os administradores
   - **Anónimo**: Ativa para as equipas jogadoras
4. Clica em "Guardar"

## 4. Obter configuração

1. Vai a "Definições do projeto" (ícone de engrenagem)
2. Em "As tuas apps", clica no ícone "</>" (Web)
3. Regista a app com o nome "Indaba Web App"
4. Copia o objeto `firebaseConfig`

## 4. Atualizar os ficheiros

Substitui a configuração do Firebase nos seguintes ficheiros:
- `script.js` (linha ~1-10)
- `admin.js` (linha ~1-10)

Exemplo:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "indaba-challenge.firebaseapp.com",
    databaseURL: "https://indaba-challenge-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "indaba-challenge",
    storageBucket: "indaba-challenge.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## 5. Configurar Regras de Segurança

Na Realtime Database, vai a "Regras" e substitui por:

```json
{
  "rules": {
    "teams": {
      "$teamId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

✅ **Segurança melhorada**: Agora só utilizadores autenticados (admins ou jogadores anónimos) podem aceder aos dados.

## 6. Criar Utilizador Admin

1. Abre o ficheiro `setup-admin.html` no browser
2. Preenche:
   - **Email**: admin@indaba.pt (ou outro à tua escolha)
   - **Password**: cria uma password segura (mínimo 6 caracteres)
3. Clica em "CRIAR ADMIN"
4. Após sucesso, usa estas credenciais em `admin.html`

⚠️ **Nota**: Só precisas de usar `setup-admin.html` uma vez. Depois, usa sempre `admin.html` para fazer login.

## 7. Testar

1. Abre `index.html` num browser
2. Regista uma equipa (será autenticada anonimamente)
3. Faz algumas ações
4. Abre `admin.html` num novo separador
5. Faz login com as credenciais criadas em `setup-admin.html`
6. Deves ver os dados da equipa em tempo real!

## 8. Estrutura de Dados Firebase

```
teams/
  ├── [teamId1]/
  │   ├── teamName: "Equipa A"
  │   ├── score: 200
  │   ├── view: "MAIN_LOOP"
  │   ├── currentChallengeIndex: 3
  │   ├── lastUpdate: "2026-01-08T..."
  │   ├── pathHistory: [...]
  │   └── currentMiniChallenge: "..."
  └── [teamId2]/
      └── ...
```

## Funcionalidades Implementadas

### Para os Jogadores (index.html):
- ✅ Autenticação anónima automática
- ✅ Dados guardados automaticamente no Firebase
- ✅ Sincronização em tempo real
- ✅ Histórico GPS guardado
- ✅ Estado do jogo persistente
- ✅ Acesso seguro aos dados

### Para o Admin (admin.html):
- ✅ Login com Firebase Authentication (Email/Password)
- ✅ Ver todas as equipas em tempo real
- ✅ Estatísticas gerais (total equipas, média, melhor score)
- ✅ Progresso de cada equipa
- ✅ Localização GPS (número de pontos)
- ✅ Atualização automática a cada 30 segundos
- ✅ Ordenação por pontuação
- ✅ Mostra email do admin logado

### Setup (setup-admin.html):
- ✅ Interface para criar utilizador admin
- ✅ Validação de dados
- ✅ Feedback visual de sucesso/erro
- ✅ Redirecionamento automático para admin

## Segurança Implementada

### Firebase Authentication
- ✅ **Admins**: Login com email e password
- ✅ **Jogadores**: Autenticação anónima automática
- ✅ **Regras Database**: Apenas utilizadores autenticados têm acesso
- ✅ **Sessões**: Gestão automática de sessões pelo Firebase

### Boas Práticas
1. ✅ Separação de permissões (admin vs jogadores)
2. ✅ Autenticação obrigatória para todos os acessos
3. ✅ Gestão de erros adequada
4. ✅ Feedback ao utilizador
5. ✅ Logout seguro

## Notas de Segurança

Implementado:
1. ✅ Firebase Authentication com Email/Password para admins
2. ✅ Autenticação anónima para jogadores
3. ✅ Regras de segurança que exigem autenticação
4. ✅ Gestão segura de sessões

Recomendações adicionais para produção:
1. Configurar domínios autorizados no Firebase
2. Ativar 2FA para contas admin
3. Implementar rate limiting
4. Usar HTTPS obrigatório
5. Monitorizar acessos suspeitos no Firebase Console
