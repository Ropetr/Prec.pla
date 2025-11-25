# 🏗️ Arquitetura e Workflow Completo - PLANAC

**Sistema de Precificação Inteligente com Importação Automática de NFe**

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Fluxo Completo do Sistema](#fluxo-completo-do-sistema)
3. [Módulo 1: Importação de Notas Fiscais](#módulo-1-importação-de-notas-fiscais)
4. [Módulo 2: Gestão de Produtos](#módulo-2-gestão-de-produtos)
5. [Módulo 3: Sistema de Precificação](#módulo-3-sistema-de-precificação)
6. [Módulo 4: Tags e Categorias](#módulo-4-tags-e-categorias)
7. [Módulo 5: Créditos de Impostos](#módulo-5-créditos-de-impostos)
8. [APIs e Integrações](#apis-e-integrações)
9. [Banco de Dados](#banco-de-dados)
10. [Casos de Uso](#casos-de-uso)

---

## 🎯 Visão Geral da Arquitetura

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │ Email Routing│─────>│   Worker.js  │────>│ D1 SQLite│ │
│  │  (Hostinger) │      │  (Backend)   │      │ Database │ │
│  └──────────────┘      └──────┬───────┘      └─────┬────┘ │
│                                │                     │       │
│                                ▼                     │       │
│                        ┌──────────────┐             │       │
│                        │   REST API   │◄────────────┘       │
│                        └──────┬───────┘                     │
│                                │                             │
└────────────────────────────────┼─────────────────────────────┘
                                 │
                                 ▼
                        ┌──────────────┐
                        │   Frontend   │
                        │  (React/Vue) │
                        └──────────────┘
```

### Componentes Principais

| Componente | Tecnologia | Função |
|------------|------------|--------|
| **Backend** | Cloudflare Workers | Lógica de negócio, APIs, processamento |
| **Database** | Cloudflare D1 (SQLite) | Armazenamento persistente |
| **Email Handler** | Email Routing | Recepção automática de NFe |
| **Parser NFe** | JavaScript (Worker) | Extração de dados do XML |
| **Calculator** | JavaScript (Worker) | Simulação de preços em tempo real |
| **CLI** | Wrangler 4.50.0 | Deploy e gerenciamento |

---

## 🔄 Fluxo Completo do Sistema

### Visão Macro

```
┌─────────────────────────────────────────────────────────────┐
│                      FLUXO GERAL DO SISTEMA                 │
└─────────────────────────────────────────────────────────────┘

1️⃣ IMPORTAÇÃO                2️⃣ PROCESSAMENTO           3️⃣ USO
┌──────────────┐            ┌──────────────┐         ┌────────────┐
│ Nota Fiscal  │            │              │         │            │
│ (Email/XML)  │───────────>│  Parse XML   │────────>│  Produtos  │
└──────────────┘            │  + Validação │         │  no Banco  │
                            └──────────────┘         └─────┬──────┘
                                                            │
                                                            ▼
                            ┌──────────────┐         ┌────────────┐
                            │ Atualização  │<────────│ Custo Novo │
                            │   de Custo   │         │  vs Atual  │
                            └──────────────┘         └────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Histórico   │
                            │  de Custos   │
                            └──────────────┘

4️⃣ PRECIFICAÇÃO              5️⃣ ANÁLISE                6️⃣ GESTÃO
┌──────────────┐            ┌──────────────┐         ┌────────────┐
│              │            │              │         │            │
│  Simulador   │───────────>│  Margem em   │────────>│  Decisão   │
│  de Preços   │            │  Tempo Real  │         │  Comercial │
└──────────────┘            └──────────────┘         └────────────┘
      │                             │                       │
      │ Impostos ST/ICMS            │ Lucro Real?          │ Tags
      │ Margem X ou Y               │ Competitivo?         │ Categorias
      │ CFOP/UF                     │ Alertas?             │ Relatórios
      ▼                             ▼                       ▼
```

---

## 📥 Módulo 1: Importação de Notas Fiscais

### 1.1 Recebimento de Email

**Emails Monitorados:**
- `financeiro@planacdivisorias.com.br` (Entrada)
- `marco@planacdivisorias.com.br` (Entrada)
- `rodrigo@planacdivisorias.com.br` (Entrada)
- `compras@planacdistribuidora.com.br` (Entrada) ✨ **NOVO**
- `planacnotaseboletos@planacdivisorias.com.br` (Saída)

**Fluxo de Email:**

```
┌─────────────────────────────────────────────────────────┐
│ 1. FORNECEDOR ENVIA EMAIL COM XML                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 2. HOSTINGER RECEBE EMAIL                               │
│    - Servidor IMAP: imap.hostinger.com:993              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 3. CLOUDFLARE EMAIL ROUTING                             │
│    - Encaminha para Worker automaticamente              │
│    - Trigger: email() handler                           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 4. WORKER PROCESSA                                      │
│    - Identifica tipo (entrada/saída)                    │
│    - Extrai anexos XML                                  │
│    - Para cada XML: parseNFeXML()                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 5. SALVA NO BANCO                                       │
│    - Tabela: invoices                                   │
│    - Tabela: invoice_items                              │
│    - Tabela: products (atualiza/cria)                   │
│    - Tabela: product_cost_history                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 6. LOG E CONFIRMAÇÃO                                    │
│    - email_processing_log                               │
│    - Email de confirmação (opcional)                    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Parse do XML NFe

**Dados Extraídos:**

```javascript
// Identificação da Nota
{
  nNF: "12345",              // Número da nota
  serie: "1",                // Série
  dhEmi: "2025-11-25T10:30", // Data/hora emissão
  natOp: "Venda",            // Natureza da operação
  CFOP: "5102",              // CFOP principal

  // Emitente (Fornecedor em entrada)
  emit_cnpj: "12.345.678/0001-99",
  emit_nome: "FORNECEDOR LTDA",

  // Destinatário (PLANAC em entrada)
  dest_cnpj: "98.765.432/0001-00",
  dest_nome: "PLANAC DISTRIBUIDORA",

  // Totais da Nota
  vNF: 1500.00,       // Valor total
  vProd: 1200.00,     // Valor produtos
  vICMS: 180.00,      // ICMS
  vST: 120.00,        // Substituição tributária
  vPIS: 19.80,        // PIS
  vCOFINS: 91.20,     // COFINS
  vFrete: 50.00,      // Frete
  vDesc: 0.00,        // Desconto

  // Produtos (array)
  produtos: [...]
}
```

**Dados de Cada Produto:**

```javascript
{
  cProd: "FORN-001",          // Código do fornecedor
  xProd: "GUIA 48 BARBIERI Z275 0,50 X 3,00", // Descrição
  NCM: "72166110",            // NCM
  CFOP: "5102",               // CFOP do item
  uCom: "UN",                 // Unidade
  qCom: 100,                  // Quantidade
  vUnCom: 11.10,              // Valor unitário
  vProd: 1110.00,             // Valor total

  // Impostos ICMS
  CST: "60",                  // Código ST
  vBC: 1110.00,               // Base cálculo
  pICMS: 18,                  // % ICMS
  vICMS: 0,                   // Valor ICMS (0 se ST)

  // Substituição Tributária
  vBCST: 1610.00,             // Base cálculo ST
  pICMSST: 18,                // % ICMS ST
  vICMSST: 289.80,            // Valor ST
  pMVAST: 45                  // MVA %
}
```

### 1.3 Identificação de Tipo de Nota

**Lógica de Classificação:**

```javascript
// Por destinatário do email
if (email.includes('nfe-compra') ||
    email.includes('compras@') ||
    email.includes('financeiro') ||
    email.includes('marco') ||
    email.includes('rodrigo')) {
  type = 'entrada';  // Nota de compra
}

// Por CFOP (fallback)
if (CFOP.startsWith('1') || CFOP.startsWith('2')) {
  type = 'entrada';  // 1xxx = interno entrada, 2xxx = interestadual entrada
} else if (CFOP.startsWith('5') || CFOP.startsWith('6')) {
  type = 'saida';    // 5xxx = interno saída, 6xxx = interestadual saída
}
```

**CFOPs Comuns:**

| CFOP | Descrição | Tipo |
|------|-----------|------|
| 1102 | Compra interna | Entrada |
| 1403 | Compra com ST | Entrada |
| 2102 | Compra interestadual | Entrada |
| 2403 | Compra interestadual com ST | Entrada |
| 5102 | Venda interna | Saída |
| 5405 | Venda com ST | Saída |
| 6102 | Venda interestadual | Saída |

---

## 🗄️ Módulo 2: Gestão de Produtos

### 2.1 Correspondência de Produtos

**Problema:** Nome na NFe ≠ Nome no sistema

**Estratégia de Matching:**

```javascript
// 1. Buscar por NCM (mais confiável)
const byNCM = await DB.prepare(
  'SELECT * FROM products WHERE ncm = ?'
).bind(produto.NCM).first();

// 2. Buscar por código do fornecedor
const byCode = await DB.prepare(
  'SELECT * FROM products WHERE product_code = ?'
).bind(produto.cProd).first();

// 3. Buscar por nome similar (fuzzy match)
const byName = await DB.prepare(`
  SELECT * FROM products
  WHERE ncm = ?
  AND (
    LOWER(name) LIKE LOWER(?) OR
    LOWER(name) LIKE LOWER(?)
  )
  LIMIT 1
`).bind(
  produto.NCM,
  '%' + extractKeywords(produto.xProd) + '%',
  '%' + produto.xProd.substring(0, 30) + '%'
).first();

// 4. Decisão
const product = byNCM || byCode || byName || null;
```

**Extração de Palavras-Chave:**

```javascript
function extractKeywords(description) {
  const keywords = [
    'MONTANTE', 'GUIA', 'CANTONEIRA', 'TABICA',
    'CHAPA', 'GESSO', 'FORRO', 'PVC', 'PORTA',
    'PARAFUSO', 'BUCHA', 'MASSA', 'FITA',
    'BARBIERI', 'BELKA', 'PLASBIL', 'STEEL'
  ];

  const found = keywords.filter(kw =>
    description.toUpperCase().includes(kw)
  );

  return found.join(' ');
}
```

### 2.2 Atualização de Custo

**Fluxo de Atualização:**

```
┌─────────────────────────────────────────────────────────┐
│ PRODUTO ENCONTRADO?                                     │
└────┬─────────────────────────────────────────────┬──────┘
     │ SIM                                          │ NÃO
     ▼                                              ▼
┌─────────────────┐                        ┌──────────────┐
│ Atualizar Custo │                        │ Criar Produto│
└────────┬────────┘                        └──────┬───────┘
         │                                         │
         ▼                                         ▼
┌─────────────────┐                        ┌──────────────┐
│ Calcular Média  │                        │ Gerar Código │
│ Ponderada:      │                        │ (000XXX)     │
│                 │                        └──────┬───────┘
│ oldCost = 10.00 │                               │
│ newCost = 11.10 │                               ▼
│ avgCost = 10.55 │                        ┌──────────────┐
└────────┬────────┘                        │ Padronizar   │
         │                                  │ Nome         │
         ▼                                  └──────┬───────┘
┌─────────────────┐                               │
│ Salvar Histórico│                               ▼
│                 │                        ┌──────────────┐
│ product_cost_   │<───────────────────────│ Classificar  │
│ history:        │                        │ (Grupo+Tags) │
│                 │                        └──────┬───────┘
│ old: 10.00      │                               │
│ new: 10.55      │                               ▼
│ +5.5%           │                        ┌──────────────┐
└─────────────────┘                        │ Salvar       │
                                           └──────────────┘
```

**SQL - Atualizar Produto Existente:**

```sql
-- 1. Ler custo atual
SELECT cost FROM products WHERE id = ?;

-- 2. Calcular média ponderada
-- avgCost = (currentCost + newCost) / 2

-- 3. Atualizar produto
UPDATE products
SET cost = ?,                          -- Custo médio
    last_purchase_date = CURRENT_TIMESTAMP,
    last_purchase_value = ?            -- Último valor pago
WHERE id = ?;

-- 4. Registrar histórico
INSERT INTO product_cost_history (
  product_id, old_cost, new_cost,
  invoice_number, supplier, change_reason
) VALUES (?, ?, ?, ?, ?, ?);
```

**SQL - Criar Produto Novo:**

```sql
-- 1. Gerar código sequencial
SELECT code FROM products ORDER BY code DESC LIMIT 1;
-- Resultado: 000231
-- Novo: 000232

-- 2. Inserir produto
INSERT INTO products (
  code, name, ncm, unit, cost,
  hasST, active, group_id, created_at
) VALUES (
  '000232',
  'GUIA 48 BARBIERI Z275 0,50 X 3,00',
  '72166110',
  'UN',
  11.10,
  1,  -- tem ST
  1,  -- ativo
  1,  -- Perfis Metálicos
  datetime('now')
);

-- 3. Registrar histórico inicial
INSERT INTO product_cost_history (
  product_id, old_cost, new_cost,
  invoice_number, supplier, change_reason
) VALUES (
  232,  -- ID do produto
  0,
  11.10,
  '0000027449',
  'FORNECEDOR BARBIERI',
  'Cadastro inicial via NFe'
);
```

### 2.3 Classificação Automática

**Por NCM:**

```javascript
const ncmToGroup = {
  '72166110': { group_id: 1, tags: ['METAL', 'ACO_GALVANIZADO'] },
  '68091100': { group_id: 2, tags: ['GESSO', 'DRYWALL'] },
  '39162000': { group_id: 3, tags: ['PVC', 'FORRO'] },
  '73181400': { group_id: 6, tags: ['METAL', 'PARAFUSO'] },
  // ... mais NCMs
};
```

**Por Nome:**

```javascript
const namePatterns = {
  'BARBIERI': { tags: ['BARBIERI'] },
  'BELKA': { tags: ['BELKA'] },
  'MONTANTE': { group_id: 1, tags: ['DRYWALL', 'STEEL_FRAME'] },
  'GUIA': { group_id: 1, tags: ['DRYWALL', 'STEEL_FRAME'] },
  'CHAPA GESSO': { group_id: 2, tags: ['GESSO', 'DRYWALL'] },
  'FORRO PVC': { group_id: 3, tags: ['PVC', 'FORRO'] },
  'RU': { tags: ['RESISTENTE_UMIDADE'] },
  'RF': { tags: ['RESISTENTE_FOGO'] },
  'Z120': { tags: ['GALVANIZADO'] },
  'Z275': { tags: ['GALVANIZADO'] },
};
```

---

## 💰 Módulo 3: Sistema de Precificação

### 3.1 Calculadora de Preços em Tempo Real

**Endpoint:** `POST /api/pricing/calculate`

**Input:**

```javascript
{
  "productCode": "000095",
  "operation": "5102",     // CFOP
  "uf": "SP",              // UF destino
  "clientType": "pf",      // pf = pessoa física, pj = jurídica
  "margin": 30             // Margem desejada (%)
}
```

**Output:**

```javascript
{
  "product": {
    "code": "000095",
    "name": "GUIA 48 BARBIERI Z275 0,50 X 3,00",
    "cost": 11.10
  },
  "calculation": {
    "cost": "11.10",
    "margin": "30.00",
    "basePrice": "14.43",
    "icms": "0.00",         // 0 porque tem ST
    "st": "0.00",           // Já foi pago na compra
    "difal": "0.00",        // Venda interna (SP → SP)
    "pis": "0.24",
    "cofins": "1.10",
    "finalPrice": "15.77"
  },
  "taxes": {
    "icmsRate": "12.00",
    "mvaRate": "45.00",
    "difalRate": "0.00",
    "hasST": true
  },
  "profitAnalysis": {
    "grossProfit": "4.67",      // 15.77 - 11.10
    "grossMargin": "29.6%",     // (15.77 - 11.10) / 15.77
    "netProfit": "3.33",        // Descontando impostos
    "netMargin": "21.1%",       // Margem líquida real
    "isViable": true,           // netMargin >= min_margin
    "minPriceRecommended": "14.00"
  }
}
```

### 3.2 Fórmula de Cálculo

**Para produtos COM ST:**

```javascript
// 1. Base
basePrice = cost / (1 - expenses - taxes - margin);

// Onde:
expenses = 0.32;   // 32% (aluguel, pessoal, etc)
taxes = 0.0925;    // 9.25% (PIS 0.65% + COFINS 3% + outros 5.6%)
margin = 0.30;     // 30% (margem desejada)

// 2. Cálculo
basePrice = 11.10 / (1 - 0.32 - 0.0925 - 0.30);
basePrice = 11.10 / 0.2875;
basePrice = 38.61;

// 3. Impostos sobre venda
pis = basePrice * 0.0165;       // 1.65%
cofins = basePrice * 0.076;     // 7.6%
icms = 0;                        // ST já pago
st = 0;                          // ST já pago

// 4. Preço final
finalPrice = basePrice + pis + cofins;
finalPrice = 38.61 + 0.64 + 2.93;
finalPrice = 42.18;

// 5. Análise de lucro
grossProfit = finalPrice - cost;
grossProfit = 42.18 - 11.10 = 31.08;
grossMargin = grossProfit / finalPrice;
grossMargin = 31.08 / 42.18 = 73.7%;

netProfit = grossProfit - (pis + cofins);
netProfit = 31.08 - 3.57 = 27.51;
netMargin = netProfit / finalPrice;
netMargin = 27.51 / 42.18 = 65.2%;
```

**Para produtos SEM ST:**

```javascript
// Despesas: 32%
// Impostos: 21.25% (ICMS 12% + PIS 1.65% + COFINS 7.6%)
// Margem: 30%

basePrice = cost / (1 - 0.32 - 0.2125 - 0.30);
basePrice = cost / 0.1675;
basePrice = cost * 5.97;

// Exemplo: cost = 50.00
basePrice = 50.00 * 5.97 = 298.50;

// Impostos
icms = 298.50 * 0.12 = 35.82;
pis = 298.50 * 0.0165 = 4.93;
cofins = 298.50 * 0.076 = 22.69;

finalPrice = 298.50 + 35.82 + 4.93 + 22.69 = 361.94;
```

### 3.3 Simulador Interativo

**Interface do Usuário:**

```
┌────────────────────────────────────────────────────────┐
│ SIMULADOR DE PRECIFICAÇÃO                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Produto: [000095 - GUIA 48 BARBIERI...]  [Buscar]     │
│                                                        │
│ Custo Atual: R$ 11,10  (atualizado em 20/11/2025)     │
│                                                        │
│ ┌────────────────────────────────────────────────┐   │
│ │ MARGEM                                         │   │
│ │ ───────────────■──────────────────────         │   │
│ │  0%         30%                    100%        │   │
│ │                                                │   │
│ │ Preço Sugerido: R$ 42,18                      │   │
│ └────────────────────────────────────────────────┘   │
│                                                        │
│ Operação:                                              │
│ ○ Venda Interna (MG)                                   │
│ ○ Venda Interestadual   UF: [SP ▼]                    │
│                                                        │
│ Cliente:                                               │
│ ○ Pessoa Física   ○ Pessoa Jurídica                   │
│                                                        │
│ ┌────────────────────────────────────────────────┐   │
│ │ RESULTADO DA SIMULAÇÃO                         │   │
│ ├────────────────────────────────────────────────┤   │
│ │ Preço Base:              R$ 38,61              │   │
│ │ PIS (1.65%):             R$  0,64              │   │
│ │ COFINS (7.6%):           R$  2,93              │   │
│ │ ICMS (0% - ST):          R$  0,00  ✓           │   │
│ │ ───────────────────────────────────            │   │
│ │ PREÇO FINAL:             R$ 42,18              │   │
│ │                                                │   │
│ │ 💰 Lucro Bruto:          R$ 31,08 (73.7%)      │   │
│ │ 💵 Lucro Líquido:        R$ 27,51 (65.2%)      │   │
│ │                                                │   │
│ │ ✅ MARGEM VIÁVEL (mínimo 25%)                  │   │
│ └────────────────────────────────────────────────┘   │
│                                                        │
│ [ Salvar Preço ]  [ Nova Simulação ]  [ Histórico]    │
└────────────────────────────────────────────────────────┘
```

### 3.4 Alertas em Tempo Real

**Sistema de Alertas:**

```javascript
const alerts = [];

// 1. Margem abaixo do mínimo
if (netMargin < product.group.min_margin) {
  alerts.push({
    level: 'danger',
    message: `⚠️ Margem abaixo do mínimo (${product.group.min_margin}%)`,
    recommendation: `Aumentar para R$ ${minViablePrice.toFixed(2)}`
  });
}

// 2. Margem ótima
if (netMargin >= product.group.min_margin &&
    netMargin <= product.group.max_margin) {
  alerts.push({
    level: 'success',
    message: '✅ Margem dentro do ideal'
  });
}

// 3. Preço não competitivo
if (finalPrice > marketAvgPrice * 1.15) {
  alerts.push({
    level: 'warning',
    message: '📊 Preço 15% acima da média do mercado',
    recommendation: 'Considerar reduzir margem para competitividade'
  });
}

// 4. ST não aplicada corretamente
if (product.hasST && icmsValue > 0) {
  alerts.push({
    level: 'error',
    message: '❌ Produto com ST não deve ter ICMS na venda',
    recommendation: 'Verificar flag hasST no cadastro'
  });
}
```

---

## 🏷️ Módulo 4: Tags e Categorias

### 4.1 Sistema de Grupos (Categorias)

**Estrutura Hierárquica:**

```
product_groups
├── id
├── name
├── description
├── min_margin        ← Margem mínima recomendada
├── max_margin        ← Margem máxima recomendada
├── parent_group_id   ← Para subgrupos
├── active
├── created_at
└── updated_at
```

**Exemplo de Hierarquia:**

```
Perfis Metálicos (id: 1)
├── min_margin: 25%
├── max_margin: 50%
├── Subgrupos:
    ├── Perfis Barbieri (parent: 1)
    ├── Perfis Steel (parent: 1)
    └── Perfis T Modular (parent: 1)

Chapas e Placas (id: 2)
├── min_margin: 20%
├── max_margin: 40%
├── Subgrupos:
    ├── Chapas Standard (parent: 2)
    ├── Chapas RU (parent: 2)
    └── Chapas RF (parent: 2)
```

**APIs de Grupos:**

```javascript
// Listar grupos principais
GET /api/groups
// Response: [ { id, name, product_count, avg_cost, ... } ]

// Criar grupo
POST /api/groups
{
  "name": "Forros Especiais",
  "description": "Forros com características especiais",
  "min_margin": 35,
  "max_margin": 70,
  "parent_group_id": 3  // Opcional
}

// Atualizar grupo
PUT /api/groups
{
  "id": 15,
  "name": "Forros Madeira",
  "min_margin": 40,
  "max_margin": 80
}

// Deletar grupo
DELETE /api/groups?id=15

// Listar subgrupos
GET /api/groups/subgroups?parent=1
```

### 4.2 Sistema de Tags

**Estrutura:**

```
product_tags
├── id
├── name              ← Nome único (ex: BARBIERI)
├── color             ← Cor hex (ex: #1E40AF)
├── description       ← Descrição (ex: Marca - Perfis)
└── created_at

product_tags_relation
├── product_id        ← FK para products
├── tag_id            ← FK para product_tags
├── created_at
└── PRIMARY KEY (product_id, tag_id)
```

**Categorias de Tags:**

| Categoria | Exemplos | Cor |
|-----------|----------|-----|
| **Marca** | BARBIERI, BELKA, STEEL | Azul (#1E40AF) |
| **Material** | METAL, PVC, GESSO | Verde (#15803D) |
| **Aplicação** | DRYWALL, STEEL_FRAME | Roxo (#6B21A8) |
| **Característica** | RU, RF, GALVANIZADO | Laranja (#C2410C) |
| **Performance** | ALTO_GIRO, ESTRATEGICO | Verde/Amarelo |

**APIs de Tags:**

```javascript
// Listar todas tags
GET /api/tags
// Response: [ { id, name, color, description, product_count } ]

// Criar tag
POST /api/tags
{
  "name": "KNAUF",
  "color": "#1E40AF",
  "description": "Marca - Gesso"
}

// Deletar tag
DELETE /api/tags?id=25

// Listar tags de um produto
GET /api/products/tags?product_id=67

// Adicionar tag a produto
POST /api/products/tags
{
  "product_id": 67,
  "tag_id": 13
}

// Remover tag de produto
DELETE /api/products/tags
{
  "product_id": 67,
  "tag_id": 13
}
```

### 4.3 Filtros e Buscas

**Busca Avançada:**

```javascript
// Produtos por grupo
GET /api/products?group=1
// Retorna: Todos produtos do grupo 1 (Perfis Metálicos)

// Produtos por tag
GET /api/products?tag=BARBIERI
// Retorna: Todos produtos com tag BARBIERI

// Busca textual + grupo
GET /api/products?search=GUIA&group=1
// Retorna: Produtos com "GUIA" no nome do grupo 1

// Múltiplas tags (AND)
GET /api/products?tags=BARBIERI,GALVANIZADO
// Retorna: Produtos que têm AMBAS as tags
```

**SQL - Busca Complexa:**

```sql
-- Produtos por múltiplas tags (AND)
SELECT p.*
FROM products p
INNER JOIN product_tags_relation ptr ON p.id = ptr.product_id
INNER JOIN product_tags t ON ptr.tag_id = t.id
WHERE t.name IN ('BARBIERI', 'GALVANIZADO', 'DRYWALL')
  AND p.active = 1
GROUP BY p.id
HAVING COUNT(DISTINCT t.name) = 3;  -- Deve ter as 3 tags

-- Produtos por grupo e tags
SELECT p.*
FROM products p
INNER JOIN product_tags_relation ptr ON p.id = ptr.product_id
INNER JOIN product_tags t ON ptr.tag_id = t.id
WHERE p.group_id = 1
  AND t.name IN ('RESISTENTE_FOGO', 'EXTERNO')
  AND p.active = 1;
```

---

## 💳 Módulo 5: Créditos de Impostos

### 5.1 Conceito

**Notas de Entrada** geram **créditos de impostos** que podem ser:
- Compensados em vendas futuras
- Deduzidos no cálculo de impostos a pagar
- Acumulados ao longo do tempo

### 5.2 Impostos Creditáveis

| Imposto | Creditável? | Observação |
|---------|-------------|------------|
| **ICMS** | ✅ Sim | Crédito integral se sem ST |
| **ST** | ❌ Não | Já é antecipação |
| **PIS** | ✅ Sim | Regime não-cumulativo |
| **COFINS** | ✅ Sim | Regime não-cumulativo |
| **IPI** | ✅ Sim | Se aplicável |

### 5.3 Cálculo de Créditos

**Exemplo de Nota de Entrada:**

```
Nota Fiscal: 0000027449
Fornecedor: BARBIERI
Valor Produtos: R$ 1.110,00

Impostos destacados:
- ICMS: R$ 0,00 (ST)
- ST: R$ 289,80
- PIS: R$ 18,33
- COFINS: R$ 84,36

TOTAL NFe: R$ 1.502,49
```

**Créditos Gerados:**

```javascript
{
  invoice_id: "abc-123",
  invoice_number: "0000027449",

  // Créditos
  credit_icms: 0.00,        // 0 porque tem ST
  credit_st: 0.00,          // ST não gera crédito
  credit_pis: 18.33,        // ✅ Creditável
  credit_cofins: 84.36,     // ✅ Creditável
  credit_ipi: 0.00,

  total_credits: 102.69,

  status: 'available',      // available | used | expired
  used_amount: 0.00,
  remaining: 102.69,

  created_at: "2025-11-25"
}
```

### 5.4 Aplicação de Créditos

**Cenário: Venda sem ST**

```javascript
// Venda
const sale = {
  value: 1000.00,
  icms_due: 120.00,    // 12%
  pis_due: 16.50,      // 1.65%
  cofins_due: 76.00    // 7.6%
};

// Créditos disponíveis
const credits = {
  icms: 150.00,
  pis: 50.00,
  cofins: 200.00
};

// Aplicar créditos
const taxes_to_pay = {
  icms: Math.max(0, sale.icms_due - credits.icms),
  pis: Math.max(0, sale.pis_due - credits.pis),
  cofins: Math.max(0, sale.cofins_due - credits.cofins)
};

// Resultado
{
  icms: 0.00,      // 120 - 150 = 0 (sobra crédito)
  pis: 0.00,       // 16.50 - 50 = 0 (sobra crédito)
  cofins: 0.00     // 76 - 200 = 0 (sobra crédito)
}

// Créditos remanescentes
const remaining = {
  icms: 30.00,     // 150 - 120
  pis: 33.50,      // 50 - 16.50
  cofins: 124.00   // 200 - 76
};
```

### 5.5 Dashboard de Créditos

**SQL - Créditos Disponíveis:**

```sql
-- Total de créditos por tipo
SELECT
  SUM(credit_icms) as total_icms,
  SUM(credit_pis) as total_pis,
  SUM(credit_cofins) as total_cofins,
  SUM(credit_ipi) as total_ipi,
  SUM(total_credits) as total_geral
FROM tax_credits
WHERE status = 'available'
  AND created_at >= DATE('now', '-12 months');

-- Créditos por fornecedor
SELECT
  i.entity_name as fornecedor,
  SUM(tc.total_credits) as creditos_totais,
  SUM(tc.used_amount) as creditos_usados,
  SUM(tc.remaining) as creditos_disponiveis
FROM tax_credits tc
INNER JOIN invoices i ON tc.invoice_id = i.id
WHERE tc.status = 'available'
GROUP BY i.entity_name
ORDER BY creditos_disponiveis DESC;
```

---

## 🔌 APIs e Integrações

### 6.1 Endpoints Principais

**Autenticação:**

```javascript
POST /api/login
{
  "email": "usuario@planac.com.br",
  "password": "senha"
}
// Response: { success: true, user: { email, name } }
```

**Produtos:**

```javascript
// Listar produtos
GET /api/products?search=GUIA&group=1&limit=50

// Buscar produto específico
GET /api/product?code=000095

// Criar produto (manual)
POST /api/products
{
  "code": "000999",
  "name": "PRODUTO NOVO",
  "ncm": "72166110",
  "unit": "UN",
  "cost": 50.00,
  "hasST": 1,
  "group_id": 1
}

// Atualizar produto
PUT /api/products
{
  "id": 67,
  "cost": 55.00,
  "price": 120.00
}
```

**Notas Fiscais:**

```javascript
// Listar notas
GET /api/invoices?type=entrada&start=2025-01-01&end=2025-12-31

// Upload manual de XML
POST /api/invoice/upload
FormData: { xml: file }

// Scan manual de emails
POST /api/scan
```

**Precificação:**

```javascript
// Calcular preço
POST /api/pricing/calculate
{
  "productCode": "000095",
  "operation": "5102",
  "uf": "SP",
  "clientType": "pf",
  "margin": 30
}
```

**Relatórios:**

```javascript
// Por grupos
GET /api/reports/groups

// Por tags
GET /api/reports/tags

// Histórico de custos
GET /api/cost-history?code=000095
```

**Estatísticas:**

```javascript
GET /api/stats
// Response:
{
  "stats": {
    "total_invoices": 150,
    "total_entrada": 120,
    "total_saida": 30,
    "total_value": 450000.00,
    "total_icms": 54000.00,
    "total_st": 32000.00
  },
  "recentScans": [...]
}
```

### 6.2 Webhooks (Futuro)

**Notificações de Eventos:**

```javascript
// Nova nota processada
POST webhook_url
{
  "event": "invoice.processed",
  "invoice_id": "abc-123",
  "invoice_number": "0000027449",
  "type": "entrada",
  "value": 1502.49,
  "products_count": 5,
  "products_new": 2,
  "products_updated": 3
}

// Alerta de margem baixa
POST webhook_url
{
  "event": "margin.alert",
  "product_code": "000095",
  "current_margin": 18,
  "min_margin": 25,
  "recommended_price": 45.00
}
```

---

## 🗃️ Banco de Dados

### 7.1 Schema Completo

**Tabelas Principais:**

1. **products** - Catálogo de produtos
2. **product_groups** - Categorias/grupos
3. **product_tags** - Tags disponíveis
4. **product_tags_relation** - Produtos ↔ Tags
5. **product_cost_history** - Histórico de custos
6. **invoices** - Notas fiscais
7. **invoice_items** - Itens das notas
8. **tax_configs** - Configurações de impostos
9. **tax_credits** - Créditos de impostos
10. **icms_rates** - Alíquotas ICMS por UF
11. **state_icms_rates** - ICMS específico por estado
12. **price_calculations** - Histórico de simulações
13. **email_configs** - Configurações de email
14. **email_processing_log** - Log de processamento
15. **users** - Usuários do sistema

### 7.2 Relacionamentos

```
products
├──> product_groups (group_id)
├──> product_tags_relation
│    └──> product_tags (tag_id)
├──> product_cost_history (product_id)
├──> invoice_items (product via NCM/code)
└──> price_calculations (product_id)

invoices
├──> invoice_items (invoice_id)
└──> tax_credits (invoice_id)

tax_configs
└──> (referenciado em cálculos)
```

### 7.3 Índices Importantes

```sql
-- Performance em buscas
CREATE INDEX idx_products_ncm ON products(ncm);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_group ON products(group_id);

CREATE INDEX idx_invoice_items_product ON invoice_items(product_code, ncm);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_type ON invoices(type);

CREATE INDEX idx_tags_relation ON product_tags_relation(product_id, tag_id);
```

---

## 📱 Casos de Uso

### Caso 1: Importação Automática de NFe

**Ator:** Sistema (automático)

**Fluxo:**

1. Fornecedor envia email com XML para `compras@planacdistribuidora.com.br`
2. Cloudflare Email Routing encaminha para Worker
3. Worker detecta tipo "entrada" pelo destinatário
4. Worker extrai XML do anexo
5. Parser extrai dados da NFe (nota + produtos)
6. Para cada produto:
   - Busca por NCM no banco
   - Se encontrado: atualiza custo (média ponderada)
   - Se não encontrado: cria produto novo
   - Registra histórico de custo
7. Salva nota em `invoices` e itens em `invoice_items`
8. Calcula e salva créditos de impostos
9. Envia email de confirmação (opcional)
10. Registra log de processamento

**Resultado:** Produtos atualizados automaticamente, sem intervenção manual.

---

### Caso 2: Simulação de Preço

**Ator:** Usuário (vendedor)

**Fluxo:**

1. Usuário acessa simulador
2. Busca produto pelo código ou nome
3. Sistema carrega:
   - Custo atual
   - Grupo e margens recomendadas
   - Histórico de custos
   - Tags e características
4. Usuário ajusta parâmetros:
   - Margem desejada (slider 0-100%)
   - UF de destino
   - Tipo de cliente
5. Sistema calcula em tempo real:
   - Preço base
   - Impostos (ICMS, ST, PIS, COFINS, DIFAL)
   - Preço final
   - Lucro bruto e líquido
   - Margem real
6. Sistema exibe alertas:
   - ✅ Margem viável
   - ⚠️ Abaixo do mínimo
   - 📊 Preço acima da média
7. Usuário pode:
   - Salvar simulação
   - Ver histórico de simulações
   - Aplicar preço ao produto

**Resultado:** Decisão informada sobre precificação com cálculo exato de margem e lucro.

---

### Caso 3: Gestão de Tags e Categorias

**Ator:** Usuário (administrador)

**Fluxo:**

1. Usuário acessa gestão de produtos
2. Seleciona produto para editar
3. Sistema exibe:
   - Grupo atual
   - Tags aplicadas
4. Usuário pode:
   - Alterar grupo (dropdown)
   - Adicionar tags existentes (multi-select)
   - Criar nova tag (modal)
   - Remover tags
5. Ao criar nova tag:
   - Nome único
   - Escolher cor
   - Adicionar descrição
6. Ao salvar:
   - Atualiza `product_groups`
   - Atualiza `product_tags_relation`
7. Sistema valida:
   - Tag já existe?
   - Grupo válido?
8. Confirmação visual de sucesso

**Resultado:** Produto corretamente categorizado e tagueado para buscas e relatórios.

---

### Caso 4: Análise de Rentabilidade

**Ator:** Usuário (gerente)

**Fluxo:**

1. Usuário acessa relatórios
2. Seleciona "Análise de Rentabilidade"
3. Filtros disponíveis:
   - Por grupo
   - Por tag
   - Por margem (mín/máx)
   - Por período
4. Sistema gera relatório:
   - Produtos abaixo da margem mínima
   - Produtos com alta margem
   - Comparativo de custos (atual vs histórico)
   - Evolução de margens
5. Gráficos:
   - Distribuição de margens
   - Top 20 produtos mais rentáveis
   - Top 20 produtos com prejuízo/margem baixa
6. Exportação:
   - Excel
   - PDF
   - CSV

**Resultado:** Visão estratégica para ajustes de preços e negociações.

---

## 🔐 Segurança

### Autenticação

```javascript
// Hardcoded MVP (substituir por JWT em produção)
const validUsers = [
  { email: 'rodrigo@planacdivisorias.com.br', password: hash },
  { email: 'marco@planacdivisorias.com.br', password: hash }
];
```

### CORS

```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### Validações

- NCM: 8 dígitos numéricos
- Código produto: 6 dígitos com zeros à esquerda
- Custo: > 0
- Margem: 0-200%
- UF: sigla válida (27 estados)

---

## 📊 Métricas e KPIs

### Operacionais

- Notas processadas / dia
- Taxa de sucesso de parsing XML
- Tempo médio de processamento
- Produtos novos / mês
- Produtos atualizados / mês

### Financeiros

- Valor total de compras (entrada)
- Valor total de vendas (saída)
- Créditos fiscais disponíveis
- Margem média por grupo
- Produtos com margem < mínimo

### Qualidade

- % produtos com grupo definido
- % produtos com tags
- % produtos com custo atualizado (< 30 dias)
- % produtos sem movimentação (> 90 dias)

---

## 🚀 Roadmap Futuro

### Fase 2 (Próximos 3 meses)

- [ ] Dashboard visual (charts.js)
- [ ] Relatórios avançados
- [ ] Integração com ERP
- [ ] App mobile

### Fase 3 (6 meses)

- [ ] IA para sugestão de preços
- [ ] Predição de custos
- [ ] Marketplace integration
- [ ] API pública

---

**Fim do Documento**

**Versão:** 1.0
**Data:** 25/11/2025
**Autor:** Equipe PLANAC
