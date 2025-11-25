# 🔄 Migração do Domínio planacdivisorias.com.br para Cloudflare

## 🎯 Objetivo

Trazer o domínio `planacdivisorias.com.br` para o Cloudflare para usar Email Routing nos emails existentes.

---

## ✅ Opção 1: Migrar Domínio Completo (RECOMENDADO)

### Passo 1: Adicionar Domínio ao Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Clique em **"Add a Site"**
3. Digite: `planacdivisorias.com.br`
4. Clique em **"Add Site"**
5. Selecione o plano **Free**
6. Clique em **"Continue"**

### Passo 2: Cloudflare Vai Escanear DNS

O Cloudflare vai importar automaticamente todos os registros DNS existentes:
- Registros A (sites)
- Registros MX (emails)
- Registros CNAME
- Registros TXT
- Etc.

**⚠️ IMPORTANTE**: Verifique se todos os registros foram importados corretamente, especialmente:
- Registros MX do Hostinger
- Registros A do site (se houver)
- Registros TXT (SPF, DKIM)

### Passo 3: Atualizar Nameservers no Registro.br

O Cloudflare vai fornecer 2 nameservers. Exemplo:
```
nameserver1: bree.ns.cloudflare.com
nameserver2: jim.ns.cloudflare.com
```

Agora você precisa atualizar no Registro.br:

#### 3.1 - Acessar Registro.br
1. Acesse: https://registro.br
2. Faça login com CPF/CNPJ
3. Vá em **"Meus Domínios"**
4. Clique em `planacdivisorias.com.br`

#### 3.2 - Alterar DNS
1. Clique em **"Alterar Servidores DNS"**
2. Selecione **"Usar outros servidores DNS"**
3. Cole os nameservers fornecidos pelo Cloudflare:
   - **DNS1**: `bree.ns.cloudflare.com` (exemplo)
   - **DNS2**: `jim.ns.cloudflare.com` (exemplo)
4. Clique em **"Salvar"**

#### 3.3 - Aguardar Propagação
- Tempo: 2 a 24 horas (geralmente 2-4 horas)
- Status no Cloudflare mudará para "Active" quando concluir

### Passo 4: Ativar Email Routing no Domínio Original

Após a migração estar ativa:

1. No dashboard do Cloudflare, selecione `planacdivisorias.com.br`
2. Vá em **"Email"** → **"Email Routing"**
3. Clique em **"Get Started"**
4. Configure regras para encaminhar para o Worker

#### 4.1 - Criar Regras de Roteamento

**Regra 1 - Financeiro**:
- Match: `financeiro@planacdivisorias.com.br`
- Action: **Send to Worker**
- Worker: `planac-sistema`

**Regra 2 - Marco**:
- Match: `marco@planacdivisorias.com.br`
- Action: **Send to Worker**
- Worker: `planac-sistema`

**Regra 3 - Rodrigo**:
- Match: `rodrigo@planacdivisorias.com.br`
- Action: **Send to Worker**
- Worker: `planac-sistema`

**Regra 4 - Notas e Boletos**:
- Match: `planacnotaseboletos@planacdivisorias.com.br`
- Action: **Send to Worker**
- Worker: `planac-sistema`

### Passo 5: Manter Emails Funcionando na Hostinger

**⚠️ CRÍTICO**: Para que os emails continuem funcionando normalmente (receber/enviar via Outlook, Gmail, etc), você precisa:

1. **Manter registros MX do Hostinger** no DNS do Cloudflare
2. **Adicionar regras de Email Routing** apenas para encaminhar cópias ao Worker

#### 5.1 - Verificar Registros MX

No Cloudflare DNS do `planacdivisorias.com.br`, confirme que existem:

```
Tipo: MX
Nome: @
Conteúdo: mx1.hostinger.com
Prioridade: 10
Proxy: Desligado (DNS only)

Tipo: MX
Nome: @
Conteúdo: mx2.hostinger.com
Prioridade: 20
Proxy: Desligado (DNS only)
```

#### 5.2 - Configurar Modo Híbrido

Para receber emails TANTO no Hostinger QUANTO processar no Worker:

1. Configure regras de Email Routing para **"Send to Worker"** E **"Send to Email"**
2. Ou use o modo **"Catch-All"** que envia para Worker mas mantém entrega normal

---

## ✅ Opção 2: Manter Domínio Separado (Mais Simples)

Se não quiser migrar todo o domínio, você pode usar apenas encaminhamento:

### Configurar Filtros na Hostinger (Como já documentado)

1. Acesse webmail de cada email
2. Crie filtros para encaminhar XMLs para:
   - `nfe-compra@planacdistribuidora.com.br`
   - `nfe-venda@planacdistribuidora.com.br`

**Desvantagem**: Requer filtros manuais e não é 100% automático

---

## 📊 Comparação das Opções

| Aspecto | Opção 1: Migrar Domínio | Opção 2: Encaminhamento |
|---------|-------------------------|-------------------------|
| Automação | ✅ 100% automático | ⚠️ Requer filtros |
| Configuração | 🟡 Inicial mais complexa | 🟢 Simples |
| Manutenção | 🟢 Zero | 🟡 Requer monitoramento |
| Confiabilidade | 🟢 Alta | 🟡 Média |
| Custo | 🟢 Gratuito | 🟢 Gratuito |

---

## 🎯 Minha Recomendação

**Opção 1: Migrar o domínio `planacdivisorias.com.br` para Cloudflare**

### Por quê?
1. ✅ Processamento 100% automático
2. ✅ Controle total no mesmo dashboard
3. ✅ Email Routing nativo
4. ✅ Mantém emails funcionando normalmente no Hostinger
5. ✅ Sem necessidade de filtros manuais
6. ✅ Mais confiável e escalável

### O que vai acontecer?
- ✅ Emails continuam funcionando normalmente
- ✅ Outlook/Gmail continuam funcionando
- ✅ Envio/recebimento normal mantido
- ✅ MAIS: XMLs processados automaticamente pelo Worker

---

## ⚠️ Cuidados Importantes

### Antes de Migrar:

1. **Backup DNS**: Anote todos os registros DNS atuais
2. **Registros MX**: Certifique-se de manter os MX do Hostinger
3. **SPF/DKIM**: Verifique registros TXT de autenticação
4. **Site**: Se tiver site, confirme registro A

### Durante a Migração:

- ⏰ Faça em horário de menor movimento
- 📧 Avisar usuários que pode haver instabilidade
- 🔍 Monitorar logs durante propagação

### Após Migração:

- ✅ Testar envio/recebimento de emails
- ✅ Testar processamento de XMLs
- ✅ Verificar logs do Worker
- ✅ Confirmar que todas as rotas DNS funcionam

---

## 🆘 Troubleshooting

### Emails param de funcionar após migração

**Solução**: Verificar se registros MX do Hostinger foram mantidos corretamente

### Email Routing não está processando

**Solução**:
1. Confirmar que regras foram criadas
2. Verificar se Worker está associado
3. Checar logs em Real-time

### Propagação DNS demora muito

**Solução**: Use ferramentas para verificar:
- https://dnschecker.org
- https://mxtoolbox.com

---

## 📞 Checklist de Migração

- [ ] Domínio adicionado ao Cloudflare
- [ ] Registros DNS importados e verificados
- [ ] Registros MX do Hostinger mantidos
- [ ] Nameservers atualizados no Registro.br
- [ ] Propagação DNS concluída (status "Active")
- [ ] Email Routing ativado
- [ ] Regras de roteamento criadas (4 emails)
- [ ] Worker `planac-sistema` associado
- [ ] Teste de envio/recebimento realizado
- [ ] Teste de processamento de XML realizado
- [ ] Logs verificados e funcionando

---

🤖 **Sistema pronto para processamento 100% automático após migração!**

Última atualização: 25/11/2025
