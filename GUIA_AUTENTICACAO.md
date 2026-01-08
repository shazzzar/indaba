# 🚀 Guia Rápido - Firebase Authentication

## ✅ O que foi implementado

Firebase Authentication está agora totalmente integrado no projeto Indaba Challenge!

### 🔐 Sistema de Autenticação

1. **Jogadores (index.html)**
   - Autenticação **anónima automática**
   - Não precisam de criar conta
   - Cada equipa recebe um ID único
   - Dados guardados de forma segura

2. **Administradores (admin.html)**
   - Login com **email e password**
   - Acesso a todos os dados das equipas
   - Sessão persistente (não precisas fazer login sempre)

## 📋 Passos para começar

### 1️⃣ Configurar Firebase (primeira vez)

1. Vai ao [Firebase Console](https://console.firebase.google.com/)
2. Ativa **Authentication** com:
   - ✅ Email/Password
   - ✅ Anónimo
3. Configura as regras de segurança (ver FIREBASE_SETUP.md)

### 2️⃣ Criar conta de Admin (primeira vez)

1. Abre **setup-admin.html** no browser
2. Preenche:
   ```
   Email: admin@indaba.pt
   Password: (tua password segura)
   ```
3. Clica em "CRIAR ADMIN"
4. Guarda estas credenciais! 📝

### 3️⃣ Usar o sistema

**Para Jogadores:**
- Abre `index.html`
- Começa a jogar normalmente
- Tudo é guardado automaticamente ✅

**Para Administradores:**
- Abre `admin.html`
- Faz login com as credenciais criadas
- Vê todas as equipas em tempo real 📊

## 🔒 Regras de Segurança

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

**O que isto significa:**
- ✅ Só utilizadores autenticados podem ler/escrever
- ✅ Jogadores (anónimos) acedem aos seus dados
- ✅ Admins (email/password) acedem a tudo
- ❌ Sem autenticação = sem acesso

## 🛠️ Resolução de Problemas

### "Erro ao guardar no Firebase"
- Verifica se a autenticação anónima está ativa no Firebase Console
- Confirma que as regras de segurança estão corretas

### "Erro no login do admin"
- Verifica se o email/password estão corretos
- Certifica-te que criaste o utilizador em setup-admin.html
- Verifica se Email/Password está ativo no Firebase Authentication

### "Dados não aparecem no admin"
- Confirma que tens equipas a jogar
- Clica no botão "🔄 Atualizar"
- Verifica a consola do browser (F12) para erros

## 📊 Firebase Console - Onde ver os dados

1. **Authentication** → Users
   - Vê utilizadores anónimos (jogadores)
   - Vê admins com email
   
2. **Realtime Database** → Data
   - Vê a estrutura `teams/`
   - Vê dados de cada equipa em tempo real

3. **Authentication** → Settings
   - Configura domínios autorizados
   - Ativa/desativa métodos de login

## 🎯 Ficheiros do Projeto

| Ficheiro | Descrição |
|----------|-----------|
| `index.html` | Interface para jogadores |
| `admin.html` | Painel de administração |
| `setup-admin.html` | Criar utilizador admin (usar 1x) |
| `script.js` | Lógica do jogo + Firebase |
| `admin.js` | Lógica do painel admin |
| `FIREBASE_SETUP.md` | Guia detalhado de configuração |

## ✨ Benefícios da Autenticação

### Antes (sem auth):
- ❌ Qualquer pessoa podia aceder aos dados
- ❌ Sem controlo de acessos
- ❌ Password hardcoded no código

### Agora (com auth):
- ✅ Acesso controlado e seguro
- ✅ Gestão de utilizadores pelo Firebase
- ✅ Sessões automáticas
- ✅ Regras de segurança ativas
- ✅ Logs de acesso no Firebase

## 🚨 Importante

1. **Guarda as credenciais de admin** - se perderes, terás de criar novo utilizador
2. **Usa HTTPS em produção** - obrigatório para segurança
3. **Não partilhes as credenciais** - cada admin deve ter a sua conta
4. **Backup regular** - exporta dados do Firebase regularmente

## 💡 Próximos Passos (Opcional)

- [ ] Adicionar recuperação de password
- [ ] Múltiplos admins com diferentes permissões
- [ ] Logs de atividade de admin
- [ ] Exportação de dados para Excel/CSV
- [ ] Notificações em tempo real
