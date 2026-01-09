# 🔧 CORRIGIR ERRO DE PERMISSÕES - Firebase

## ❌ Erro Atual
```
permission_denied at /teams: Client doesn't have permission to access the desired data.
```

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Aceder ao Firebase Console
1. Vai a https://console.firebase.google.com/
2. Seleciona o projeto "indaba-36353"
3. No menu lateral, clica em **"Realtime Database"**
4. Clica no separador **"Regras"** (Rules)

### Passo 2: Substituir as Regras
Apaga tudo e cola isto:

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

### Passo 3: Publicar
1. Clica no botão **"Publicar"** (Publish)
2. Aguarda confirmação

### Passo 4: Testar
1. Volta ao admin.html
2. Atualiza a página (F5)
3. As equipas devem aparecer! ✅

---

## ⚠️ SE AINDA NÃO FUNCIONAR

Usa regras temporárias mais permissivas (APENAS PARA TESTE):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **IMPORTANTE**: Estas regras são INSEGURAS! Usa apenas para testar e depois volta às regras seguras acima.

---

## 🔍 Verificar Autenticação

Na consola do browser (F12), verifica se vês:
```
Current user: {email: "teu-email@..."}
```

Se não vires isto, o problema é que não fizeste login corretamente.
