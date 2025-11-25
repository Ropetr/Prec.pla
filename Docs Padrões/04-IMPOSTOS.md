# 🧾 Sistema Tributário - PLANAC

## 🎯 Visão Geral

Sistema completo de cálculo e gestão de impostos para operações comerciais no Brasil, com foco em Minas Gerais.

---

## 📊 Tributos Principais

### 1. ICMS (Imposto sobre Circulação de Mercadorias)

#### Alíquotas por Estado

```javascript
const aliquotasICMS = {
  // Estados
  'AC': 0.19, // Acre
  'AL': 0.19, // Alagoas
  'AP': 0.18, // Amapá
  'AM': 0.20, // Amazonas
  'BA': 0.20, // Bahia (18% interna)
  'CE': 0.20, // Ceará
  'DF': 0.20, // Distrito Federal
  'ES': 0.17, // Espírito Santo
  'GO': 0.19, // Goiás
  'MA': 0.22, // Maranhão
  'MT': 0.17, // Mato Grosso
  'MS': 0.17, // Mato Grosso do Sul
  'MG': 0.18, // Minas Gerais
  'PA': 0.19, // Pará
  'PB': 0.20, // Paraíba
  'PR': 0.19, // Paraná
  'PE': 0.20, // Pernambuco
  'PI': 0.21, // Piauí
  'RJ': 0.20, // Rio de Janeiro (18% reduzida)
  'RN': 0.20, // Rio Grande do Norte
  'RS': 0.17, // Rio Grande do Sul
  'RO': 0.19, // Rondônia
  'RR': 0.20, // Roraima
  'SC': 0.17, // Santa Catarina
  'SP': 0.18, // São Paulo
  'SE': 0.19, // Sergipe
  'TO': 0.20, // Tocantins
};
```

#### Operações Internas (MG → MG)

```javascript
// Alíquota padrão: 18%
// Alguns produtos têm alíquotas reduzidas

const icmsInternoMG = {
  padrao: 0.18,        // 18% - Maioria dos produtos
  reduzido: 0.12,      // 12% - Materiais construção (alguns)
  construcao: 0.12,    // 12% - Específico construção civil
};

function calcularICMSInterno(valorProduto, ncm) {
  // Produtos de construção civil podem ter 12%
  const ncmsReduzidos = [
    '68091100', // Chapas gesso
    '68118200', // Chapas cimentícias
    '72166110', // Perfis metálicos
  ];

  const aliquota = ncmsReduzidos.includes(ncm) ?
    icmsInternoMG.reduzido :
    icmsInternoMG.padrao;

  return {
    aliquota: aliquota,
    valor: valorProduto * aliquota,
  };
}
```

#### Operações Interestaduais

```javascript
// Alíquotas interestaduais (origem → destino)
const icmsInterestadual = {
  // Sul e Sudeste (exceto ES)
  sulSudeste: 0.12,
  // Norte, Nordeste, Centro-Oeste e ES
  demais: 0.07,
};

function calcularICMSInterestadual(ufOrigem, ufDestino, valor) {
  // De MG para outros estados
  if (ufOrigem === 'MG') {
    const sulSudeste = ['SP', 'RJ', 'PR', 'SC', 'RS', 'MG'];

    const aliquota = sulSudeste.includes(ufDestino) ?
      icmsInterestadual.sulSudeste :
      icmsInterestadual.demais;

    return {
      aliquota: aliquota,
      valor: valor * aliquota,
    };
  }
}
```

---

### 2. Substituição Tributária (ST)

#### Conceito

```
Substituição Tributária = ICMS antecipado

O fornecedor paga o ICMS que seria devido nas
próximas etapas da cadeia (até o consumidor final).

Na revenda:
- NÃO há ICMS a recolher
- Apenas PIS e COFINS
```

#### Produtos Sujeitos a ST

```javascript
const produtosST = {
  // NCMs comuns com ST em MG
  perfisMetalicos: ['72166110', '72166190'],
  ferragens: ['83024100', '83024200'],
  parafusos: ['73181400', '73181200'],
  tintas: ['32091000', '32099000'],
  // ... outros conforme legislação
};

// Verificar se produto tem ST
function temSubstituicaoTributaria(ncm, ufOrigem, ufDestino) {
  // Consultar tabela ST
  // Pode variar por UF
  return produtosST.perfisMetalicos.includes(ncm) ||
         produtosST.ferragens.includes(ncm) ||
         produtosST.parafusos.includes(ncm);
}
```

#### Cálculo da ST na Compra

```javascript
function calcularST(compra) {
  // Base: valor da nota + IPI + frete + outras despesas
  const baseCalculo = compra.valor +
                      compra.ipi +
                      compra.frete +
                      compra.seguro;

  // MVA (Margem de Valor Agregado)
  // Varia por produto, média 40-50%
  const mva = 0.45; // 45%

  // Base ST = Base × (1 + MVA)
  const baseST = baseCalculo * (1 + mva);

  // Alíquota ICMS interna do estado destino
  const aliquotaInterna = 0.18; // 18% MG

  // Alíquota interestadual da operação
  const aliquotaInterestadual = 0.12; // 12%

  // ST = (Base ST × Alíquota Interna) - ICMS próprio
  const icmsProprio = baseCalculo * aliquotaInterestadual;
  const icmsST = (baseST * aliquotaInterna) - icmsProprio;

  return {
    baseCalculo: baseCalculo.toFixed(2),
    baseST: baseST.toFixed(2),
    icmsProprio: icmsProprio.toFixed(2),
    icmsST: icmsST.toFixed(2),
    total: (baseCalculo + icmsST).toFixed(2),
  };
}

// Exemplo
calcularST({
  valor: 1000.00,
  ipi: 0,
  frete: 50.00,
  seguro: 0,
});
/*
Resultado:
{
  baseCalculo: "1050.00",
  baseST: "1522.50",
  icmsProprio: "126.00",
  icmsST: "148.05",
  total: "1198.05"
}
*/
```

---

### 3. DIFAL (Diferencial de Alíquota)

#### Conceito

```
DIFAL = Diferença entre alíquota interna e interestadual

Aplicável em vendas para consumidor final em outro estado
(desde 2016 - EC 87/2015)
```

#### Cálculo

```javascript
function calcularDIFAL(venda) {
  const { valor, ufOrigem, ufDestino, cfop } = venda;

  // Só aplica DIFAL em venda para não contribuinte (consumidor final)
  const cfopsConsumidorFinal = ['6107', '6108', '6109', '6110'];

  if (!cfopsConsumidorFinal.includes(cfop)) {
    return { difal: 0, origem: 0, destino: 0 };
  }

  // Alíquotas
  const aliqInterna = aliquotasICMS[ufDestino]; // Ex: 18% (destino)
  const aliqInterestadual = 0.12; // 12% (operação)

  // Base de cálculo
  const baseCalculo = valor;

  // DIFAL total
  const difal = baseCalculo * (aliqInterna - aliqInterestadual);

  // Partilha (2023 em diante: 100% destino)
  const parteDestino = difal; // 100%
  const parteOrigem = 0;      // 0%

  return {
    difal: difal.toFixed(2),
    destino: parteDestino.toFixed(2),
    origem: parteOrigem.toFixed(2),
    aliqInterna: aliqInterna,
    aliqInterestadual: aliqInterestadual,
  };
}

// Exemplo: Venda MG → BA (consumidor final)
calcularDIFAL({
  valor: 1000.00,
  ufOrigem: 'MG',
  ufDestino: 'BA',
  cfop: '6107',
});
/*
Resultado:
{
  difal: "80.00",
  destino: "80.00",
  origem: "0.00",
  aliqInterna: 0.20,
  aliqInterestadual: 0.12
}
*/
```

---

### 4. PIS (Programa de Integração Social)

```javascript
const aliquotasPIS = {
  // Regime cumulativo (Lucro Presumido/Simples)
  cumulativo: 0.0065, // 0.65%

  // Regime não-cumulativo (Lucro Real)
  naoCumulativo: 0.0165, // 1.65%
};

function calcularPIS(valorVenda, regime = 'cumulativo') {
  const aliquota = aliquotasPIS[regime];
  return {
    aliquota: aliquota,
    valor: valorVenda * aliquota,
  };
}
```

---

### 5. COFINS (Contribuição para Financiamento da Seguridade Social)

```javascript
const aliquotasCOFINS = {
  // Regime cumulativo
  cumulativo: 0.03, // 3%

  // Regime não-cumulativo
  naoCumulativo: 0.076, // 7.6%
};

function calcularCOFINS(valorVenda, regime = 'cumulativo') {
  const aliquota = aliquotasCOFINS[regime];
  return {
    aliquota: aliquota,
    valor: valorVenda * aliquota,
  };
}
```

---

### 6. IPI (Imposto sobre Produtos Industrializados)

```javascript
// IPI varia por NCM e tipo de produto
// Maioria dos produtos de construção: 0% ou 5%

const aliquotasIPI = {
  '72166110': 0,      // Perfis - isento
  '68091100': 0,      // Chapas gesso - isento
  '73181400': 0,      // Parafusos - isento
  '39162000': 0.05,   // PVC - 5%
  '32091000': 0.05,   // Tintas - 5%
};

function calcularIPI(valorProduto, ncm) {
  const aliquota = aliquotasIPI[ncm] || 0;
  return {
    aliquota: aliquota,
    valor: valorProduto * aliquota,
  };
}
```

---

## 🧮 Cálculo Completo de Impostos

### Cenário 1: Venda Interna (MG → MG) SEM ST

```javascript
function calcularImpostosVendaInterna(venda) {
  const { valor, ncm } = venda;

  // ICMS: 18% (padrão MG)
  const icms = calcularICMSInterno(valor, ncm);

  // PIS: 0.65%
  const pis = calcularPIS(valor, 'cumulativo');

  // COFINS: 3%
  const cofins = calcularCOFINS(valor, 'cumulativo');

  const totalImpostos = icms.valor + pis.valor + cofins.valor;

  return {
    valor: valor,
    icms: icms,
    pis: pis,
    cofins: cofins,
    totalImpostos: totalImpostos.toFixed(2),
    percentual: ((totalImpostos / valor) * 100).toFixed(2) + '%',
  };
}

// Exemplo: Venda de R$ 1.000,00
calcularImpostosVendaInterna({
  valor: 1000.00,
  ncm: '72166110',
});
/*
Resultado:
{
  valor: 1000.00,
  icms: { aliquota: 0.12, valor: 120.00 },
  pis: { aliquota: 0.0065, valor: 6.50 },
  cofins: { aliquota: 0.03, valor: 30.00 },
  totalImpostos: "156.50",
  percentual: "15.65%"
}
*/
```

### Cenário 2: Venda Interna COM ST

```javascript
function calcularImpostosVendaComST(venda) {
  const { valor } = venda;

  // ST = ICMS já foi pago na compra
  // Apenas PIS e COFINS

  const pis = calcularPIS(valor, 'cumulativo');
  const cofins = calcularCOFINS(valor, 'cumulativo');

  const totalImpostos = pis.valor + cofins.valor;

  return {
    valor: valor,
    icms: { aliquota: 0, valor: 0, obs: 'ST já recolhida' },
    pis: pis,
    cofins: cofins,
    totalImpostos: totalImpostos.toFixed(2),
    percentual: ((totalImpostos / valor) * 100).toFixed(2) + '%',
  };
}

// Exemplo: Venda de R$ 1.000,00 com ST
calcularImpostosVendaComST({
  valor: 1000.00,
});
/*
Resultado:
{
  valor: 1000.00,
  icms: { aliquota: 0, valor: 0, obs: 'ST já recolhida' },
  pis: { aliquota: 0.0065, valor: 6.50 },
  cofins: { aliquota: 0.03, valor: 30.00 },
  totalImpostos: "36.50",
  percentual: "3.65%"
}
*/
```

### Cenário 3: Venda Interestadual (MG → SP)

```javascript
function calcularImpostosVendaInterestadual(venda) {
  const { valor, ufDestino, cfop, ncm } = venda;

  // ICMS interestadual
  const icms = calcularICMSInterestadual('MG', ufDestino, valor);

  // DIFAL (se consumidor final)
  const difal = calcularDIFAL({
    valor,
    ufOrigem: 'MG',
    ufDestino,
    cfop,
  });

  // PIS e COFINS
  const pis = calcularPIS(valor, 'cumulativo');
  const cofins = calcularCOFINS(valor, 'cumulativo');

  const totalImpostos = icms.valor +
                        parseFloat(difal.destino) +
                        pis.valor +
                        cofins.valor;

  return {
    valor: valor,
    icms: icms,
    difal: difal,
    pis: pis,
    cofins: cofins,
    totalImpostos: totalImpostos.toFixed(2),
    percentual: ((totalImpostos / valor) * 100).toFixed(2) + '%',
  };
}

// Exemplo: Venda MG → SP (contribuinte)
calcularImpostosVendaInterestadual({
  valor: 1000.00,
  ufDestino: 'SP',
  cfop: '6102', // Venda a contribuinte
  ncm: '72166110',
});
```

---

## 📋 CFOPs Principais

### Operações Internas (MG)

```javascript
const cfopsInternos = {
  '5101': 'Venda de produção própria',
  '5102': 'Venda de mercadoria adquirida',
  '5104': 'Venda de mercadoria sujeita a ST',
  '5405': 'Venda de bem do ativo imobilizado',
  '5949': 'Outra saída não especificada',
};
```

### Operações Interestaduais

```javascript
const cfopsInterestaduais = {
  '6101': 'Venda de produção própria',
  '6102': 'Venda de mercadoria adquirida',
  '6104': 'Venda de mercadoria sujeita a ST',
  '6107': 'Venda para não contribuinte',
  '6108': 'Venda para não contribuinte (outros UF)',
  '6949': 'Outra saída não especificada',
};
```

---

## 🔍 Consultas SQL

### Produtos por Regime Tributário

```sql
-- Distribuição ST vs Normal
SELECT
  CASE
    WHEN hasST = 1 THEN 'Com ST'
    ELSE 'Sem ST'
  END as regime,
  COUNT(*) as total_produtos,
  ROUND(AVG(cost), 2) as custo_medio,
  ROUND(SUM(cost), 2) as custo_total
FROM products
WHERE active = 1
GROUP BY hasST;
```

### Carga Tributária por Produto

```sql
-- Estimativa de impostos por produto
SELECT
  p.code,
  p.name,
  p.price as preco_venda,
  CASE
    WHEN p.hasST = 1 THEN ROUND(p.price * 0.0365, 2)
    ELSE ROUND(p.price * 0.1565, 2)
  END as impostos_estimados,
  CASE
    WHEN p.hasST = 1 THEN '3.65%'
    ELSE '15.65%'
  END as carga_tributaria
FROM products p
WHERE p.active = 1
  AND p.price > 0
ORDER BY impostos_estimados DESC
LIMIT 20;
```

---

## 📊 Tabelas de Apoio

### Tabela: tax_rates

```sql
CREATE TABLE tax_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uf_origem TEXT NOT NULL,
  uf_destino TEXT NOT NULL,
  icms_rate REAL NOT NULL,
  tax_type TEXT DEFAULT 'ICMS',
  effective_date TEXT DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1
);

-- Popular com alíquotas
INSERT INTO tax_rates (uf_origem, uf_destino, icms_rate) VALUES
  ('MG', 'MG', 0.18),
  ('MG', 'SP', 0.12),
  ('MG', 'RJ', 0.12),
  ('MG', 'BA', 0.07),
  ('MG', 'CE', 0.07);
```

### Tabela: ncm_tax_info

```sql
CREATE TABLE ncm_tax_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ncm TEXT NOT NULL UNIQUE,
  description TEXT,
  hasST INTEGER DEFAULT 0,
  ipi_rate REAL DEFAULT 0,
  icms_reduzido INTEGER DEFAULT 0,
  notes TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Popular com NCMs comuns
INSERT INTO ncm_tax_info (ncm, description, hasST, ipi_rate, icms_reduzido) VALUES
  ('72166110', 'Perfis metálicos galvanizados', 1, 0, 1),
  ('68091100', 'Chapas de gesso', 0, 0, 1),
  ('39162000', 'Revestimentos PVC', 0, 0.05, 0);
```

---

## 🚨 Alertas Fiscais

### Inconsistências Tributárias

```sql
-- Produtos com flag ST mas NCM sem ST
SELECT
  p.code,
  p.name,
  p.ncm,
  p.hasST as produto_st,
  COALESCE(nti.hasST, 0) as ncm_st
FROM products p
LEFT JOIN ncm_tax_info nti ON p.ncm = nti.ncm
WHERE p.active = 1
  AND p.hasST != COALESCE(nti.hasST, 0);
```

### Produtos sem NCM

```sql
-- Produtos sem NCM ou NCM inválido
SELECT code, name, ncm
FROM products
WHERE active = 1
  AND (ncm IS NULL OR LENGTH(ncm) != 8 OR ncm = '00000000');
```

---

## 📖 Notas Fiscais

### Estrutura XML NFe

```xml
<nfeProc>
  <NFe>
    <infNFe>
      <!-- Impostos por item -->
      <det nItem="1">
        <prod>
          <cProd>000095</cProd>
          <xProd>GUIA 48 BARBIERI Z275</xProd>
          <NCM>72166110</NCM>
          <vProd>100.00</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS60> <!-- ST -->
              <orig>0</orig>
              <CST>60</CST>
              <vBCSTRet>150.00</vBCSTRet>
              <vICMSSTRet>27.00</vICMSSTRet>
            </ICMS60>
          </ICMS>
          <PIS>
            <PISOutr>
              <CST>99</CST>
              <vPIS>0.65</vPIS>
            </PISOutr>
          </PIS>
          <COFINS>
            <COFINSOutr>
              <CST>99</CST>
              <vCOFINS>3.00</vCOFINS>
            </COFINSOutr>
          </COFINS>
        </imposto>
      </det>
    </infNFe>
  </NFe>
</nfeProc>
```

### Extração de Impostos do XML

```javascript
function extrairImpostosXML(xml) {
  // Parse XML
  const det = xml.querySelector('det');
  const prod = det.querySelector('prod');
  const imposto = det.querySelector('imposto');

  // Produto
  const produto = {
    codigo: prod.querySelector('cProd').textContent,
    descricao: prod.querySelector('xProd').textContent,
    ncm: prod.querySelector('NCM').textContent,
    valor: parseFloat(prod.querySelector('vProd').textContent),
  };

  // ICMS
  const icmsNode = imposto.querySelector('ICMS').firstElementChild;
  const cst = icmsNode.querySelector('CST').textContent;

  let icms = { cst: cst };

  if (['60', '10', '30', '70'].includes(cst)) {
    // Tem ST
    icms.tipo = 'ST';
    icms.vBCST = parseFloat(icmsNode.querySelector('vBCSTRet')?.textContent || 0);
    icms.vST = parseFloat(icmsNode.querySelector('vICMSSTRet')?.textContent || 0);
  } else {
    // Normal
    icms.tipo = 'Normal';
    icms.vBC = parseFloat(icmsNode.querySelector('vBC')?.textContent || 0);
    icms.vICMS = parseFloat(icmsNode.querySelector('vICMS')?.textContent || 0);
  }

  // PIS
  const pisNode = imposto.querySelector('PIS').firstElementChild;
  const pis = {
    cst: pisNode.querySelector('CST').textContent,
    valor: parseFloat(pisNode.querySelector('vPIS').textContent),
  };

  // COFINS
  const cofinsNode = imposto.querySelector('COFINS').firstElementChild;
  const cofins = {
    cst: cofinsNode.querySelector('CST').textContent,
    valor: parseFloat(cofinsNode.querySelector('vCOFINS').textContent),
  };

  return {
    produto: produto,
    impostos: {
      icms: icms,
      pis: pis,
      cofins: cofins,
      total: (icms.vICMS || icms.vST || 0) + pis.valor + cofins.valor,
    },
  };
}
```

---

## ✅ Checklist Fiscal

### Ao Cadastrar Produto

```
[ ] NCM correto e válido (8 dígitos)
[ ] Verificar se tem ST na UF
[ ] Definir alíquota IPI (se aplicável)
[ ] Marcar flag hasST corretamente
[ ] Validar CFOP para operação
[ ] Conferir alíquota ICMS
```

### Ao Emitir Nota Fiscal

```
[ ] CFOP correto para operação
[ ] NCM correto do produto
[ ] CST ICMS apropriado
[ ] Base de cálculo correta
[ ] Alíquotas aplicadas conforme legislação
[ ] DIFAL calculado (se aplicável)
[ ] Observações obrigatórias no campo "Inf. Complementares"
```

### Revisão Mensal

```
[ ] Conferir apuração ICMS
[ ] Validar ST retida vs. paga
[ ] Revisar DAS (Simples Nacional)
[ ] Conferir PIS/COFINS
[ ] Verificar DIFAL devido
[ ] Arquivar XMLs recebidos e emitidos
```

---

**Última Atualização:** 25/11/2025
**Versão:** 1.0
**Responsável:** Desenvolvimento PLANAC

**Atenção:** Informações tributárias podem mudar. Sempre consulte contador ou legislação vigente.
