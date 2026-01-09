# 🔧 CORRIGIR ERRO DE PERMISSÕES - Firebase

## ❌ Erro Atual
```
permission_denied at /teams: Client doesn't have permission to access the desired data.
```

## ✅ SOLUÇÃO DEFINITIVA

### Opção 1: Regras Simples (Recomendado para Teste)

Vai ao Firebase Console:
1. **Realtime Database** → **Regras**
2. Apaga TUDO e cola:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. Clica **"Publicar"**

⚠️ **Estas regras permitem acesso total!** Usa apenas para testar. Quando funcionar, muda para as regras seguras abaixo.

---

### Opção 2: Regras Seguras (Usar depois de testar)

```json
{
  "rules": {
    "teams": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$teamId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 🎯 TESTA AGORA

1. Usa as **Regras Simples** (Opção 1)
2. Publica no Firebase
3. Atualiza o admin.html (F5)
4. **Deve funcionar!** ✅

Se funcionar, volta e usa as **Regras Seguras** (Opção 2).
