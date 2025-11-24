# ⚡ Quick Start - Deploy em 5 Minutos

## 🔴 **Problemas Encontrados e Corrigidos**

### ❌ Antes:
- Worker apontando para arquivo inexistente (`email-scanner-worker.js`)
- Rota configurada para domínio não existente
- Nenhuma conexão GitHub → Cloudflare
- Sem rota de produção funcional

### ✅ Agora:
- Worker corrigido (`worker.js`)
- Configuração pronta para usar URL padrão Cloudflare
- Guia completo de integração GitHub
- Deploy automático documentado

---

## 🚀 **Deploy Rápido - Escolha sua opção:**

### **Opção 1: Deploy Completo (5 min)** ⭐ RECOMENDADO

```bash
# 1. Login no Cloudflare
wrangler login

# 2. Deploy do Worker (Backend/API)
wrangler deploy

# ✅ Pronto! Worker no ar em:
# https://precplanac.SEU-USUARIO.workers.dev
```

**Então:**
1. Acesse https://dash.cloudflare.com
2. **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
3. Selecione o repositório: `Prec.pla`
4. Deploy automático configurado! ✅

---

### **Opção 2: Apenas Worker (2 min)**

```bash
wrangler deploy
```

Sua API estará disponível em:
- `https://precplanac.SEU-USUARIO.workers.dev/api/scan`
- `https://precplanac.SEU-USUARIO.workers.dev/api/invoices`
- `https://precplanac.SEU-USUARIO.workers.dev/api/stats`

---

### **Opção 3: Apenas Frontend (2 min)**

1. Acesse: https://dash.cloudflare.com
2. **Workers & Pages** > **Create** > **Pages** > **Upload assets**
3. Arraste: `index.html` e `scanner.html`
4. Nome: `planac-sistema`
5. **Deploy** ✅

URL gerada: `https://planac-sistema.pages.dev`

---

## 🎯 **Próximos Passos (Opcional mas Recomendado)**

### 1. Configurar Banco de Dados D1

```bash
# Criar tabelas
wrangler d1 execute Precificacao-Sistema --command "
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT,
  cfop TEXT,
  issue_date TEXT,
  type TEXT,
  entity_name TEXT,
  total_invoice REAL,
  value_icms REAL,
  value_st REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  product_code TEXT,
  product_name TEXT,
  ncm TEXT,
  cost_price REAL,
  has_st INTEGER
);

CREATE TABLE IF NOT EXISTS email_configs (
  email_address TEXT PRIMARY KEY,
  email_type TEXT,
  is_active INTEGER DEFAULT 1,
  last_scan TEXT
);"
```

### 2. Adicionar Senha dos Emails (Secret)

```bash
wrangler secret put EMAIL_PASSWORD
# Digite quando solicitado: Rodelo122509.
```

### 3. Conectar GitHub ao Cloudflare Pages (Deploy Automático)

1. Dashboard > **Workers & Pages** > **Create** > **Pages**
2. **Connect to Git** > Autorizar GitHub
3. Selecionar: `Prec.pla`
4. Configurar:
   - Branch: `main`
   - Build command: (vazio)
   - Output: `/`
5. **Save and Deploy**

✅ **Agora todo commit no GitHub faz deploy automático!**

---

## 🧪 **Testar Localmente**

```bash
# Testar worker local
wrangler dev

# Acesse: http://localhost:8787
```

---

## 📊 **Verificar Status**

```bash
# Ver deployments
wrangler deployments list

# Ver logs ao vivo
wrangler tail

# Listar databases
wrangler d1 list

# Ver tabelas criadas
wrangler d1 execute Precificacao-Sistema --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🔗 **URLs Finais**

Após deploy completo, você terá:

### Frontend:
- 🌐 **Sistema Principal:** https://planac-sistema.pages.dev
- 📧 **Scanner:** https://planac-sistema.pages.dev/scanner.html

### Backend:
- 🔌 **API Base:** https://precplanac.SEU-USUARIO.workers.dev
- 📊 **Stats:** https://precplanac.SEU-USUARIO.workers.dev/api/stats
- 🔍 **Scanner:** https://precplanac.SEU-USUARIO.workers.dev/api/scan
- 📋 **Invoices:** https://precplanac.SEU-USUARIO.workers.dev/api/invoices

---

## ⚠️ **Por que não estava funcionando?**

1. **Nome do arquivo errado** no wrangler.toml:
   - ❌ `email-scanner-worker.js` (não existe)
   - ✅ `worker.js` (corrigido)

2. **Rota customizada sem domínio:**
   - ❌ `scanner.planac.com.br/*` (domínio não configurado)
   - ✅ Comentado para usar URL padrão Cloudflare

3. **Sem conexão GitHub:**
   - ❌ Repositório isolado
   - ✅ Conectar via Dashboard para deploy automático

---

## 💡 **Dicas**

- Use `wrangler tail` para ver logs em tempo real
- Commits no GitHub disparam deploy automático (após conectar)
- URLs do Cloudflare são HTTPS automático
- CDN global incluso (sem custo extra)

---

## 📚 **Documentação Completa**

Para configurações avançadas, veja: `CLOUDFLARE-SETUP.md`

---

**🎉 Pronto para deploy! Escolha uma opção acima e em 5 minutos está no ar.**
