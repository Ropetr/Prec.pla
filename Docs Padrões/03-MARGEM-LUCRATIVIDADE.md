# 💰 Margem de Lucratividade - PLANAC

## 🎯 Conceitos Fundamentais

### Fórmula Base

```
PREÇO VENDA = CUSTO + IMPOSTOS + MARGEM LUCRO
```

### Componentes do Preço

```
┌─────────────────────────────────────┐
│     PREÇO FINAL DE VENDA            │
├─────────────────────────────────────┤
│ 1. Custo de Compra                  │
│ 2. Impostos (ICMS, ST, PIS, COFINS) │
│ 3. Despesas Operacionais            │
│ 4. Margem de Lucro Líquida          │
└─────────────────────────────────────┘
```

---

## 📊 Estrutura de Cálculo

### Carga Tributária

```javascript
const impostos = {
  // Simples Nacional
  simplesNacional: {
    aliquota: 0.0600,  // 6% (varia por faturamento)
    incluiICMS: true,
    incluiPIS: true,
    incluiCOFINS: true,
  },

  // Regime Normal
  regimeNormal: {
    ICMS: 0.12,        // 12% (média MG)
    PIS: 0.0165,       // 1.65%
    COFINS: 0.076,     // 7.6%
    total: 0.2125,     // 21.25%
  },

  // Substituição Tributária (ST)
  substituicaoTributaria: {
    // ST é pago na nota de compra
    // Não há ICMS na venda
    PIS: 0.0165,
    COFINS: 0.076,
    total: 0.0925,     // 9.25%
  },
};
```

### Despesas Operacionais

```javascript
const despesas = {
  // Fixas (% sobre faturamento)
  aluguel: 0.03,          // 3%
  pessoal: 0.15,          // 15%
  energia: 0.02,          // 2%
  telefone: 0.005,        // 0.5%
  contador: 0.01,         // 1%
  marketing: 0.02,        // 2%
  manutencao: 0.01,       // 1%

  // Variáveis
  frete: 0.05,            // 5% (média)
  perdas: 0.01,           // 1% (quebras/avarias)
  inadimplencia: 0.02,    // 2%

  // Total despesas
  total: 0.32,            // 32%
};
```

---

## 💵 Margens por Categoria

### Tabela de Margens Padrão

| Categoria | Margem Mín | Margem Ideal | Margem Máx | Observação |
|-----------|------------|--------------|------------|------------|
| **Perfis Metálicos** | 25% | 35% | 50% | Alto giro, preço competitivo |
| **Chapas Gesso** | 20% | 30% | 40% | Produto estratégico |
| **Chapas Cimentícias** | 30% | 40% | 60% | Especializado |
| **Forros PVC** | 35% | 45% | 70% | Alta margem |
| **Portas Prontas** | 40% | 50% | 80% | Valor agregado |
| **Kits de Porta** | 35% | 45% | 65% | Montagem incluída |
| **Ferragens** | 50% | 70% | 120% | Baixo custo base |
| **Parafusos/Fixadores** | 60% | 100% | 200% | Commodities |
| **Massas/Acabamentos** | 40% | 50% | 80% | Complementar |
| **Serviços** | 0% | 80% | 150% | Mão de obra |

### Regras Especiais

#### Produtos com ST (Substituição Tributária)
```javascript
// ST = Imposto já pago na compra
// Margem pode ser menor, pois carga tributária é reduzida

function calcularPrecoST(custo, margemDesejada) {
  const despesas = 0.32;  // 32%
  const impostos = 0.0925; // 9.25% (PIS + COFINS)

  // Base de cálculo
  const base = custo / (1 - despesas - impostos - margemDesejada);

  return {
    precoVenda: base.toFixed(2),
    margemReal: margemDesejada * 100,
    impostos: (base * impostos).toFixed(2),
  };
}

// Exemplo
calcularPrecoST(11.10, 0.30);
// Resultado: R$ 23.49 (30% margem)
```

#### Produtos sem ST
```javascript
function calcularPrecoNormal(custo, margemDesejada) {
  const despesas = 0.32;   // 32%
  const impostos = 0.2125; // 21.25% (ICMS + PIS + COFINS)

  const base = custo / (1 - despesas - impostos - margemDesejada);

  return {
    precoVenda: base.toFixed(2),
    margemReal: margemDesejada * 100,
    impostos: (base * impostos).toFixed(2),
  };
}

// Exemplo
calcularPrecoNormal(45.90, 0.35);
// Resultado: R$ 143.44 (35% margem)
```

---

## 📈 Análise de Rentabilidade

### Produto Individual

```sql
-- Análise de margem por produto
SELECT
  p.code,
  p.name,
  p.cost as custo_compra,
  p.price as preco_venda,
  (p.price - p.cost) as lucro_bruto,
  ROUND(((p.price - p.cost) / p.price * 100), 2) as margem_percentual,
  CASE
    WHEN p.hasST = 1 THEN 'Com ST'
    ELSE 'Sem ST'
  END as regime_tributario,
  CASE
    WHEN ((p.price - p.cost) / p.price) < 0.25 THEN 'BAIXA'
    WHEN ((p.price - p.cost) / p.price) < 0.40 THEN 'MÉDIA'
    ELSE 'ALTA'
  END as classificacao_margem
FROM products p
WHERE p.active = 1
ORDER BY margem_percentual ASC;
```

### Por Grupo

```sql
-- Margem média por grupo
SELECT
  pg.name as grupo,
  COUNT(p.id) as total_produtos,
  ROUND(AVG(p.cost), 2) as custo_medio,
  ROUND(AVG(p.price), 2) as preco_medio,
  ROUND(AVG((p.price - p.cost) / p.price * 100), 2) as margem_media,
  ROUND(MIN((p.price - p.cost) / p.price * 100), 2) as margem_minima,
  ROUND(MAX((p.price - p.cost) / p.price * 100), 2) as margem_maxima
FROM products p
INNER JOIN product_groups pg ON p.group_id = pg.id
WHERE p.active = 1
  AND p.price > 0
GROUP BY pg.id, pg.name
ORDER BY margem_media DESC;
```

### Alertas de Margem Baixa

```sql
-- Produtos com margem abaixo do mínimo
SELECT
  p.code,
  p.name,
  pg.name as grupo,
  p.cost,
  p.price,
  ROUND(((p.price - p.cost) / p.price * 100), 2) as margem_atual,
  CASE
    WHEN pg.name LIKE '%Perfis%' THEN 25
    WHEN pg.name LIKE '%Chapa Gesso%' THEN 20
    WHEN pg.name LIKE '%Forro%' THEN 35
    WHEN pg.name LIKE '%Porta%' THEN 40
    ELSE 30
  END as margem_minima_esperada
FROM products p
INNER JOIN product_groups pg ON p.group_id = pg.id
WHERE p.active = 1
  AND p.price > 0
  AND ((p.price - p.cost) / p.price * 100) <
    CASE
      WHEN pg.name LIKE '%Perfis%' THEN 25
      WHEN pg.name LIKE '%Chapa Gesso%' THEN 20
      WHEN pg.name LIKE '%Forro%' THEN 35
      WHEN pg.name LIKE '%Porta%' THEN 40
      ELSE 30
    END
ORDER BY margem_atual ASC;
```

---

## 🎯 Estratégias de Precificação

### 1. Precificação por Custo (Cost-Plus)

```javascript
// Mais simples, adiciona margem fixa ao custo

function precoCostPlus(custo, margemDesejada, hasST) {
  const despesas = 0.32;
  const impostos = hasST ? 0.0925 : 0.2125;

  const markup = 1 / (1 - despesas - impostos - margemDesejada);
  const precoVenda = custo * markup;

  return Math.ceil(precoVenda * 100) / 100; // Arredondar para cima
}

// Exemplo
precoCostPlus(11.10, 0.30, true);  // R$ 23.49
```

### 2. Precificação por Mercado

```javascript
// Baseado em concorrência e demanda

function precoMercado(custo, precosConcorrentes, hasST) {
  const precoMedio = precosConcorrentes.reduce((a, b) => a + b) / precosConcorrentes.length;
  const precoMinimo = Math.min(...precosConcorrentes);
  const precoMaximo = Math.max(...precosConcorrentes);

  // Posicionar 5% abaixo da média (estratégia competitiva)
  let precoSugerido = precoMedio * 0.95;

  // Garantir margem mínima
  const margemMinima = hasST ? 0.20 : 0.15;
  const precoMinViavel = custo / (1 - 0.32 - (hasST ? 0.0925 : 0.2125) - margemMinima);

  if (precoSugerido < precoMinViavel) {
    console.warn('Preço de mercado abaixo do viável. Usar preço mínimo.');
    precoSugerido = precoMinViavel;
  }

  return {
    precoSugerido: precoSugerido.toFixed(2),
    mercado: {
      minimo: precoMinimo,
      medio: precoMedio.toFixed(2),
      maximo: precoMaximo,
    },
    viavel: precoMinViavel.toFixed(2),
  };
}

// Exemplo
precoMercado(11.10, [24.90, 23.50, 25.90, 22.90], true);
```

### 3. Precificação Dinâmica

```javascript
// Ajusta preço baseado em múltiplos fatores

function precoDinamico(produto, contexto) {
  let precoBase = produto.cost;
  let margemBase = 0.35; // 35%

  // Ajustes por estoque
  if (contexto.estoque < contexto.estoqueMinimo) {
    margemBase += 0.05; // +5% se estoque baixo
  } else if (contexto.estoque > contexto.estoqueMaximo) {
    margemBase -= 0.05; // -5% se estoque alto
  }

  // Ajustes por sazonalidade
  if (contexto.mesAlta) {
    margemBase += 0.10; // +10% em alta temporada
  }

  // Ajustes por giro
  if (contexto.giro === 'alto') {
    margemBase -= 0.05; // -5% para incentivar volume
  } else if (contexto.giro === 'baixo') {
    margemBase += 0.05; // +5% para compensar
  }

  // Ajustes por concorrência
  if (contexto.concorrenciaAlta) {
    margemBase -= 0.03; // -3% para manter competitividade
  }

  // Calcular preço final
  const despesas = 0.32;
  const impostos = produto.hasST ? 0.0925 : 0.2125;
  const markup = 1 / (1 - despesas - impostos - margemBase);

  return {
    precoVenda: (precoBase * markup).toFixed(2),
    margemFinal: (margemBase * 100).toFixed(2) + '%',
    ajustes: {
      estoque: contexto.estoque < contexto.estoqueMinimo ? '+5%' :
               contexto.estoque > contexto.estoqueMaximo ? '-5%' : '0%',
      sazonalidade: contexto.mesAlta ? '+10%' : '0%',
      giro: contexto.giro === 'alto' ? '-5%' :
            contexto.giro === 'baixo' ? '+5%' : '0%',
      concorrencia: contexto.concorrenciaAlta ? '-3%' : '0%',
    },
  };
}
```

---

## 📊 Tabelas de Referência

### Markup por Regime Tributário

| Regime | Despesas | Impostos | Margem Alvo | Markup | Exemplo (Custo R$100) |
|--------|----------|----------|-------------|--------|-----------------------|
| **Com ST** | 32% | 9.25% | 30% | 3.47 | R$ 347,00 |
| **Com ST** | 32% | 9.25% | 25% | 2.98 | R$ 298,00 |
| **Com ST** | 32% | 9.25% | 20% | 2.59 | R$ 259,00 |
| **Sem ST** | 32% | 21.25% | 35% | 8.56 | R$ 856,00 |
| **Sem ST** | 32% | 21.25% | 30% | 5.91 | R$ 591,00 |
| **Sem ST** | 32% | 21.25% | 25% | 4.55 | R$ 455,00 |

### Fórmula de Markup

```
Markup = 1 ÷ (1 - Despesas% - Impostos% - Margem%)
Preço = Custo × Markup
```

---

## 🚨 Sistema de Alertas

### Regras de Alerta

```javascript
const alertas = {
  // Margem muito baixa
  margemCritica: {
    limiar: 0.15,  // < 15%
    acao: 'URGENTE - Revisar preço imediatamente',
    cor: '#DC2626', // Vermelho
  },

  // Margem abaixo do ideal
  margemBaixa: {
    limiar: 0.25,  // < 25%
    acao: 'ATENÇÃO - Considerar reajuste',
    cor: '#EAB308', // Amarelo
  },

  // Custo acima do preço
  prejuizo: {
    condicao: 'cost > price',
    acao: 'CRÍTICO - Produto no prejuízo',
    cor: '#7F1D1D', // Vermelho escuro
  },

  // Sem movimentação + margem baixa
  semGiro: {
    condicao: 'last_sale > 90 dias AND margem < 30%',
    acao: 'Avaliar descontinuação ou promoção',
    cor: '#9CA3AF', // Cinza
  },
};

function verificarAlertas(produto) {
  const alerts = [];
  const margem = (produto.price - produto.cost) / produto.price;

  if (produto.cost > produto.price) {
    alerts.push({
      nivel: 'CRÍTICO',
      mensagem: alertas.prejuizo.acao,
      cor: alertas.prejuizo.cor,
    });
  } else if (margem < alertas.margemCritica.limiar) {
    alerts.push({
      nivel: 'URGENTE',
      mensagem: alertas.margemCritica.acao,
      cor: alertas.margemCritica.cor,
    });
  } else if (margem < alertas.margemBaixa.limiar) {
    alerts.push({
      nivel: 'ATENÇÃO',
      mensagem: alertas.margemBaixa.acao,
      cor: alertas.margemBaixa.cor,
    });
  }

  return alerts;
}
```

### Dashboard de Alertas

```sql
-- Produtos críticos (prejuízo ou margem < 15%)
CREATE VIEW produtos_criticos AS
SELECT
  p.code,
  p.name,
  p.cost,
  p.price,
  ROUND(((p.price - p.cost) / p.price * 100), 2) as margem,
  CASE
    WHEN p.cost > p.price THEN 'PREJUÍZO'
    WHEN ((p.price - p.cost) / p.price) < 0.15 THEN 'CRÍTICO'
    WHEN ((p.price - p.cost) / p.price) < 0.25 THEN 'BAIXO'
  END as status,
  ROUND((p.cost / (1 - 0.32 - CASE WHEN p.hasST = 1 THEN 0.0925 ELSE 0.2125 END - 0.30)), 2) as preco_sugerido
FROM products p
WHERE p.active = 1
  AND (p.cost > p.price OR ((p.price - p.cost) / p.price) < 0.25)
ORDER BY margem ASC;
```

---

## 📋 Checklist de Precificação

### Ao Cadastrar Produto

```
[ ] Custo de compra confirmado (com todos encargos)
[ ] Regime tributário identificado (ST ou Normal)
[ ] Grupo/categoria definido
[ ] Margem mínima da categoria aplicada
[ ] Preços concorrentes pesquisados
[ ] Preço de venda calculado e validado
[ ] Margem final >= margem mínima
[ ] Preço competitivo no mercado
```

### Revisão Mensal

```
[ ] Verificar produtos com margem < 25%
[ ] Analisar produtos sem venda há 60+ dias
[ ] Comparar custos atuais vs. históricos
[ ] Atualizar preços conforme inflação/custos
[ ] Revisar produtos em promoção
[ ] Ajustar preços de produtos estratégicos
```

### Revisão Trimestral

```
[ ] Revisar margens por categoria
[ ] Analisar rentabilidade por fornecedor
[ ] Comparar margens vs. concorrência
[ ] Ajustar estratégia de precificação
[ ] Avaliar impacto de mudanças tributárias
```

---

## 📊 Exemplos Práticos

### Exemplo 1: Perfil Metálico (Com ST)

```javascript
const produto = {
  code: '000095',
  name: 'GUIA 48 BARBIERI Z275 0,50 X 3,00',
  cost: 11.10,
  hasST: true,
};

// Cálculo
const despesas = 0.32;   // 32%
const impostos = 0.0925; // 9.25% (PIS + COFINS)
const margem = 0.30;     // 30%

const markup = 1 / (1 - despesas - impostos - margem);
// markup = 1 / (1 - 0.32 - 0.0925 - 0.30) = 1 / 0.2875 = 3.478

const precoVenda = 11.10 * 3.478 = 38.61;

// Arredondar: R$ 38.90

// Verificação
const margemReal = (38.90 - 11.10) / 38.90 = 0.7146 = 71.46%
// Mas descontando despesas e impostos:
const lucroLiquido = 38.90 - 11.10 - (38.90 * 0.32) - (38.90 * 0.0925);
// lucroLiquido = 38.90 - 11.10 - 12.45 - 3.60 = 11.75
// margemLiquida = 11.75 / 38.90 = 30.2% ✓
```

### Exemplo 2: Chapa de Gesso (Sem ST)

```javascript
const produto = {
  code: '000450',
  name: 'CHAPA GESSO 12,5MM ST 1,20 X 1,80',
  cost: 28.50,
  hasST: false,
};

const despesas = 0.32;   // 32%
const impostos = 0.2125; // 21.25%
const margem = 0.25;     // 25%

const markup = 1 / (1 - 0.32 - 0.2125 - 0.25);
// markup = 1 / 0.2175 = 4.598

const precoVenda = 28.50 * 4.598 = 131.04;

// Arredondar: R$ 131.00

// Margem líquida
const lucroLiquido = 131.00 - 28.50 - (131.00 * 0.32) - (131.00 * 0.2125);
// = 131.00 - 28.50 - 41.92 - 27.84 = 32.74
// margem = 32.74 / 131.00 = 25.0% ✓
```

---

**Última Atualização:** 25/11/2025
**Versão:** 1.0
**Responsável:** Desenvolvimento PLANAC
