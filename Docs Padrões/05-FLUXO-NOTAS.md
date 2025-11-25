# 📧 Fluxo de Processamento de Notas Fiscais - PLANAC

## 🎯 Visão Geral

Sistema automatizado de recebimento, processamento e importação de Notas Fiscais Eletrônicas (NFe) via email.

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   CLOUDFLARE ECOSYSTEM                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐       ┌──────────────┐              │
│  │ Email Routing│ ----> │ Cloudflare   │              │
│  │ (Hostinger)  │       │ Worker       │              │
│  └──────────────┘       └──────┬───────┘              │
│                                 │                       │
│                                 ▼                       │
│                         ┌──────────────┐               │
│                         │ XML Parser   │               │
│                         └──────┬───────┘               │
│                                 │                       │
│                                 ▼                       │
│                         ┌──────────────┐               │
│                         │ D1 Database  │               │
│                         │  (SQLite)    │               │
│                         └──────────────┘               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo

### 1. Recebimento do Email

```
FORNECEDOR
   │
   │ Envia email com XML anexo
   │
   ▼
compras@planacdistribuidora.com.br
   │
   │ Email Routing (Hostinger → Cloudflare)
   │
   ▼
CLOUDFLARE WORKER
```

#### Configuração Email Routing

**Origem:** Hostinger IMAP
- Host: `imap.hostinger.com`
- Porta: `993` (SSL)
- Pastas monitoradas: `INBOX`, `Notas Fiscais`

**Destino:** Cloudflare Worker
- URL: `https://precplanac.planacacabamentos.workers.dev/email`
- Método: `POST`
- Content-Type: `message/rfc822`

#### Estrutura do Email Recebido

```javascript
// Headers importantes
const emailHeaders = {
  'from': 'fornecedor@email.com',
  'to': 'compras@planacdistribuidora.com.br',
  'subject': 'NF-e 00123456 - Empresa Fornecedora',
  'date': '2025-11-25T10:30:00Z',
  'message-id': '<unique-id@domain.com>',
};

// Anexos
const attachments = [
  {
    filename: '35251012345678000199550010000123451234567890-nfe.xml',
    contentType: 'application/xml',
    size: 15420,
    content: '<nfeProc>...</nfeProc>',
  },
];
```

---

### 2. Processamento do Worker

#### Fluxo do Worker

```javascript
// worker.js - Fluxo principal

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Rota: POST /email
    if (url.pathname === '/email' && request.method === 'POST') {
      return await handleEmailReceived(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },

  // Cron: A cada 10 minutos
  async scheduled(event, env, ctx) {
    ctx.waitUntil(processScheduledEmails(env));
  },
};
```

#### Handler de Email

```javascript
async function handleEmailReceived(request, env) {
  try {
    // 1. Parse email
    const emailData = await parseEmail(request);

    // 2. Extrair anexos XML
    const xmlAttachments = emailData.attachments.filter(
      att => att.filename.endsWith('.xml') ||
             att.contentType === 'application/xml'
    );

    if (xmlAttachments.length === 0) {
      return new Response('No XML attachments found', { status: 400 });
    }

    // 3. Processar cada XML
    const results = [];
    for (const attachment of xmlAttachments) {
      const result = await processNFeXML(attachment.content, env);
      results.push(result);
    }

    // 4. Salvar log
    await saveEmailLog(env.DB, {
      from: emailData.from,
      subject: emailData.subject,
      receivedAt: new Date().toISOString(),
      attachments: xmlAttachments.length,
      processed: results.length,
      status: 'success',
    });

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results: results,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing email:', error);

    await saveEmailLog(env.DB, {
      receivedAt: new Date().toISOString(),
      status: 'error',
      error: error.message,
    });

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

### 3. Parse do XML NFe

#### Estrutura do XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00">
  <NFe>
    <infNFe Id="NFe35251012345678000199550010000123451234567890">
      <!-- Identificação -->
      <ide>
        <cUF>35</cUF>
        <nNF>12345</nNF>
        <serie>1</serie>
        <dhEmi>2025-11-25T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>

      <!-- Emitente (fornecedor) -->
      <emit>
        <CNPJ>12345678000199</CNPJ>
        <xNome>FORNECEDOR LTDA</xNome>
        <xFant>Fornecedor</xFant>
      </emit>

      <!-- Destinatário -->
      <dest>
        <CNPJ>98765432000100</CNPJ>
        <xNome>PLANAC DISTRIBUIDORA</xNome>
      </dest>

      <!-- Produtos -->
      <det nItem="1">
        <prod>
          <cProd>FORN-001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>GUIA 48 BARBIERI Z275 0,50 X 3,00</xProd>
          <NCM>72166110</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>100.0000</qCom>
          <vUnCom>11.1000</vUnCom>
          <vProd>1110.00</vProd>
        </prod>

        <!-- Impostos -->
        <imposto>
          <ICMS>
            <ICMS60>
              <orig>0</orig>
              <CST>60</CST>
              <vBCSTRet>1610.00</vBCSTRet>
              <vICMSSTRet>289.80</vICMSSTRet>
            </ICMS60>
          </ICMS>
          <PIS>
            <PISNT>
              <CST>04</CST>
            </PISNT>
          </PIS>
          <COFINS>
            <COFINSNT>
              <CST>04</CST>
            </COFINSNT>
          </COFINS>
        </imposto>
      </det>

      <!-- Totais -->
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vBCST>1610.00</vBCST>
          <vST>289.80</vST>
          <vProd>1110.00</vProd>
          <vNF>1399.80</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>
```

#### Parser JavaScript

```javascript
async function processNFeXML(xmlContent, env) {
  // Parse XML (usando DOMParser ou similar)
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

  // Extrair dados principais
  const nfeData = extractNFeData(xmlDoc);

  // Salvar nota
  const invoiceId = await saveInvoice(env.DB, nfeData);

  // Processar cada produto
  const products = [];
  for (const item of nfeData.items) {
    const product = await processProduct(env.DB, item, invoiceId);
    products.push(product);
  }

  return {
    invoice: invoiceId,
    products: products.length,
    nfeNumber: nfeData.nfeNumber,
    supplier: nfeData.supplier.name,
    total: nfeData.total.nf,
  };
}

function extractNFeData(xmlDoc) {
  const infNFe = xmlDoc.querySelector('infNFe');
  const ide = infNFe.querySelector('ide');
  const emit = infNFe.querySelector('emit');
  const dest = infNFe.querySelector('dest');
  const total = infNFe.querySelector('total ICMSTot');

  // Dados da nota
  const nfeData = {
    chaveAcesso: infNFe.getAttribute('Id').replace('NFe', ''),
    nfeNumber: ide.querySelector('nNF').textContent,
    serie: ide.querySelector('serie').textContent,
    issueDate: ide.querySelector('dhEmi').textContent,
    type: ide.querySelector('tpNF').textContent,

    // Fornecedor
    supplier: {
      cnpj: emit.querySelector('CNPJ').textContent,
      name: emit.querySelector('xNome').textContent,
      tradeName: emit.querySelector('xFant')?.textContent,
    },

    // Destinatário
    recipient: {
      cnpj: dest.querySelector('CNPJ').textContent,
      name: dest.querySelector('xNome').textContent,
    },

    // Totais
    total: {
      products: parseFloat(total.querySelector('vProd').textContent),
      icms: parseFloat(total.querySelector('vICMS').textContent),
      st: parseFloat(total.querySelector('vST').textContent),
      nf: parseFloat(total.querySelector('vNF').textContent),
    },

    // Itens
    items: [],
  };

  // Extrair itens
  const detNodes = infNFe.querySelectorAll('det');
  for (const det of detNodes) {
    const item = extractItemData(det);
    nfeData.items.push(item);
  }

  return nfeData;
}

function extractItemData(detNode) {
  const prod = detNode.querySelector('prod');
  const imposto = detNode.querySelector('imposto');

  // Dados do produto
  const item = {
    supplierCode: prod.querySelector('cProd').textContent,
    ean: prod.querySelector('cEAN')?.textContent,
    description: prod.querySelector('xProd').textContent,
    ncm: prod.querySelector('NCM').textContent,
    cfop: prod.querySelector('CFOP').textContent,
    unit: prod.querySelector('uCom').textContent,
    quantity: parseFloat(prod.querySelector('qCom').textContent),
    unitPrice: parseFloat(prod.querySelector('vUnCom').textContent),
    totalPrice: parseFloat(prod.querySelector('vProd').textContent),
  };

  // Impostos
  item.taxes = extractTaxes(imposto);

  return item;
}

function extractTaxes(impostoNode) {
  const taxes = {};

  // ICMS
  const icmsNode = impostoNode.querySelector('ICMS')?.firstElementChild;
  if (icmsNode) {
    const cst = icmsNode.querySelector('CST')?.textContent;
    taxes.icms = {
      cst: cst,
      hasST: ['10', '30', '60', '70'].includes(cst),
      vBC: parseFloat(icmsNode.querySelector('vBC')?.textContent || 0),
      vICMS: parseFloat(icmsNode.querySelector('vICMS')?.textContent || 0),
      vBCST: parseFloat(icmsNode.querySelector('vBCSTRet')?.textContent || 0),
      vST: parseFloat(icmsNode.querySelector('vICMSSTRet')?.textContent || 0),
    };
  }

  // PIS
  const pisNode = impostoNode.querySelector('PIS')?.firstElementChild;
  if (pisNode) {
    taxes.pis = {
      cst: pisNode.querySelector('CST')?.textContent,
      vPIS: parseFloat(pisNode.querySelector('vPIS')?.textContent || 0),
    };
  }

  // COFINS
  const cofinsNode = impostoNode.querySelector('COFINS')?.firstElementChild;
  if (cofinsNode) {
    taxes.cofins = {
      cst: cofinsNode.querySelector('CST')?.textContent,
      vCOFINS: parseFloat(cofinsNode.querySelector('vCOFINS')?.textContent || 0),
    };
  }

  return taxes;
}
```

---

### 4. Salvamento no Banco

#### Salvar Nota Fiscal

```javascript
async function saveInvoice(db, nfeData) {
  // Verificar se já existe
  const existing = await db.prepare(`
    SELECT id FROM invoices WHERE chave_acesso = ?
  `).bind(nfeData.chaveAcesso).first();

  if (existing) {
    console.log('Invoice already exists:', nfeData.nfeNumber);
    return existing.id;
  }

  // Inserir nova nota
  const result = await db.prepare(`
    INSERT INTO invoices (
      chave_acesso,
      numero_nf,
      serie,
      data_emissao,
      fornecedor_cnpj,
      fornecedor_nome,
      valor_produtos,
      valor_icms,
      valor_st,
      valor_total,
      status,
      xml_content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processada', ?)
  `).bind(
    nfeData.chaveAcesso,
    nfeData.nfeNumber,
    nfeData.serie,
    nfeData.issueDate,
    nfeData.supplier.cnpj,
    nfeData.supplier.name,
    nfeData.total.products,
    nfeData.total.icms,
    nfeData.total.st,
    nfeData.total.nf,
    '' // XML content (opcional)
  ).run();

  return result.meta.last_row_id;
}
```

#### Processar Produto

```javascript
async function processProduct(db, item, invoiceId) {
  // 1. Buscar produto existente
  let product = await findProduct(db, item);

  if (product) {
    // Produto existe - Atualizar custo
    await updateProductCost(db, product.id, item, invoiceId);
    return { action: 'updated', productId: product.id };

  } else {
    // Produto novo - Criar
    const newProductId = await createProduct(db, item, invoiceId);
    return { action: 'created', productId: newProductId };
  }
}

async function findProduct(db, item) {
  // Buscar por NCM + descrição similar
  const result = await db.prepare(`
    SELECT * FROM products
    WHERE ncm = ?
      AND (
        LOWER(name) LIKE LOWER(?) OR
        LOWER(name) LIKE LOWER(?)
      )
    LIMIT 1
  `).bind(
    item.ncm,
    '%' + item.description.substring(0, 30) + '%',
    '%' + extractKeywords(item.description) + '%'
  ).first();

  return result;
}

async function createProduct(db, item, invoiceId) {
  // Gerar novo código
  const lastCode = await db.prepare(`
    SELECT code FROM products ORDER BY code DESC LIMIT 1
  `).first();

  const newCode = generateNextCode(lastCode?.code || '000000');

  // Padronizar nome
  const standardName = standardizeProductName(item.description);

  // Identificar ST
  const hasST = item.taxes.icms?.hasST ? 1 : 0;

  // Identificar grupo
  const groupId = await identifyProductGroup(db, item);

  // Inserir produto
  const result = await db.prepare(`
    INSERT INTO products (
      code,
      name,
      ncm,
      unit,
      cost,
      hasST,
      active,
      group_id,
      supplier_code,
      last_purchase_date,
      last_invoice_id
    ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'), ?)
  `).bind(
    newCode,
    standardName,
    item.ncm,
    item.unit,
    item.unitPrice,
    hasST,
    groupId,
    item.supplierCode,
    invoiceId
  ).run();

  const productId = result.meta.last_row_id;

  // Registrar histórico
  await saveInitialCostHistory(db, productId, item, invoiceId);

  // Aplicar tags automáticas
  await applyAutoTags(db, productId, item);

  return productId;
}

async function updateProductCost(db, productId, item, invoiceId) {
  // Buscar custo atual
  const current = await db.prepare(`
    SELECT cost FROM products WHERE id = ?
  `).bind(productId).first();

  const oldCost = current.cost;
  const newCost = item.unitPrice;

  // Só atualizar se mudou
  if (Math.abs(newCost - oldCost) > 0.01) {
    // Atualizar custo
    await db.prepare(`
      UPDATE products
      SET cost = ?,
          last_purchase_date = datetime('now'),
          last_invoice_id = ?
      WHERE id = ?
    `).bind(newCost, invoiceId, productId).run();

    // Registrar histórico
    await db.prepare(`
      INSERT INTO product_cost_history (
        product_id,
        old_cost,
        new_cost,
        invoice_id,
        change_reason
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      productId,
      oldCost,
      newCost,
      invoiceId,
      `Atualização via NFe - ${((newCost - oldCost) / oldCost * 100).toFixed(2)}%`
    ).run();
  }
}
```

---

### 5. Padronização Automática

#### Normalização de Nomes

```javascript
function standardizeProductName(rawName) {
  let name = rawName.toUpperCase().trim();

  // Remover caracteres especiais
  name = name.replace(/[^A-Z0-9\s.,\-\/]/g, '');

  // Substituições comuns
  const replacements = {
    'GALVANIZADO': 'Z275',
    'GALVANIZ.': 'Z275',
    'BARR.': '',
    'BARRAS': '',
    'MT': '',
    'METROS': '',
    ' M ': ' ',
    'C/': '',
  };

  for (const [old, novo] of Object.entries(replacements)) {
    name = name.replace(new RegExp(old, 'g'), novo);
  }

  // Padronizar dimensões (1.20 → 1,20)
  name = name.replace(/(\d+)\.(\d+)/g, '$1,$2');

  // Limpar espaços múltiplos
  name = name.replace(/\s+/g, ' ').trim();

  return name;
}

function extractKeywords(description) {
  // Extrair palavras-chave principais
  const keywords = [
    'MONTANTE', 'GUIA', 'CANTONEIRA', 'TABICA', 'TRAVESSA',
    'CHAPA', 'GESSO', 'CIMENTICIA', 'OSB',
    'FORRO', 'PVC', 'GEMINADO',
    'PORTA', 'MARCO', 'BATENTE',
    'PARAFUSO', 'BUCHA', 'PREGO',
    'MASSA', 'FITA', 'RODAPE',
    'BARBIERI', 'BELKA', 'PLASBIL', 'STEEL',
  ];

  const found = keywords.filter(kw =>
    description.toUpperCase().includes(kw)
  );

  return found.join(' ');
}
```

#### Identificação de Grupo

```javascript
async function identifyProductGroup(db, item) {
  const name = item.description.toUpperCase();
  const ncm = item.ncm;

  // Regras por NCM
  const ncmGroups = {
    '72166110': 1, // Perfis Metálicos
    '72166190': 1,
    '68091100': 2, // Chapas e Placas
    '68091900': 2,
    '68118200': 2,
    '39162000': 3, // Forros
    '73181400': 6, // Fixadores
    '73181200': 6,
    '32141010': 7, // Acabamentos
  };

  if (ncmGroups[ncm]) {
    return ncmGroups[ncm];
  }

  // Regras por palavra-chave
  const keywords = {
    1: ['MONTANTE', 'GUIA', 'CANTONEIRA', 'TABICA', 'TRAVESSA', 'PERFIL'],
    2: ['CHAPA', 'PLACA', 'OSB', 'COMPENSADO'],
    3: ['FORRO'],
    4: ['PORTA', 'MARCO', 'BATENTE', 'KIT PORTA'],
    5: ['FECHADURA', 'DOBRADICA', 'PUXADOR'],
    6: ['PARAFUSO', 'BUCHA', 'PREGO', 'ARAME'],
    7: ['MASSA', 'FITA', 'RODAPE', 'CANTONEIRA PVC'],
    8: ['ISOLANTE', 'IMPERMEABILIZANTE', 'ADESIVO'],
  };

  for (const [groupId, words] of Object.entries(keywords)) {
    if (words.some(word => name.includes(word))) {
      return parseInt(groupId);
    }
  }

  // Grupo padrão: Materiais Gerais
  return 8;
}
```

#### Tags Automáticas

```javascript
async function applyAutoTags(db, productId, item) {
  const tags = [];
  const name = item.description.toUpperCase();

  // Tags de marca
  const brands = ['BARBIERI', 'BELKA', 'PLASBIL', 'STEEL', 'DRYBOX', 'G-DOOR'];
  for (const brand of brands) {
    if (name.includes(brand)) {
      tags.push(brand);
    }
  }

  // Tags de característica
  if (name.includes('RU') || name.includes('RESISTENTE UMIDADE')) {
    tags.push('RESISTENTE_UMIDADE');
  }
  if (name.includes('RF') || name.includes('RESISTENTE FOGO')) {
    tags.push('RESISTENTE_FOGO');
  }
  if (name.includes('GALVANIZADO') || name.includes('Z120') || name.includes('Z275')) {
    tags.push('GALVANIZADO');
  }

  // Tags de aplicação
  if (name.includes('DRYWALL')) tags.push('DRYWALL');
  if (name.includes('STEEL FRAME')) tags.push('STEEL_FRAME');
  if (name.includes('FORRO')) tags.push('FORRO');

  // Salvar tags
  for (const tagName of tags) {
    // Buscar ou criar tag
    let tag = await db.prepare(`
      SELECT id FROM product_tags WHERE name = ?
    `).bind(tagName).first();

    if (!tag) {
      const result = await db.prepare(`
        INSERT INTO product_tags (name, category)
        VALUES (?, 'auto')
      `).bind(tagName).run();
      tag = { id: result.meta.last_row_id };
    }

    // Associar tag ao produto
    await db.prepare(`
      INSERT OR IGNORE INTO product_tag_assignments (product_id, tag_id)
      VALUES (?, ?)
    `).bind(productId, tag.id).run();
  }
}
```

---

### 6. Logs e Monitoramento

#### Tabela de Logs

```sql
CREATE TABLE email_processing_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_from TEXT,
  email_subject TEXT,
  received_at TEXT,
  attachments_count INTEGER,
  processed_count INTEGER,
  status TEXT,
  error_message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Dashboard de Processamento

```sql
-- Últimos emails processados
SELECT
  email_from,
  email_subject,
  attachments_count,
  processed_count,
  status,
  received_at
FROM email_processing_log
ORDER BY created_at DESC
LIMIT 50;

-- Estatísticas do dia
SELECT
  COUNT(*) as total_emails,
  SUM(attachments_count) as total_xmls,
  SUM(processed_count) as total_processados,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as sucessos,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as erros
FROM email_processing_log
WHERE DATE(created_at) = DATE('now');
```

---

## 🚨 Tratamento de Erros

### Erros Comuns

```javascript
const errorHandlers = {
  // XML malformado
  'XML_PARSE_ERROR': async (error, db) => {
    await saveErrorLog(db, {
      type: 'XML_PARSE_ERROR',
      message: error.message,
      action: 'Verificar formato do XML',
    });
    return { success: false, error: 'XML inválido' };
  },

  // Produto duplicado
  'DUPLICATE_PRODUCT': async (product, db) => {
    console.log('Produto já existe:', product.code);
    return { success: true, action: 'skipped' };
  },

  // NCM inválido
  'INVALID_NCM': async (item, db) => {
    await saveErrorLog(db, {
      type: 'INVALID_NCM',
      message: `NCM inválido: ${item.ncm}`,
      product: item.description,
    });
    // Usar NCM genérico
    item.ncm = '00000000';
    return { success: true, warning: 'NCM genérico aplicado' };
  },

  // Grupo não identificado
  'GROUP_NOT_FOUND': async (item, db) => {
    // Usar grupo padrão (Materiais Gerais)
    return 8;
  },
};
```

### Retry Logic

```javascript
async function processWithRetry(fn, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Tentativa ${i + 1} falhou:`, error.message);

      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError;
}
```

---

## 📊 Métricas e Estatísticas

### Produtos Importados por Período

```sql
SELECT
  DATE(created_at) as data,
  COUNT(*) as produtos_novos,
  COUNT(DISTINCT group_id) as grupos_diferentes
FROM products
WHERE created_at >= DATE('now', '-30 days')
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### Notas Processadas

```sql
SELECT
  fornecedor_nome,
  COUNT(*) as total_notas,
  SUM(valor_total) as valor_total,
  AVG(valor_total) as valor_medio
FROM invoices
WHERE data_emissao >= DATE('now', '-90 days')
GROUP BY fornecedor_nome
ORDER BY total_notas DESC;
```

### Taxa de Sucesso

```sql
SELECT
  ROUND(
    CAST(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS FLOAT) /
    COUNT(*) * 100,
    2
  ) as taxa_sucesso_percent
FROM email_processing_log
WHERE created_at >= DATE('now', '-7 days');
```

---

## ✅ Checklist Operacional

### Diário

```
[ ] Verificar emails processados hoje
[ ] Conferir logs de erro
[ ] Validar produtos novos criados
[ ] Revisar custos atualizados
```

### Semanal

```
[ ] Analisar taxa de sucesso de processamento
[ ] Revisar produtos sem grupo
[ ] Validar NCMs dos novos produtos
[ ] Conferir fornecedores ativos
```

### Mensal

```
[ ] Estatísticas de importação
[ ] Revisão de produtos criados
[ ] Otimização de regras de classificação
[ ] Backup de XMLs processados
```

---

## 🔧 Comandos Úteis

### Cloudflare Wrangler

```bash
# Deploy worker
npx wrangler deploy

# Ver logs em tempo real
npx wrangler tail

# Executar localmente
npx wrangler dev

# Consultar banco D1
npx wrangler d1 execute Precificacao-Sistema --command "SELECT COUNT(*) FROM products"

# Listar databases
npx wrangler d1 list
```

### Teste Manual

```bash
# Simular recebimento de email
curl -X POST https://precplanac.planacacabamentos.workers.dev/email \
  -H "Content-Type: application/xml" \
  -d @nota-fiscal.xml
```

---

## 📖 Referências

### Documentação Oficial

- [NFe - Layout XML](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w=)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Email Routing](https://developers.cloudflare.com/email-routing/)

### Ferramentas

- [Validador NFe Online](https://www.nfe.fazenda.gov.br/portal/consulta.aspx)
- [Consulta NCM](https://portalunico.siscomex.gov.br/classif/)

---

**Última Atualização:** 25/11/2025
**Versão:** 1.0
**Responsável:** Desenvolvimento PLANAC
