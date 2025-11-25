# 📋 Padrões de Código de Produtos - PLANAC

## 🎯 Formato de Código

### Padrão Oficial
```
000XXX
```

**Características:**
- **6 dígitos** numéricos
- **Zeros à esquerda** obrigatórios
- **Sequencial** por ordem de cadastro
- **Único** por produto

### Exemplos
```
000095 - GUIA 48 BARBIERI Z275 0,50 X 3,00
000038 - GUIA "U" 2,15 BRANCO
000296 - CANTONEIRA 2530 BARBIERI Z275 0,50 X 3,00
```

---

## 📝 Padrões de Nomenclatura

### Estrutura do Nome
```
[TIPO] [MEDIDA] [MARCA] [ESPECIFICAÇÃO] [DIMENSÕES]
```

### Exemplos por Categoria

#### Perfis Metálicos
```
MONTANTE 48 BARBIERI Z120 0,48 X 3,00
GUIA 70 BARBIERI Z275 0,50 X 3,00
PERFIL STEEL GUIA 90 0,95 X 6,00
```

**Padrão:**
- Tipo: MONTANTE | GUIA | PERFIL
- Medida: 48 | 70 | 90 (altura em mm)
- Marca: BARBIERI | STEEL
- Especificação: Z120 | Z275 (galvanização)
- Dimensões: espessura x comprimento

#### Chapas
```
CHAPA GESSO 12,5MM ST 1,20 X 1,80
CHAPA GESSO 12,5MM RU 1,20 X 1,80
CHAPA CIMENTICIA INFIBRA 1,20 X 2,40 X 6MM
```

**Padrão:**
- Tipo: CHAPA GESSO | CHAPA CIMENTICIA
- Espessura: 12,5MM | 6MM | 8MM
- Tipo: ST (Standard) | RU (Resistente Umidade) | RF (Resistente Fogo)
- Dimensões: largura x altura

#### Forros PVC
```
FORRO PVC BRANCO 7MM GEMINADO 4,00M
FORRO GEMINADO NOGUEIRA BELKA 8MM 5,00M
RODAFORRO PVC BRANCO 6,00M
```

**Padrão:**
- Tipo: FORRO | RODAFORRO
- Material: PVC
- Cor: BRANCO | NOGUEIRA | JATOBA
- Marca: BELKA | PLASBIL
- Espessura: 7MM | 8MM | 10MM
- Tipo: GEMINADO | JUNTA SECA
- Comprimento: 4,00M | 5,00M | 6,00M

#### Fixadores
```
PARAFUSO 4,2 X 13 PA C\100
PARAFUSO GN 25 PB C\100
ARAME 10 GALVANIZADO
```

**Padrão:**
- Tipo: PARAFUSO | ARAME
- Dimensões: diâmetro x comprimento
- Tipo Ponta: PA (Ponta Agulha) | PB (Ponta Broca) | GN (Gypsum Nails)
- Embalagem: C\100 (caixa com 100)

---

## 🏷️ NCM - Nomenclatura Comum do Mercosul

### Principais NCMs por Categoria

#### Perfis Metálicos
```
72166110 - Perfis de ferro/aço galvanizado
72166190 - Outros perfis de ferro/aço
72162200 - Perfis pintados/esmaltados
73066100 - Tubos/perfis ocos quadrados
73089010 - Estruturas metálicas
```

#### Chapas e Placas
```
68091100 - Chapas de gesso
68091900 - Outras chapas gesso
68118200 - Chapas cimentícias
44101210 - Chapas OSB
44123900 - Chapas estruturais
```

#### PVC e Plásticos
```
39162000 - Revestimentos PVC/parede/teto
39172900 - Tubos e conexões PVC
39259090 - Artigos plásticos diversos
39191010 - Fitas plásticas autoadesivas
```

#### Fixadores
```
73181400 - Parafusos autoperfurantes
73181200 - Outros parafusos rosca madeira
73181300 - Ganchos e pitões
73089090 - Estruturas metálicas diversas
72172090 - Arames galvanizados
```

#### Materiais de Construção
```
32141010 - Massas para drywall
35061090 - Adesivos diversos
35069190 - Espumas expansivas
56031390 - Mantas e membranas
54077300 - Mantas térmicas
```

---

## ⚙️ Regras de Cadastro

### 1. Unicidade
- ✅ Cada código deve ser único no sistema
- ✅ Não reutilizar códigos de produtos descontinuados
- ✅ Manter sequência numérica crescente

### 2. Informações Obrigatórias
```sql
- code: VARCHAR(10) NOT NULL UNIQUE
- name: VARCHAR(255) NOT NULL
- ncm: VARCHAR(8) NOT NULL
- unit: VARCHAR(5) NOT NULL (UN, MT, M², KG, CT, RL, CX, PC)
- cost: DECIMAL(10,2) NOT NULL
- hasST: BOOLEAN NOT NULL (0 = Não, 1 = Sim)
- active: BOOLEAN DEFAULT 1
- group_id: INTEGER (relacionamento com product_groups)
```

### 3. Unidades de Medida Padrão
```
UN = Unidade (peça única)
MT = Metro linear
M² = Metro quadrado
KG = Quilograma
CT = Caixa (100 unidades)
CE = Caixa especial (quantidade variável)
RL = Rolo
CX = Caixa grande
PC = Peça/Conjunto
```

### 4. Dimensões no Nome
- Sempre em **metros** (não cm)
- Formato: `largura X altura X comprimento`
- Exemplo: `1,20 X 2,40` (vírgula decimal)

---

## 🔄 Processo de Importação

### Fluxo de Cadastro

```
1. Receber Nota Fiscal (XML)
   ↓
2. Extrair dados do produto:
   - código fornecedor
   - descrição completa
   - NCM
   - valor unitário
   - quantidade
   ↓
3. Verificar se produto existe:
   - Buscar por código
   - Buscar por NCM similar
   ↓
4a. Se existe: Atualizar custo
   - Registrar em product_cost_history
   - Atualizar cost em products
   - Atualizar last_purchase_date
   ↓
4b. Se não existe: Criar produto
   - Gerar novo código sequencial
   - Padronizar nome
   - Associar grupo
   - Aplicar tags automáticas
   ↓
5. Validar dados:
   - NCM válido (8 dígitos)
   - Custo > 0
   - Nome não vazio
   - Unidade válida
   ↓
6. Salvar no banco
```

---

## 📊 Exemplos de Padronização

### ANTES (Importação Bruta)
```
Perfil montante 48mm barbieri galvanizado z120 esp. 0,48mm x 3metros
```

### DEPOIS (Padronizado)
```
MONTANTE 48 BARBIERI Z120 0,48 X 3,00
```

---

### ANTES
```
Chapa gesso acartonado 12.5 standard 1200x1800
```

### DEPOIS
```
CHAPA GESSO 12,5MM ST 1,20 X 1,80
```

---

### ANTES
```
Pvc forro 7 branco gem 6mt
```

### DEPOIS
```
FORRO PVC BRANCO 7MM GEMINADO 6,00M
```

---

## 🚨 Validações Automáticas

### Ao Cadastrar/Atualizar

```javascript
// Validações obrigatórias
if (!code || !name || !ncm || !cost) {
  return error('Campos obrigatórios não preenchidos');
}

// Código único
if (existsCode(code)) {
  return error('Código já cadastrado');
}

// NCM válido (8 dígitos)
if (ncm.length !== 8 || !isNumeric(ncm)) {
  return error('NCM inválido - deve ter 8 dígitos');
}

// Custo positivo
if (cost <= 0) {
  return error('Custo deve ser maior que zero');
}

// Unidade válida
const validUnits = ['UN', 'MT', 'M²', 'KG', 'CT', 'CE', 'RL', 'CX', 'PC'];
if (!validUnits.includes(unit)) {
  return error('Unidade inválida');
}

// Nome padronizado (maiúsculas)
name = name.toUpperCase();

// Vírgula decimal em dimensões
name = name.replace(/(\d+)\.(\d+)/g, '$1,$2');
```

---

## 📝 Manutenção e Auditoria

### Histórico de Mudanças
- ✅ Toda alteração de custo é registrada
- ✅ Mantém old_cost e new_cost
- ✅ Rastreável por nota fiscal
- ✅ Identificação do fornecedor

### Revisão Periódica
- 📅 **Mensal**: Revisar produtos sem movimentação
- 📅 **Trimestral**: Atualizar tags e grupos
- 📅 **Semestral**: Limpar produtos descontinuados
- 📅 **Anual**: Validar NCMs e alíquotas

---

## 🔗 Integração com APIs

### Endpoint de Criação
```http
POST /api/products
Content-Type: application/json

{
  "code": "000999",
  "name": "PRODUTO EXEMPLO 1,20 X 2,40",
  "ncm": "72166110",
  "unit": "UN",
  "cost": 45.90,
  "hasST": 1,
  "group_id": 1
}
```

### Endpoint de Busca
```http
GET /api/products?search=GUIA 48
GET /api/product?code=000095
```

---

## ✅ Checklist de Cadastro

```
[ ] Código único e sequencial
[ ] Nome padronizado e em MAIÚSCULAS
[ ] NCM correto e válido
[ ] Unidade de medida apropriada
[ ] Custo real de compra
[ ] hasST definido corretamente
[ ] Grupo associado
[ ] Ativo = 1 (sim)
[ ] Dimensões com vírgula decimal
[ ] Nome sem caracteres especiais inválidos
```

---

**Última Atualização:** 25/11/2025
**Versão:** 1.0
**Responsável:** Desenvolvimento PLANAC
