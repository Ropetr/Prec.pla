# 📧 Configuração do Email Routing - PLANAC Sistema

## 🎯 Objetivo

Configurar o recebimento **automático** de XMLs de Notas Fiscais via email, sem necessidade de upload manual.

## ✅ O que foi implementado

- ✅ Email handler no Worker (`worker.js`)
- ✅ Processamento automático de anexos XML
- ✅ Identificação automática de tipo (entrada/saída)
- ✅ Registro de logs de processamento
- ✅ Integração com banco D1
- ✅ Deploy do Worker realizado

## 📋 Próximos Passos - Configuração no Cloudflare

### Passo 1: Acessar o Dashboard do Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Faça login com `planacacabamentos@gmail.com`
3. Selecione o domínio **planacdistribuidora.com.br**

### Passo 2: Ativar Email Routing

1. No menu lateral, clique em **"Email"** ou **"Email Routing"**
2. Clique em **"Get Started"** (se ainda não ativado)
3. O Cloudflare irá adicionar automaticamente os registros MX necessários
4. Aguarde alguns minutos para propagação DNS

### Passo 3: Criar Endereços de Email

#### 3.1 - Email para Notas de Compra

1. Clique em **"Destination addresses"** → **"Create address"**
2. Configure:
   - **Email address**: `nfe-compra@planacdistribuidora.com.br`
   - **Description**: "Recebimento automático de XMLs de Notas de Compra"
3. Clique em **"Save"**

#### 3.2 - Email para Notas de Venda

1. Clique em **"Destination addresses"** → **"Create address"**
2. Configure:
   - **Email address**: `nfe-venda@planacdistribuidora.com.br`
   - **Description**: "Recebimento automático de XMLs de Notas de Venda"
3. Clique em **"Save"**

#### 3.3 - Email Geral (Opcional)

1. Clique em **"Destination addresses"** → **"Create address"**
2. Configure:
   - **Email address**: `nfe@planacdistribuidora.com.br`
   - **Description**: "Recebimento geral de XMLs de NFe"
3. Clique em **"Save"**

### Passo 4: Criar Regras de Roteamento para o Worker

#### 4.1 - Regra para Notas de Compra

1. Clique em **"Routing rules"** → **"Create address"**
2. Configure:
   - **Name**: `XML Notas de Compra`
   - **Match**: `Custom address`
   - **Email**: `nfe-compra@planacdistribuidora.com.br`
   - **Action**: `Send to Worker`
   - **Worker**: Selecione **`planac-sistema`**
3. Clique em **"Save"**

#### 4.2 - Regra para Notas de Venda

1. Clique em **"Routing rules"** → **"Create address"**
2. Configure:
   - **Name**: `XML Notas de Venda`
   - **Match**: `Custom address`
   - **Email**: `nfe-venda@planacdistribuidora.com.br`
   - **Action**: `Send to Worker`
   - **Worker**: Selecione **`planac-sistema`**
3. Clique em **"Save"**

#### 4.3 - Regra Geral (Opcional)

1. Clique em **"Routing rules"** → **"Create address"**
2. Configure:
   - **Name**: `XML NFe Geral`
   - **Match**: `Custom address`
   - **Email**: `nfe@planacdistribuidora.com.br`
   - **Action**: `Send to Worker`
   - **Worker**: Selecione **`planac-sistema`**
3. Clique em **"Save"**

### Passo 5: Configurar Encaminhamento dos Emails Atuais (Hostinger)

Agora você precisa configurar os emails da Hostinger para **encaminhar automaticamente** os XMLs para os novos endereços do Cloudflare.

#### 5.1 - Encaminhamento do Email Financeiro

1. Acesse: https://webmail.hostinger.com
2. Faça login com:
   - Email: `financeiro@planacdivisorias.com.br`
   - Senha: `Rodelo122509.`
3. Vá em **Configurações** → **Filtros**
4. Clique em **"Criar Filtro"**
5. Configure:
   - **Nome do filtro**: `Encaminhar XMLs de NFe`
   - **Se**: `Anexo` → `contém` → `.xml`
   - **Então**: `Encaminhar para` → `nfe-compra@planacdistribuidora.com.br`
   - **E**: Marque ✅ `Manter cópia na caixa de entrada` (opcional)
6. Clique em **"Salvar"**

#### 5.2 - Encaminhamento do Email Marco

1. Faça login com:
   - Email: `marco@planacdivisorias.com.br`
   - Senha: `Rodelo122509.`
2. Repita o processo do passo 5.1

#### 5.3 - Encaminhamento do Email Rodrigo

1. Faça login com:
   - Email: `rodrigo@planacdivisorias.com.br`
   - Senha: `Rodelo122509.`
2. Repita o processo do passo 5.1

#### 5.4 - Encaminhamento do Email de Vendas

1. Faça login com:
   - Email: `planacnotaseboletos@planacdivisorias.com.br`
   - Senha: `Rodelo122509.`
2. Configure filtro para encaminhar para: `nfe-venda@planacdistribuidora.com.br`

## 🧪 Passo 6: Testar o Sistema

### 6.1 - Teste Manual

1. Envie um email de teste para: `nfe-compra@planacdistribuidora.com.br`
2. Anexe um arquivo XML de nota fiscal
3. Aguarde alguns segundos

### 6.2 - Verificar Logs no Cloudflare

1. Acesse o Dashboard do Cloudflare
2. Vá em **Workers & Pages** → **planac-sistema**
3. Clique em **"Logs"** ou **"Real-time logs"**
4. Procure por mensagens como:
   ```
   📧 Email recebido: remetente@exemplo.com nfe-compra@planacdistribuidora.com.br
   📋 Tipo de nota identificado: entrada
   📄 Processando XML: nota-fiscal.xml
   ✅ XML processado com sucesso: [invoice-id]
   ✨ Processamento concluído: 1 XMLs processados, 0 erros
   ```

### 6.3 - Verificar no Dashboard do Sistema

1. Abra o sistema: `index.html`
2. Faça login
3. Vá na aba **"Notas Fiscais"**
4. Verifique se a nota apareceu automaticamente

### 6.4 - Verificar no Banco de Dados

```bash
# No terminal
wrangler d1 execute Precificacao-Sistema --command="SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5"

# Ou verificar logs de processamento
wrangler d1 execute Precificacao-Sistema --command="SELECT * FROM email_processing_log ORDER BY processed_at DESC LIMIT 10"
```

## 🔍 Como Funciona

### Fluxo Completo:

```
1. Fornecedor envia nota → financeiro@planacdivisorias.com.br
2. Hostinger encaminha → nfe-compra@planacdistribuidora.com.br
3. Cloudflare Email Routing recebe
4. Worker processa automaticamente
5. XML extraído e parseado
6. Dados salvos no D1
7. Custos atualizados
8. Dashboard atualizado em tempo real
```

### Identificação de Tipo de Nota:

O worker identifica automaticamente o tipo baseado no destinatário:

- **Notas de ENTRADA** (compras):
  - `nfe-compra@planacdistribuidora.com.br`
  - `financeiro@planacdivisorias.com.br`
  - `marco@planacdivisorias.com.br`
  - `rodrigo@planacdivisorias.com.br`

- **Notas de SAÍDA** (vendas):
  - `nfe-venda@planacdistribuidora.com.br`
  - `planacnotaseboletos@planacdivisorias.com.br`

## 🎉 Benefícios

| Antes | Depois |
|-------|--------|
| ❌ Download manual de XMLs | ✅ Automático |
| ❌ Upload manual no sistema | ✅ Automático |
| ❌ Trabalho repetitivo | ✅ Zero trabalho |
| ⚠️ Risco de esquecer notas | ✅ Todas processadas |
| 🔴 Custos desatualizados | ✅ Tempo real |

## ⚙️ Configurações Avançadas (Opcional)

### Adicionar Notificações Push

Edite `worker.js` e implemente a função `sendConfirmationEmail()` para enviar emails de confirmação usando:

- Cloudflare Email Workers
- SendGrid API
- Mailgun API
- Ou outro serviço SMTP

### Adicionar Mais Regras

Você pode criar regras adicionais para:

- Separar por fornecedor específico
- Filtrar por assunto do email
- Processar apenas em horários específicos
- Enviar cópias para outros emails

### Monitoramento

Configure alertas no Cloudflare para ser notificado sobre:

- Erros no processamento
- Volume anormal de emails
- Falhas no Worker

## 🆘 Troubleshooting

### Problema: Email não está sendo recebido

**Solução:**
1. Verifique se o Email Routing está ativado
2. Confirme que os registros MX foram propagados (use https://mxtoolbox.com)
3. Verifique os logs do Worker

### Problema: XML não está sendo processado

**Solução:**
1. Verifique os logs do Worker (Real-time logs)
2. Confirme que o XML está anexado (não no corpo do email)
3. Verifique se o XML está em formato válido de NFe

### Problema: Custos não estão sendo atualizados

**Solução:**
1. Verifique se a nota é de ENTRADA (compra)
2. Confirme que o código do produto existe no banco
3. Verifique a tabela `product_cost_history` para ver se foi registrado

## 📞 Suporte

- **Logs do Worker**: https://dash.cloudflare.com → Workers → planac-sistema → Logs
- **Banco de Dados**: `wrangler d1 execute Precificacao-Sistema --command="[SQL]"`
- **GitHub**: https://github.com/Ropetr/Prec.pla

## ✅ Checklist Final

- [ ] Domínio `planacdistribuidora.com.br` adicionado ao Cloudflare
- [ ] Email Routing ativado
- [ ] Emails `nfe-compra@` e `nfe-venda@` criados
- [ ] Regras de roteamento para Worker configuradas
- [ ] Filtros de encaminhamento configurados no Hostinger (4 emails)
- [ ] Teste enviado e processado com sucesso
- [ ] Logs verificados no Cloudflare
- [ ] Nota apareceu no dashboard do sistema

---

🤖 **Sistema configurado e pronto para processamento automático!**

Última atualização: 25/11/2025
