# ✅ Checklist de Configuração - Firebase Authentication

## 🎯 Passo a Passo Rápido

### ☐ 1. Firebase Console - Authentication

1. [ ] Aceder a https://console.firebase.google.com/
2. [ ] Ir a **Authentication** → **Sign-in method**
3. [ ] Ativar **Email/Password**
4. [ ] Ativar **Anónimo**
5. [ ] Clicar em "Save"

### ☐ 2. Firebase Console - Regras de Segurança

1. [ ] Ir a **Realtime Database** → **Rules**
2. [ ] Copiar e colar as regras:

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

3. [ ] Clicar em "Publish"

### ☐ 3. Criar Utilizador Admin

1. [ ] Abrir `setup-admin.html` no browser
2. [ ] Preencher formulário:
   - Email: ___________________
   - Password: ___________________
3. [ ] Clicar em "CRIAR ADMIN"
4. [ ] ✅ Guardar credenciais num local seguro!

### ☐ 4. Testar Sistema de Jogadores

1. [ ] Abrir `index.html` no browser
2. [ ] Criar uma equipa de teste
3. [ ] Fazer pelo menos 1 ação
4. [ ] Verificar que não há erros na consola (F12)

### ☐ 5. Testar Painel Admin

1. [ ] Abrir `admin.html` no browser
2. [ ] Fazer login com credenciais criadas no passo 3
3. [ ] Verificar que vês a equipa de teste
4. [ ] Testar botão "🔄 Atualizar"

### ☐ 6. Verificar no Firebase Console

1. [ ] **Authentication** → **Users**
   - [ ] Ver utilizadores anónimos (jogadores)
   - [ ] Ver admin com email
2. [ ] **Realtime Database** → **Data**
   - [ ] Ver estrutura `teams/`
   - [ ] Ver dados da equipa de teste

## 🚨 Resolução Rápida de Problemas

### ❌ Erro: "auth != null"
**Solução:** Verifica se ativaste Authentication Anónima no Firebase Console

### ❌ Login admin não funciona
**Solução:** Confirma que criaste o utilizador em setup-admin.html

### ❌ Dados não guardam
**Solução:** Verifica se as regras de segurança estão corretas

### ❌ Firebase não conecta
**Solução:** Confirma que substituíste as credenciais do Firebase em:
- [ ] script.js
- [ ] admin.js  
- [ ] setup-admin.html

## 📊 Validação Final

Depois de completar todos os passos, deves ter:

- ✅ Authentication ativo no Firebase
- ✅ 2 métodos de login ativos (Email/Password + Anónimo)
- ✅ Regras de segurança configuradas
- ✅ 1 utilizador admin criado
- ✅ Equipas a guardar dados no Firebase
- ✅ Admin a visualizar dados em tempo real

## 🎉 Configuração Completa!

Se todos os itens acima estão marcados ✅, o sistema está pronto a usar!

---

**Tempo estimado:** 10-15 minutos  
**Dificuldade:** ⭐⭐☆☆☆ Fácil

**Dúvidas?** Consulta:
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Guia detalhado
- [GUIA_AUTENTICACAO.md](GUIA_AUTENTICACAO.md) - Guia de autenticação
- [README.md](README.md) - Documentação geral
