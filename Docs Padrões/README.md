# 📚 Documentação de Padrões - PLANAC

Conjunto completo de diretrizes e padrões para o Sistema de Precificação PLANAC.

---

## 📑 Índice de Documentos

### [01 - Código de Produtos](./01-CODIGO-PRODUTOS.md)
**Padrões de codificação e nomenclatura de produtos**

- Formato de código (000XXX)
- Padrões de nomenclatura por categoria
- NCM - Nomenclatura Comum do Mercosul
- Regras de cadastro e validação
- Processo de importação
- Exemplos práticos de padronização

**Quando consultar:**
- Ao cadastrar novo produto
- Ao importar produtos de nota fiscal
- Para entender estrutura de códigos
- Para validar nomenclatura

---

### [02 - Grupos e Tags](./02-GRUPOS-TAGS.md)
**Sistema de classificação e organização de produtos**

- Hierarquia de grupos de produtos
- Sistema de tags flexível
- Regras de classificação automática
- Queries de busca e filtros
- Análise e relatórios por categoria

**Quando consultar:**
- Para classificar novos produtos
- Ao criar relatórios por categoria
- Para entender a organização do catálogo
- Ao implementar filtros de busca

---

### [03 - Margem de Lucratividade](./03-MARGEM-LUCRATIVIDADE.md)
**Cálculo de preços e margens de lucro**

- Conceitos fundamentais de precificação
- Estrutura de cálculo (custos + impostos + margem)
- Margens padrão por categoria
- Estratégias de precificação
- Sistema de alertas de margem baixa
- Exemplos práticos de cálculo

**Quando consultar:**
- Ao definir preço de venda
- Para analisar rentabilidade
- Ao revisar margens de produtos
- Para entender impacto de custos

---

### [04 - Impostos](./04-IMPOSTOS.md)
**Sistema tributário e cálculo de impostos**

- ICMS (interno e interestadual)
- Substituição Tributária (ST)
- DIFAL (diferencial de alíquota)
- PIS e COFINS
- IPI
- Cálculo completo por cenário
- CFOPs e aplicações

**Quando consultar:**
- Ao emitir nota fiscal
- Para calcular impostos na venda
- Para entender ST
- Ao validar carga tributária

---

### [05 - Fluxo de Notas Fiscais](./05-FLUXO-NOTAS.md)
**Processamento automático de NFe via email**

- Arquitetura do sistema
- Fluxo completo de processamento
- Parse de XML NFe
- Salvamento no banco de dados
- Padronização automática
- Logs e monitoramento
- Tratamento de erros

**Quando consultar:**
- Para entender o sistema de importação
- Ao troubleshooting de processamento
- Para modificar regras de importação
- Ao analisar logs de processamento

---

### [06 - Arquitetura e Workflow](./06-ARQUITETURA-WORKFLOW.md) ⭐ **NOVO**
**Visão completa do sistema e fluxos de trabalho**

- Arquitetura técnica completa
- Fluxo macro do sistema (6 etapas)
- Importação automática de NFe
- Correspondência inteligente de produtos
- Sistema de precificação em tempo real
- Gestão de tags e categorias editáveis
- Créditos de impostos e análise fiscal
- Casos de uso práticos
- APIs e integrações
- Diagrama do banco de dados

**Quando consultar:**
- Para entender o sistema como um todo
- Onboarding de novos desenvolvedores
- Ao planejar novas funcionalidades
- Para troubleshooting complexo
- Como referência arquitetural

---

## 🎯 Guias Rápidos

### Para Cadastrar Produto Manualmente

1. **Código**: Consulte [01-CODIGO-PRODUTOS.md](./01-CODIGO-PRODUTOS.md) → Seção "Padrão Oficial"
2. **Nome**: Consulte [01-CODIGO-PRODUTOS.md](./01-CODIGO-PRODUTOS.md) → Seção "Padrões de Nomenclatura"
3. **NCM**: Consulte [01-CODIGO-PRODUTOS.md](./01-CODIGO-PRODUTOS.md) → Seção "NCM - Nomenclatura Comum do Mercosul"
4. **Grupo**: Consulte [02-GRUPOS-TAGS.md](./02-GRUPOS-TAGS.md) → Seção "Estrutura de Grupos"
5. **Tags**: Consulte [02-GRUPOS-TAGS.md](./02-GRUPOS-TAGS.md) → Seção "Sistema de Tags"
6. **Impostos**: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Verificar se tem ST
7. **Preço**: Consulte [03-MARGEM-LUCRATIVIDADE.md](./03-MARGEM-LUCRATIVIDADE.md) → Calcular margem

### Para Analisar Rentabilidade

1. **Margem Atual**: Consulte [03-MARGEM-LUCRATIVIDADE.md](./03-MARGEM-LUCRATIVIDADE.md) → Seção "Análise de Rentabilidade"
2. **Carga Tributária**: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Calcular impostos
3. **Alertas**: Consulte [03-MARGEM-LUCRATIVIDADE.md](./03-MARGEM-LUCRATIVIDADE.md) → Seção "Sistema de Alertas"
4. **Comparativo**: Consulte [03-MARGEM-LUCRATIVIDADE.md](./03-MARGEM-LUCRATIVIDADE.md) → Seção "Tabelas de Referência"

### Para Processar Nota Fiscal

1. **Recebimento**: Consulte [05-FLUXO-NOTAS.md](./05-FLUXO-NOTAS.md) → Seção "Recebimento do Email"
2. **Processamento**: Consulte [05-FLUXO-NOTAS.md](./05-FLUXO-NOTAS.md) → Seção "Parse do XML NFe"
3. **Importação**: Consulte [05-FLUXO-NOTAS.md](./05-FLUXO-NOTAS.md) → Seção "Salvamento no Banco"
4. **Validação**: Consulte [01-CODIGO-PRODUTOS.md](./01-CODIGO-PRODUTOS.md) → Seção "Validações Automáticas"

### Para Emitir Nota Fiscal

1. **CFOP**: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Seção "CFOPs Principais"
2. **Impostos**: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Seção "Cálculo Completo"
3. **ST**: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Seção "Substituição Tributária"
4. **Checklist**: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Seção "Checklist Fiscal"

---

## 🔍 Busca por Assunto

### Códigos e Nomenclatura
- 📄 [01-CODIGO-PRODUTOS.md](./01-CODIGO-PRODUTOS.md)
- Formato: `000XXX`
- Padrões de nome por categoria
- NCM por tipo de produto

### Organização do Catálogo
- 📄 [02-GRUPOS-TAGS.md](./02-GRUPOS-TAGS.md)
- Grupos hierárquicos
- Tags flexíveis
- Classificação automática

### Preços e Margens
- 📄 [03-MARGEM-LUCRATIVIDADE.md](./03-MARGEM-LUCRATIVIDADE.md)
- Cálculo de markup
- Margens por categoria
- Estratégias de precificação

### Tributação
- 📄 [04-IMPOSTOS.md](./04-IMPOSTOS.md)
- ICMS, ST, DIFAL
- PIS, COFINS, IPI
- Alíquotas por UF

### Automação
- 📄 [05-FLUXO-NOTAS.md](./05-FLUXO-NOTAS.md)
- Email Routing
- Parse XML
- Cloudflare Workers

### Arquitetura e Workflow
- 📄 [06-ARQUITETURA-WORKFLOW.md](./06-ARQUITETURA-WORKFLOW.md) ⭐
- Visão geral do sistema
- Fluxo completo (importação → precificação → uso)
- Casos de uso detalhados
- Diagramas de arquitetura

---

## 📊 Diagramas de Fluxo

### Fluxo de Cadastro de Produto

```
┌─────────────────────┐
│  Receber Produto    │
│  (Manual ou NFe)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Gerar Código        │ ◄─── Doc 01
│ (Sequencial 000XXX) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Padronizar Nome     │ ◄─── Doc 01
│ (MAIÚSCULAS)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Classificar         │ ◄─── Doc 02
│ (Grupo + Tags)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Verificar Impostos  │ ◄─── Doc 04
│ (ST, NCM)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Calcular Preço      │ ◄─── Doc 03
│ (Custo + Margem)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Salvar no Banco     │
└─────────────────────┘
```

### Fluxo de Precificação

```
┌─────────────────────┐
│  Custo de Compra    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Verificar ST        │ ◄─── Doc 04
│ (hasST?)            │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │         │
    SIM       NÃO
      │         │
      ▼         ▼
  ┌───────┐ ┌─────────┐
  │ 9.25% │ │ 21.25%  │ ◄─── Doc 04
  │impostos│ │impostos │
  └───┬───┘ └────┬────┘
      │          │
      └────┬─────┘
           │
           ▼
┌─────────────────────┐
│ Despesas 32%        │ ◄─── Doc 03
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Margem Categoria    │ ◄─── Doc 03
│ (25% a 50%)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Preço de Venda     │
└─────────────────────┘
```

---

## 🔄 Ciclo de Atualização

### Diário
- Processar notas fiscais recebidas
- Atualizar custos de produtos
- Verificar alertas de margem

### Semanal
- Revisar produtos novos
- Analisar margens por categoria
- Conferir classificações automáticas

### Mensal
- Atualizar preços conforme mercado
- Revisar alíquotas de impostos
- Auditar histórico de custos

### Trimestral
- Revisar grupos e tags
- Atualizar padrões de nomenclatura
- Otimizar regras de classificação

---

## 🛠️ Para Desenvolvedores

### Implementar Nova Funcionalidade

1. **Entender o Domínio**
   - Ler documentos relevantes
   - Entender impacto nos cálculos
   - Verificar dependências

2. **Seguir os Padrões**
   - Nomenclatura: Doc 01
   - Estrutura de dados: Doc 02
   - Cálculos: Doc 03 e 04
   - Automação: Doc 05

3. **Testar Cenários**
   - Com ST e sem ST
   - Diferentes grupos
   - Margens variadas
   - Estados diferentes

4. **Documentar**
   - Atualizar doc relevante
   - Adicionar exemplos
   - Registrar decisões

### Estrutura de Banco

```sql
-- Tabelas principais
products              -- Doc 01
product_groups        -- Doc 02
product_tags          -- Doc 02
product_cost_history  -- Doc 01, 03
invoices              -- Doc 05
tax_rates             -- Doc 04

-- Relacionamentos
product_tag_assignments
```

### APIs Principais

```javascript
// Produtos
GET  /api/products
GET  /api/product?code=000095
POST /api/products
PUT  /api/products/:id

// Grupos
GET  /api/product-groups
POST /api/product-groups

// Tags
GET  /api/product-tags
POST /api/products/:id/tags

// Email (interno)
POST /email
```

---

## 📝 Convenções

### Nomenclatura de Arquivos
- Número sequencial: `01-`, `02-`, etc.
- Nome descritivo em MAIÚSCULAS
- Separado por hífen
- Extensão: `.md`

### Estrutura dos Documentos
1. Título com emoji
2. Visão geral
3. Seções principais
4. Exemplos práticos
5. Queries SQL (quando aplicável)
6. Checklist
7. Referências

### Estilo de Código
- **SQL**: MAIÚSCULAS para palavras-chave
- **JavaScript**: camelCase para variáveis
- **Comentários**: Explicar o "por quê", não o "o quê"
- **Exemplos**: Sempre incluir casos reais

---

## 🆘 Suporte

### Dúvidas Frequentes

**P: Como saber se um produto tem ST?**
R: Consulte [04-IMPOSTOS.md](./04-IMPOSTOS.md) → Seção "Substituição Tributária"

**P: Qual a margem mínima por categoria?**
R: Consulte [03-MARGEM-LUCRATIVIDADE.md](./03-MARGEM-LUCRATIVIDADE.md) → Seção "Margens por Categoria"

**P: Como padronizar o nome de um produto?**
R: Consulte [01-CODIGO-PRODUTOS.md](./01-CODIGO-PRODUTOS.md) → Seção "Padrões de Nomenclatura"

**P: Onde ver os logs de processamento?**
R: Consulte [05-FLUXO-NOTAS.md](./05-FLUXO-NOTAS.md) → Seção "Logs e Monitoramento"

### Contato

- **Desenvolvimento**: Equipe PLANAC
- **Documentação**: Atualizada em 25/11/2025
- **Versão**: 1.0

---

## 📌 Changelog

### v1.1 - 25/11/2025 (Atualização)
- ✅ **06-ARQUITETURA-WORKFLOW: Documentação completa da arquitetura**
- ✅ Análise detalhada do worker.js
- ✅ Fluxo completo: Importação → Processamento → Precificação → Análise
- ✅ Correspondência inteligente de produtos (NCM/código/nome)
- ✅ Sistema de precificação em tempo real
- ✅ Gestão de tags e categorias editáveis
- ✅ Créditos de impostos e análise fiscal
- ✅ 4 casos de uso práticos documentados
- ✅ Diagramas de arquitetura e banco de dados

### v1.0 - 25/11/2025
- ✅ Criação da documentação completa
- ✅ 01-CODIGO-PRODUTOS: Padrões de código e NCM
- ✅ 02-GRUPOS-TAGS: Sistema de classificação
- ✅ 03-MARGEM-LUCRATIVIDADE: Cálculo de preços
- ✅ 04-IMPOSTOS: Sistema tributário completo
- ✅ 05-FLUXO-NOTAS: Automação de NFe
- ✅ README: Índice e guias rápidos

---

**Mantenha esta documentação atualizada à medida que o sistema evolui!**
