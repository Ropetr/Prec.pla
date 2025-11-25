# Mapa de Fluxo de Trabalho - Visão Geral do ERP

Este documento descreve, em alto nível, **como o ERP é utilizado na prática**.  
Ele deve ser atualizado sempre que houver mudanças relevantes nos fluxos.

---

## 1. Fluxo: Acesso ao Sistema (Login)

1. Usuário acessa o endereço do Painel ERP (Cloudflare Pages).
2. Na tela de login, informa e-mail/usuário e senha.
3. O frontend envia as credenciais para a API `/api/v1/auth/login` (Cloudflare Workers).
4. A API:
   - Valida as credenciais no banco D1 (tabela de usuários),
   - Gera um token de sessão (JWT ou similar),
   - Retorna o token e dados básicos do usuário (nome, perfil, permissões).
5. O frontend armazena o token em local seguro (ex.: memória/HTTP-only cookie).
6. A partir daí, todas as requisições à API são autenticadas via token.

---

## 2. Fluxo: Cadastro de Cliente

1. Usuário logado acessa o módulo **Clientes** no painel ERP.
2. Clica em **“Novo Cliente”**.
3. Preenche dados principais:
   - Nome/Razão Social,
   - CPF/CNPJ,
   - Endereço,
   - Contato (telefone, e-mail),
   - Tipo de cliente (revenda, consumidor final, construtora, etc.).
4. Ao salvar, o frontend envia os dados para a API `/api/v1/clientes` (método POST).
5. A API:
   - Valida os campos obrigatórios,
   - Verifica duplicidades (CPF/CNPJ já cadastrado),
   - Grava o registro na tabela `clientes` do D1,
   - Retorna o cliente criado.
6. O frontend:
   - Exibe mensagem de sucesso,
   - Atualiza a lista de clientes.

---

## 3. Fluxo: Cadastro de Produto (Placas, Perfis, Acessórios etc.)

1. Usuário acessa o módulo **Produtos**.
2. Clica em **“Novo Produto”**.
3. Informa:
   - Descrição do produto (ex.: “Placa de gesso ST 12,5mm 1,80x1,20”),
   - Categoria (placas, perfis, parafusos, acessórios, etc.),
   - Unidade (m², peça, caixa, etc.),
   - Código interno / SKU,
   - NCM, CFOP padrão (se definido),
   - Preço de custo (opcional, pode vir de compras),
   - Aliquotas ou regras fiscais básicas (se configuradas).
4. Frontend envia para `/api/v1/produtos` (POST).
5. API valida e grava na tabela `produtos` (D1).
6. Produto passa a aparecer em:
   - Listagens de produtos,
   - Tela de vendas,
   - Rotinas de estoque.

---

## 4. Fluxo: Cadastro de Tabela de Preços (Opcional, se existir)

1. Usuário acessa o módulo **Tabelas de Preço**.
2. Cria uma nova tabela (ex.: “Atacado”, “Varejo”, “Construtoras”).
3. Define regras:
   - Markup sobre custo,
   - Descontos por categoria,
   - Políticas específicas de clientes.
4. Ao salvar:
   - Grava registro em `tabelas_preco`,
   - Relaciona com clientes ou grupos de clientes, se aplicável.

*(Este fluxo pode ser expandido conforme necessidade.)*

---

## 5. Fluxo: Entrada de Estoque (Compra/Recebimento)

1. Usuário acessa o módulo **Compras** ou **Entradas**.
2. Clica em **“Nova Entrada”**.
3. Informa:
   - Fornecedor,
   - Data da compra ou recebimento,
   - Número da nota (se houver integração fiscal, futuramente),
   - Itens comprados (produto, quantidade, custo unitário).
4. Ao salvar:
   - Frontend envia dados para endpoint `/api/v1/estoque/entradas`.
5. API:
   - Valida fornecedor e produtos,
   - Registra movimento de entrada na tabela `movimentos_estoque` (D1),
   - Atualiza saldo em `estoques` (por local, se houver múltiplos armazéns),
   - (Opcional) Gera lançamentos financeiros em **Contas a Pagar**.
6. Estoque do produto é atualizado e passa a refletir a nova quantidade disponível.

---

## 6. Fluxo: Venda / Orçamento

### 6.1. Criação de Orçamento

1. Usuário acessa o módulo **Vendas** → **Orçamentos**.
2. Clica em **“Novo Orçamento”**.
3. Seleciona cliente ou cadastra um novo na hora.
4. Adiciona itens:
   - Produto,
   - Quantidade,
   - Preço unitário (baseado na tabela de preço do cliente ou preço padrão),
   - Descontos (se houver).
5. Sistema calcula:
   - Subtotal,
   - Descontos,
   - Total final.
6. Ao salvar:
   - Frontend envia para `/api/v1/orcamentos` (POST).
7. API grava orçamento em `orcamentos` + `orcamentos_itens` no D1.

### 6.2. Conversão de Orçamento em Pedido

1. Usuário abre um orçamento aprovado pelo cliente.
2. Clica em **“Converter em Pedido”**.
3. Sistema:
   - Copia dados do orçamento para `pedidos` + `pedidos_itens`,
   - Mantém relação entre orçamento e pedido.
4. Estoque **pode ser reservado** (se houver lógica de reserva).
5. Caso haja integração com gateway de pagamento, podem ser geradas:
   - Condições de pagamento,
   - Links de cobrança.

---

## 7. Fluxo: Faturamento / Saída de Estoque

1. Usuário acessa módulo **Vendas** → **Pedidos**.
2. Seleciona um pedido com status “Aprovado”.
3. Clica em **“Faturar / Dar Saída”**.
4. Sistema:
   - Confere disponibilidade de estoque,
   - Gera movimento de saída em `movimentos_estoque`,
   - Atualiza saldo em `estoques`.
5. (Futuro) Se houver integração fiscal:
   - Gera NFe,
   - Envia para SEFAZ,
   - Registra chave da nota no pedido.
6. (Financeiro) Gera lançamentos de **Contas a Receber** de acordo com as condições de pagamento.

---

## 8. Fluxo: Contas a Receber

1. Usuário acessa módulo **Financeiro** → **Contas a Receber**.
2. Visualiza lista de títulos (boletos, cartões, pix, etc.) originados de:
   - Pedidos faturados,
   - Lançamentos manuais (se houver).
3. Ao receber um pagamento:
   - Seleciona o título,
   - Clica em **“Registrar Recebimento”**.
4. Sistema:
   - Atualiza status do título para recebido,
   - Registra movimento de caixa/banco,
   - Disponibiliza informações para relatórios financeiros.

Se houver integração com gateway de pagamento:

- A baixa pode ser realizada automaticamente por webhooks,
- Ou por conciliação manual/semi-automática.

---

## 9. Fluxo: Relatórios de Estoque e Vendas

1. Usuário acessa módulo **Relatórios**.
2. Pode gerar:
   - Relatório de estoque atual (por produto / local),
   - Relatório de vendas por período, cliente, produto,
   - Relatório financeiro (recebimentos x inadimplência básica).
3. Tela de filtros → Chamada de endpoints tipo:
   - `/api/v1/relatorios/estoque`,
   - `/api/v1/relatorios/vendas`,
   - `/api/v1/relatorios/financeiro`.
4. API faz consultas em D1 e retorna dados já agregados ou formatados.

---

## 10. Fluxos Adicionais (a serem detalhados)

Os fluxos abaixo podem ser detalhados conforme o sistema evoluir:

- Compras avançadas (pedidos de compra, cotações, aprovação).
- Integração fiscal completa (NFe de saída, NFSe, importação XML de compra).
- Integrações externas (marketplaces, plataformas de e-commerce).
- Módulo de logística (controle de fretes, roteirização, etc.).
- Módulo de contratos/empreendimentos (para construtoras).

---

## 11. Manutenção e Atualização deste Documento

- Este arquivo deve ser **criado no início do projeto**.
- A cada alteração relevante no ERP:
  - Avaliar se um fluxo existente foi alterado,
  - Atualizar a descrição do fluxo,
  - Ou criar um novo fluxo.

Quando a IA sugerir mudanças de comportamento, ela deve:

- Explicar **quais fluxos são afetados**,
- Fornecer trechos em Markdown para atualização desta documentação.

_Fim do documento._
