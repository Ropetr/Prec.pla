# 🏷️ Sistema de Grupos e Tags - PLANAC

## 🎯 Visão Geral

O sistema de classificação de produtos da PLANAC utiliza **grupos hierárquicos** e **tags flexíveis** para organização, busca e análise de produtos.

---

## 📊 Estrutura de Grupos

### Tabela: product_groups

```sql
CREATE TABLE product_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES product_groups(id)
);
```

### Hierarquia de Grupos

```
GRUPOS PRINCIPAIS
├── Perfis Metálicos (id: 1)
│   ├── Montantes
│   ├── Guias
│   ├── Cantoneiras
│   ├── Tabicas
│   └── Travessas
│
├── Chapas e Placas (id: 2)
│   ├── Chapas de Gesso
│   ├── Chapas Cimentícias
│   ├── Placas OSB
│   └── Placas Compensadas
│
├── Forros (id: 3)
│   ├── Forro PVC
│   ├── Forro Madeira
│   ├── Forro Gesso
│   └── Acessórios Forro
│
├── Portas e Esquadrias (id: 4)
│   ├── Portas Prontas
│   ├── Kits de Porta
│   ├── Marcos
│   └── Batentes
│
├── Ferragens (id: 5)
│   ├── Fechaduras
│   ├── Dobradiças
│   ├── Puxadores
│   └── Rodízios
│
├── Fixadores (id: 6)
│   ├── Parafusos
│   ├── Buchas
│   ├── Pregos
│   └── Arames
│
├── Acabamentos (id: 7)
│   ├── Massas
│   ├── Fitas
│   ├── Cantoneiras PVC
│   └── Rodapés
│
└── Materiais Gerais (id: 8)
    ├── Isolantes
    ├── Impermeabilizantes
    ├── Adesivos
    └── Diversos
```

---

## 🔖 Sistema de Tags

### Tabela: product_tags

```sql
CREATE TABLE product_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  category TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_tag_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (tag_id) REFERENCES product_tags(id)
);
```

### Categorias de Tags

#### 1. Tags de Marca
```
- BARBIERI (perfis metálicos)
- BELKA (forros PVC)
- PLASBIL (forros PVC)
- STEEL (perfis)
- KNAUF (gesso)
- PLACO (gesso)
- BRASILIT (cimentícias)
- INFIBRA (cimentícias)
- G-DOOR (portas)
- DRYBOX (massas)
```

#### 2. Tags de Material
```
- GESSO
- PVC
- METAL
- MADEIRA
- CIMENTO
- PLASTICO
- ACO_GALVANIZADO
```

#### 3. Tags de Aplicação
```
- DRYWALL
- STEEL_FRAME
- FORRO
- DIVISORIA
- PORTA
- PAREDE
- TETO
- PISO
```

#### 4. Tags de Característica
```
- RESISTENTE_UMIDADE (RU)
- RESISTENTE_FOGO (RF)
- GALVANIZADO
- PINTADO
- ESMALTADO
- EXTERNO
- INTERNO
```

#### 5. Tags de Status
```
- NOVO_CATALOGO
- PROMOCAO
- ESTOQUE_BAIXO
- DESCONTINUADO
- IMPORTADO
- NACIONAL
```

#### 6. Tags de Performance
```
- ALTO_GIRO
- BAIXO_GIRO
- SAZONAL
- ESTRATEGICO
```

---

## 🤖 Regras de Classificação Automática

### Por NCM

```javascript
const ncmToGroup = {
  '72166110': { group: 'Perfis Metálicos', tags: ['METAL', 'ACO_GALVANIZADO'] },
  '72166190': { group: 'Perfis Metálicos', tags: ['METAL'] },
  '68091100': { group: 'Chapas e Placas', tags: ['GESSO', 'DRYWALL'] },
  '68091900': { group: 'Chapas e Placas', tags: ['GESSO'] },
  '68118200': { group: 'Chapas e Placas', tags: ['CIMENTO', 'EXTERNO'] },
  '39162000': { group: 'Forros', tags: ['PVC', 'FORRO'] },
  '73181400': { group: 'Fixadores', tags: ['METAL', 'PARAFUSO'] },
  '32141010': { group: 'Acabamentos', tags: ['MASSA', 'DRYWALL'] },
};

function classifyByNCM(product) {
  const classification = ncmToGroup[product.ncm];
  if (classification) {
    product.group = classification.group;
    product.tags = classification.tags;
  }
}
```

### Por Nome do Produto

```javascript
const namePatterns = {
  // Marcas
  'BARBIERI': { tag: 'BARBIERI' },
  'BELKA': { tag: 'BELKA' },
  'PLASBIL': { tag: 'PLASBIL' },
  'DRYBOX': { tag: 'DRYBOX' },
  'G-DOOR': { tag: 'G-DOOR' },

  // Tipos
  'MONTANTE': { group: 'Perfis Metálicos', tags: ['DRYWALL', 'STEEL_FRAME'] },
  'GUIA': { group: 'Perfis Metálicos', tags: ['DRYWALL', 'STEEL_FRAME'] },
  'CANTONEIRA': { group: 'Perfis Metálicos', tags: ['DRYWALL'] },
  'CHAPA GESSO': { group: 'Chapas e Placas', tags: ['GESSO', 'DRYWALL'] },
  'CHAPA CIMENTICIA': { group: 'Chapas e Placas', tags: ['CIMENTO', 'EXTERNO'] },
  'FORRO PVC': { group: 'Forros', tags: ['PVC', 'FORRO', 'INTERNO'] },
  'PORTA': { group: 'Portas e Esquadrias', tags: ['PORTA'] },
  'PARAFUSO': { group: 'Fixadores', tags: ['METAL'] },
  'MASSA': { group: 'Acabamentos', tags: ['MASSA', 'DRYWALL'] },

  // Características
  'RU': { tag: 'RESISTENTE_UMIDADE' },
  'RF': { tag: 'RESISTENTE_FOGO' },
  'GALVANIZADO': { tag: 'GALVANIZADO' },
  'Z120': { tag: 'GALVANIZADO' },
  'Z275': { tag: 'GALVANIZADO' },
};

function classifyByName(product) {
  const name = product.name.toUpperCase();

  for (const [pattern, classification] of Object.entries(namePatterns)) {
    if (name.includes(pattern)) {
      if (classification.group) {
        product.group = classification.group;
      }
      if (classification.tag) {
        product.tags.push(classification.tag);
      }
      if (classification.tags) {
        product.tags.push(...classification.tags);
      }
    }
  }
}
```

---

## 📝 Processo de Classificação

### Fluxo Automático

```
1. PRODUTO IMPORTADO
   ↓
2. Classificar por NCM
   - Atribuir grupo principal
   - Adicionar tags básicas
   ↓
3. Classificar por Nome
   - Refinar grupo se necessário
   - Adicionar tags específicas
   - Identificar marca
   ↓
4. Análise de Performance
   - Verificar histórico de vendas
   - Adicionar tags de giro
   ↓
5. PRODUTO CLASSIFICADO
```

### Exemplo Prático

```javascript
// Produto entrada
const product = {
  code: '000095',
  name: 'GUIA 48 BARBIERI Z275 0,50 X 3,00',
  ncm: '72166110',
  cost: 11.10,
};

// Após classificação automática
const classified = {
  ...product,
  group_id: 1, // Perfis Metálicos
  tags: [
    'METAL',
    'ACO_GALVANIZADO',
    'BARBIERI',
    'DRYWALL',
    'STEEL_FRAME',
    'GALVANIZADO'
  ]
};
```

---

## 🔍 Busca e Filtros

### Por Grupo

```sql
-- Todos produtos de um grupo
SELECT * FROM products WHERE group_id = 1;

-- Produtos de um grupo e seus subgrupos
WITH RECURSIVE group_tree AS (
  SELECT id FROM product_groups WHERE id = 1
  UNION ALL
  SELECT pg.id FROM product_groups pg
  INNER JOIN group_tree gt ON pg.parent_id = gt.id
)
SELECT p.* FROM products p
WHERE p.group_id IN (SELECT id FROM group_tree);
```

### Por Tags

```sql
-- Produtos com uma tag específica
SELECT p.* FROM products p
INNER JOIN product_tag_assignments pta ON p.id = pta.product_id
INNER JOIN product_tags pt ON pta.tag_id = pt.id
WHERE pt.name = 'BARBIERI';

-- Produtos com múltiplas tags (AND)
SELECT p.* FROM products p
WHERE p.id IN (
  SELECT product_id FROM product_tag_assignments pta
  INNER JOIN product_tags pt ON pta.tag_id = pt.id
  WHERE pt.name IN ('BARBIERI', 'DRYWALL')
  GROUP BY product_id
  HAVING COUNT(DISTINCT pt.name) = 2
);

-- Produtos com pelo menos uma tag (OR)
SELECT DISTINCT p.* FROM products p
INNER JOIN product_tag_assignments pta ON p.id = pta.product_id
INNER JOIN product_tags pt ON pta.tag_id = pt.id
WHERE pt.name IN ('BARBIERI', 'BELKA', 'PLASBIL');
```

### Busca Combinada

```sql
-- Grupo + Tags + Texto
SELECT p.* FROM products p
LEFT JOIN product_tag_assignments pta ON p.id = pta.product_id
LEFT JOIN product_tags pt ON pta.tag_id = pt.id
WHERE p.group_id = 1
  AND p.name LIKE '%GUIA%'
  AND pt.name = 'BARBIERI'
  AND p.active = 1;
```

---

## 📊 Análise e Relatórios

### Produtos por Grupo

```sql
SELECT
  pg.name as grupo,
  COUNT(p.id) as total_produtos,
  COUNT(CASE WHEN p.active = 1 THEN 1 END) as ativos,
  COUNT(CASE WHEN p.active = 0 THEN 1 END) as inativos
FROM product_groups pg
LEFT JOIN products p ON p.group_id = pg.id
GROUP BY pg.id, pg.name
ORDER BY total_produtos DESC;
```

### Produtos por Tag

```sql
SELECT
  pt.name as tag,
  pt.category as categoria,
  COUNT(DISTINCT pta.product_id) as total_produtos
FROM product_tags pt
LEFT JOIN product_tag_assignments pta ON pt.id = pta.tag_id
GROUP BY pt.id, pt.name, pt.category
ORDER BY total_produtos DESC;
```

### Tags Mais Usadas

```sql
SELECT
  pt.name,
  COUNT(pta.product_id) as uso,
  GROUP_CONCAT(DISTINCT pg.name) as grupos
FROM product_tags pt
INNER JOIN product_tag_assignments pta ON pt.id = pta.tag_id
INNER JOIN products p ON pta.product_id = p.id
INNER JOIN product_groups pg ON p.group_id = pg.id
GROUP BY pt.id, pt.name
ORDER BY uso DESC
LIMIT 20;
```

---

## 🎨 Cores de Tags

### Padrão de Cores

```javascript
const tagColors = {
  // Marcas - Azul
  'BARBIERI': '#1E40AF',
  'BELKA': '#1E3A8A',
  'PLASBIL': '#1E3A8A',
  'STEEL': '#1E40AF',

  // Material - Verde
  'METAL': '#15803D',
  'PVC': '#166534',
  'GESSO': '#15803D',
  'MADEIRA': '#92400E',

  // Aplicação - Roxo
  'DRYWALL': '#6B21A8',
  'STEEL_FRAME': '#7C3AED',
  'FORRO': '#7C3AED',

  // Característica - Laranja
  'RESISTENTE_UMIDADE': '#C2410C',
  'RESISTENTE_FOGO': '#DC2626',
  'GALVANIZADO': '#D97706',

  // Status - Cinza/Outros
  'PROMOCAO': '#DC2626',
  'NOVO_CATALOGO': '#16A34A',
  'DESCONTINUADO': '#6B7280',

  // Performance - Amarelo/Verde
  'ALTO_GIRO': '#16A34A',
  'BAIXO_GIRO': '#EAB308',
  'ESTRATEGICO': '#0891B2',
};
```

---

## ⚙️ API Endpoints

### Grupos

```javascript
// Listar todos grupos
GET /api/product-groups

// Criar grupo
POST /api/product-groups
{
  "name": "Perfis Especiais",
  "description": "Perfis customizados",
  "parent_id": 1
}

// Atualizar grupo
PUT /api/product-groups/:id
{
  "name": "Novo Nome",
  "active": 1
}

// Deletar grupo (soft delete)
DELETE /api/product-groups/:id
```

### Tags

```javascript
// Listar todas tags
GET /api/product-tags

// Criar tag
POST /api/product-tags
{
  "name": "NOVA_TAG",
  "color": "#1E40AF",
  "category": "custom"
}

// Atribuir tag a produto
POST /api/products/:id/tags
{
  "tag_id": 5
}

// Remover tag de produto
DELETE /api/products/:id/tags/:tagId
```

---

## ✅ Checklist de Classificação

### Ao Cadastrar Produto

```
[ ] Grupo principal definido
[ ] Tags de marca aplicadas (se aplicável)
[ ] Tags de material aplicadas
[ ] Tags de aplicação aplicadas
[ ] Tags de característica aplicadas (RU, RF, etc)
[ ] Verificar se produto está em promoção
[ ] Analisar giro histórico (se existir)
[ ] Validar consistência NCM x Grupo x Tags
```

### Revisão Periódica

```
[ ] Verificar produtos sem grupo
[ ] Verificar produtos sem tags
[ ] Atualizar tags de performance (giro)
[ ] Remover tags obsoletas
[ ] Consolidar grupos similares
[ ] Ajustar hierarquia de grupos
```

---

## 🔧 Manutenção

### Scripts Úteis

```sql
-- Produtos sem grupo
SELECT code, name FROM products WHERE group_id IS NULL;

-- Produtos sem tags
SELECT p.code, p.name
FROM products p
LEFT JOIN product_tag_assignments pta ON p.id = pta.product_id
WHERE pta.id IS NULL;

-- Tags não utilizadas
SELECT pt.name
FROM product_tags pt
LEFT JOIN product_tag_assignments pta ON pt.id = pta.tag_id
WHERE pta.id IS NULL;

-- Grupos vazios
SELECT pg.name
FROM product_groups pg
LEFT JOIN products p ON p.group_id = pg.id
WHERE p.id IS NULL;
```

---

**Última Atualização:** 25/11/2025
**Versão:** 1.0
**Responsável:** Desenvolvimento PLANAC
