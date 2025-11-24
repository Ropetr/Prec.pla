# 🚀 Guia Completo de Deploy no Cloudflare

## ✅ Correções Realizadas

1. ✅ **wrangler.toml corrigido** - apontando para `worker.js` (arquivo correto)
2. ✅ **Rota customizada comentada** - para usar URL padrão do Cloudflare
3. ✅ **Watch paths atualizados** - incluindo todos os arquivos principais

---

## 📋 **Problemas Identificados**

### 🔴 Problema 1: Worker não faz deploy automático
**Causa:** Worker não está conectado ao GitHub para deploy automático

**Solução:** Siga os passos abaixo para configurar

### 🔴 Problema 2: Não tem rota de produção
**Causa:** Rota estava configurada para domínio customizado não existente

**Solução:** Usar a URL padrão do Cloudflare Workers (precplanac.SEU-USUARIO.workers.dev)

---

## 🎯 **Deploy do Worker (Backend API)**

### Opção 1: Deploy Manual via Wrangler (RECOMENDADO)

```bash
# 1. Faça login no Cloudflare
wrangler login

# 2. Publique o worker
wrangler deploy

# 3. Sua URL será algo como:
# https://precplanac.SEU-USUARIO.workers.dev
```

### Opção 2: Deploy via Dashboard do Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Vá em **Workers & Pages**
3. Clique em **Create application** > **Create Worker**
4. Nome: `precplanac`
5. Clique em **Deploy**
6. Clique em **Quick Edit**
7. Cole o conteúdo de `worker.js`
8. Clique em **Save and Deploy**

---

## 🌐 **Deploy do Frontend (Pages)**

### Método 1: Conectar ao GitHub (Deploy Automático)

1. **Acesse o Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com
   ```

2. **Vá em Workers & Pages**
   - Clique em **Create application**
   - Escolha **Pages**
   - Clique em **Connect to Git**

3. **Conecte ao GitHub**
   - Autorize o Cloudflare a acessar seu GitHub
   - Selecione o repositório: `Prec.pla`
   - Confirme

4. **Configure o projeto**
   ```
   Project name: planac-sistema
   Production branch: main
   Build command: (deixe vazio)
   Build output directory: /
   Root directory: /
   ```

5. **Salve e faça o deploy**
   - Clique em **Save and Deploy**
   - ✅ Agora TODOS os commits no GitHub farão deploy automático!

### Método 2: Upload Direto (Sem GitHub)

1. **Acesse o Cloudflare Dashboard**
2. **Workers & Pages** > **Create application** > **Pages**
3. **Upload assets**
4. Arraste os arquivos:
   - `index.html`
   - `scanner.html`
   - `tema-planac.css`
5. Nome do projeto: `planac-sistema`
6. **Deploy site**

---

## 🔗 **URLs após Deploy**

### Frontend (Pages):
```
https://planac-sistema.pages.dev
https://planac-sistema.pages.dev/scanner.html
```

### Backend (Worker):
```
https://precplanac.SEU-USUARIO.workers.dev
https://precplanac.SEU-USUARIO.workers.dev/api/scan
https://precplanac.SEU-USUARIO.workers.dev/api/invoices
https://precplanac.SEU-USUARIO.workers.dev/api/stats
```

---

## 🗄️ **Configurar Banco de Dados D1**

O banco D1 já está configurado no `wrangler.toml`, mas você precisa criá-lo:

```bash
# 1. Criar banco de dados
wrangler d1 create Precificacao-Sistema

# 2. Copie o ID gerado e atualize no wrangler.toml (linha 10)
# O ID atual é: 3843b4b1-8bf8-4b01-8b5d-24bc26669ecf
# Se precisar de um novo, substitua

# 3. Criar tabelas
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

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT,
  product_code TEXT,
  product_name TEXT,
  ncm TEXT,
  cfop TEXT,
  quantity REAL,
  unit_value REAL,
  total_value REAL,
  icms_value REAL,
  st_value REAL,
  mva REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  product_code TEXT,
  product_name TEXT,
  ncm TEXT,
  cost_price REAL,
  unit TEXT,
  product_group TEXT,
  has_st INTEGER,
  last_purchase_date TEXT,
  last_purchase_value REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_configs (
  email_address TEXT PRIMARY KEY,
  email_type TEXT,
  is_active INTEGER DEFAULT 1,
  last_scan TEXT
);
"

# 4. Deploy novamente
wrangler deploy
```

---

## 🔐 **Configurar Secrets (Senhas)**

```bash
# Adicionar senha dos emails (NÃO commitar no código!)
wrangler secret put EMAIL_PASSWORD

# Quando solicitado, digite: Rodelo122509.
```

---

## ⚙️ **Configurar KV Namespace (Cache)**

```bash
# 1. Criar KV namespace
wrangler kv:namespace create "CACHE"

# 2. Copie o ID gerado
# Atualize no wrangler.toml linha 15

# 3. Criar namespace de preview
wrangler kv:namespace create "CACHE" --preview

# 4. Copie o preview_id
# Atualize no wrangler.toml linha 16
```

---

## 🔄 **Habilitar Deploy Automático do Worker**

### Via GitHub Actions (CI/CD)

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Worker
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**Configurar Secret no GitHub:**
1. Vá em Settings > Secrets and variables > Actions
2. Clique em **New repository secret**
3. Nome: `CLOUDFLARE_API_TOKEN`
4. Valor: Seu API Token do Cloudflare
   - Gere em: https://dash.cloudflare.com/profile/api-tokens
   - Template: **Edit Cloudflare Workers**

---

## 📊 **Verificar Status**

```bash
# Ver status do worker
wrangler deployments list

# Ver logs em tempo real
wrangler tail

# Testar localmente
wrangler dev
```

---

## 🎯 **Próximos Passos**

1. ✅ **Deploy do Worker**
   ```bash
   wrangler deploy
   ```

2. ✅ **Conectar Pages ao GitHub**
   - Dashboard > Workers & Pages > Connect to Git

3. ✅ **Configurar D1 Database**
   ```bash
   wrangler d1 execute Precificacao-Sistema --file=schema.sql
   ```

4. ✅ **Adicionar Secrets**
   ```bash
   wrangler secret put EMAIL_PASSWORD
   ```

5. ✅ **Testar as URLs**
   - Frontend: https://planac-sistema.pages.dev
   - Backend: https://precplanac.SEU-USUARIO.workers.dev/api/stats

---

## 🔧 **Troubleshooting**

### Worker não está respondendo
```bash
# Verificar logs
wrangler tail

# Verificar configuração
wrangler whoami
```

### D1 Database não conecta
```bash
# Listar databases
wrangler d1 list

# Verificar tabelas
wrangler d1 execute Precificacao-Sistema --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Pages não atualiza
- Verifique se o GitHub está conectado
- Vá em Pages > Deployments > View build log

---

## 📞 **Suporte**

- Documentação Cloudflare Workers: https://developers.cloudflare.com/workers/
- Documentação Cloudflare Pages: https://developers.cloudflare.com/pages/
- Documentação D1: https://developers.cloudflare.com/d1/

---

**✅ Configurações corrigidas e prontas para deploy!**
