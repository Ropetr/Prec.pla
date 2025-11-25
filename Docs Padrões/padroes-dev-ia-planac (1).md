# Guia Mestre de Desenvolvimento com IA
## (ERP, Sites, APIs, GitHub + Cloudflare)

Este documento define os **padrões oficiais** para usar IA como um desenvolvedor sênior em projetos de:

- ERP
- Sistemas web (painéis admin, sistemas internos)
- Sites institucionais / landing pages
- APIs
- Infraestrutura baseada em **GitHub + Cloudflare**

A ideia é simples:

> A IA deve se comportar como um dev sênior que já conhece nossa arquitetura, stack, estilo de código, integrações e fluxo de trabalho.  
> Você só adiciona o contexto do projeto e a tarefa específica.

Este guia também define que:

- **Desde o início do projeto** deve existir um **Mapa de Fluxo de Trabalho do Sistema** (visão dos fluxos principais).
- **A cada alteração relevante aprovada**, esse mapa deve ser **revisto e atualizado**, mantendo o sistema sempre documentado.

---

## 0. Regras Globais de Integração e Fluxo de Trabalho (Obrigatórias para a IA)

Sempre que a IA for **criar ou alterar qualquer parte do sistema**, ela deve seguir estas regras ANTES de responder.

### 0.1. Levantamento de Dependências e Integrações Afetadas

Antes de gerar código ou ajustes, a IA deve:

1. **Listar explicitamente**:
   - Módulos de negócio afetados  
     > Ex.: Vendas, Estoque, Financeiro, Fiscal, Usuários, Relatórios, Integrações…
   - Integrações externas envolvidas  
     > Ex.: gateway de pagamento, serviços fiscais, APIs de parceiros, etc.
   - Recursos de infraestrutura envolvidos  
     > Ex.: Cloudflare Workers, Pages, D1, KV, R2, Durable Objects.
   - Frontends impactados  
     > Ex.: painel ERP Admin, site institucional X, landing Y.

2. Se nada relevante for impactado, a IA deve escrever claramente:
   > **“Nenhuma integração relevante impactada.”**

Isso evita “mexer num lado e esquecer o outro”.

---

### 0.2. Consulta ao Mapa de Arquitetura

A IA deve usar o mapa da seção **0.5** para:

- Dizer **exatamente em quais “caixas” do diagrama** a mudança atua.
- Justificar, quando criar novos componentes ou serviços, **onde eles entram** nesse mapa.

Exemplo esperado na resposta da IA:

> “Esta alteração impacta a caixa `[Cloudflare Workers API]` no módulo de `[Financeiro]` e a tabela `[contas_receber]` no `[Cloudflare D1]`, além da tela `[Lista de Recebíveis]` no frontend ERP (Cloudflare Pages).”

---

### 0.3. Checklist de Impacto de Integração (Obrigatório no Final da Resposta)

Ao final de **toda resposta que envolva criação ou alteração de código/arquitetura**, a IA deve:

1. Incluir o **Checklist de Impacto** da seção **0.6**.
2. Marcar `[X]` nos itens de fato impactados.
3. Para cada item marcado, explicar rapidamente:
   - O que foi impactado,
   - Como a compatibilidade foi mantida,
   - Se são necessários ajustes em testes, migrações de banco ou configurações.

Se nada for impactado, o checklist deve aparecer totalmente desmarcado, com observação do tipo:

> “Nenhum item marcado: a alteração é isolada e não afeta integrações nem contratos existentes.”

---

### 0.4. Consideração do Fluxo GitHub + CI/CD

A IA deve **sempre assumir** que:

- O código vive em **repositórios GitHub**.
- O deploy é feito via **GitHub Actions** para Cloudflare (Pages/Workers).
- Quebras de integração podem:
  - Falhar o build,
  - Falhar os testes,
  - Impedir o deploy.

Por isso, ao sugerir mudanças, a IA deve:

- Avisar se alguma alteração:
  - Pode quebrar testes existentes,
  - Requer novos testes,
  - Exige migração de banco (nova tabela, nova coluna, mudança de tipo),
  - Exige update em arquivos de configuração (`wrangler.toml`, `.env.example`, secrets, etc.).

Exemplo de resposta esperada:

> “Como adicionamos uma nova coluna `limite_credito` à tabela `clientes`, é necessária uma migração no D1 e atualização dos testes que verificam a criação de clientes.”

---

### 0.5. Mapa de Arquitetura e Integrações (Visão Texto)

Este mapa é a visão geral de **como o sistema se encaixa**.  
A IA deve usá-lo como referência ao analisar impacto.

```text
[Frontends]
  - Web ERP / Painel Admin (React em Cloudflare Pages)
  - Sites Institucionais / Landing Pages (React/Static em Cloudflare Pages)

                ↓ consomem

[Camada de API - Cloudflare Workers (/api/v1/...)]
  - Autenticação e Autorização
  - Módulos ERP:
      • Cadastros (Clientes, Fornecedores, Produtos, Usuários, etc.)
      • Estoque
      • Financeiro (contas a pagar/receber, fluxo de caixa)
      • Fiscal (CFOP, NCM, regras tributárias, docs fiscais)
      • Relatórios / Integrações
  - Integrações Externas:
      • Gateway de Pagamento
      • Serviços Fiscais (NFe/NFSe, se aplicável)
      • CRMs, ERPs de terceiros, etc.

[Camada de Dados]
  - Cloudflare D1     → banco relacional principal (ERP Core)
  - Cloudflare KV     → configs simples, cache, chave/valor
  - Cloudflare R2     → arquivos (PDFs, imagens, anexos)
  - Durable Objects   → estado avançado (sessões, locks, filas), se usado

[Infra e Automação]
  - Repositórios GitHub (ERP, Admin, Sites, Bibliotecas)
  - GitHub Actions (build, testes, deploy automático)
  - Secrets e variáveis de ambiente (GitHub + Cloudflare)
```

Este mapa pode evoluir com o tempo.  
Quando novas peças forem adicionadas (ex.: “Módulo de Cursos”, “Chatbot de vendas”), elas devem ser posicionadas aqui.

---

### 0.6. Checklist de Impacto de Integração (Modelo Oficial)

Checklist que a IA deve **sempre anexar** ao final de qualquer alteração:

```markdown
## Checklist de Impacto de Integração

- [ ] Frontend (React / Cloudflare Pages)
- [ ] Cloudflare Workers API (rotas, contratos, middlewares)
- [ ] Banco Cloudflare D1 (tabelas, migrações, queries)
- [ ] Cloudflare KV (estruturas chave/valor)
- [ ] Cloudflare R2 (armazenamento de arquivos)
- [ ] Durable Objects (sessões, locks, estado)
- [ ] Gateway de Pagamento
- [ ] Serviços Fiscais (NFe/NFSe ou similares)
- [ ] Outras Integrações Externas
- [ ] Pipeline CI/CD (GitHub Actions)
- [ ] Arquivos de Configuração (wrangler, env, etc.)
- [ ] Documentação (README, docs de API, diagramas, mapa de fluxo)

Para cada item marcado com [X], explicar em 1–3 frases:
- O que foi impactado;
- Como a compatibilidade foi mantida;
- Se são necessários ajustes em testes, migrações ou configs.
```

---

### 0.7. Mapa de Fluxo de Trabalho do Sistema (Obrigatório e Vivo)

Além do **Mapa de Arquitetura** (seção 0.5), o projeto deve manter um **Mapa de Fluxo de Trabalho** (workflow) que descreve **como o sistema é usado na prática**, passo a passo.

#### 0.7.1. Onde esse mapa vive?

Recomendação:

- Criar uma pasta de documentação (por exemplo, `docs/`).
- Arquivo principal (exemplo):
  - `docs/fluxo-trabalho-visao-geral.md`  

Na raiz do repositório, o `README.md` deve apontar para esse arquivo.

#### 0.7.2. Como esse mapa é estruturado?

Sugestão de estrutura:

```markdown
# Mapa de Fluxo de Trabalho - Visão Geral

## 1. Fluxo: Cadastro e Venda

1. Usuário acessa o Painel ERP (Cloudflare Pages).
2. Faz login (autenticação via Cloudflare Workers / módulo Auth).
3. Acessa módulo de Clientes e cadastra um novo cliente.
4. Acessa módulo de Produtos e cadastra produtos.
5. Vai até módulo de Vendas:
   - Cria um pedido,
   - Seleciona cliente,
   - Adiciona produtos,
   - Define condições de pagamento.
6. Sistema:
   - Atualiza estoque no D1,
   - Cria lançamentos financeiros,
   - (Opcional) Aciona integração com gateway de pagamento.
```

Você pode descrever:

- Fluxos por módulo (Vendas, Compras, Estoque, Financeiro…),
- Fluxos específicos (Ex.: separação, faturamento, entrega),
- Fluxos de APIs (Ex.: integração ERP ↔ outro sistema).

#### 0.7.3. Regra: Criar o mapa no início do projeto

No início de um projeto:

- A IA deve ser instruída a **gerar a primeira versão** desse mapa, mesmo que simples.
- Essa versão inicial documenta:
  - Fluxos principais que o MVP vai cobrir,
  - Módulos que existirão inicialmente.

#### 0.7.4. Regra: Atualizar o mapa a cada alteração relevante

Depois que uma alteração é:

- **Planejada**,  
- **Implementada**,  
- **Revisada e aprovada**,

deve-se:

1. Verificar se ela impacta algum fluxo de trabalho já mapeado.
2. Atualizar o mapa de fluxo:
   - Ajustar passos,
   - Adicionar novos fluxos,
   - Atualizar integrações.

Papel da IA:

- Sempre que você pedir uma modificação que altere comportamento (novos passos, novas integrações, telas, rotas, etc.), a IA deve:
  - Explicar **como isso muda o fluxo de trabalho** relacionado,
  - Sugerir a atualização do `docs/fluxo-trabalho-visao-geral.md` com trechos de Markdown prontos pra você colar e commitar.

Padrão a ser seguido pela IA ao final da resposta:

> “Esta alteração impacta o fluxo `[Nome do Fluxo]`.  
> Segue abaixo a versão atualizada da seção correspondente do mapa de fluxo de trabalho, em Markdown, para você substituir no arquivo `docs/fluxo-trabalho-visao-geral.md`.”

Assim, o mapa **não fica velho**: ele evolui com o sistema.

---

## 1. Visão Geral do Padrão com IA

Objetivo: transformar a IA em um **dev sênior da casa**, que:

- Conhece sua stack (GitHub + Cloudflare),
- Conhece seu estilo de arquitetura (camadas, REST, etc.),
- Sabe da existência de mapas (arquitetura + fluxos),
- Usa checklist para garantir que nada seja esquecido.

Sua rotina passa a ser:

1. Copiar (ou referenciar) este guia no início da conversa com a IA (ou ter um resumo salvo).
2. Informar:
   - Qual projeto (ERP, admin, site, API),
   - Qual módulo,
   - Qual tarefa.
3. Exigir:
   - Código organizado,
   - Explicação de impacto,
   - Checklist preenchido,
   - Sugestão de atualização do mapa de fluxos quando fizer sentido.

---

## 2. Stack Padrão

### 2.1. Repositórios (GitHub)

Organização sugerida:

- `erp-core` → backend ERP (Cloudflare Workers + D1 + integrações).
- `erp-admin` → painel web (React em Cloudflare Pages).
- `sites-institucionais` → sites/landings.
- `bibliotecas-compartilhadas` (opcional).

### 2.2. Infraestrutura (Cloudflare)

- **Cloudflare Pages**  
  - Hospedar os frontends (ERP Admin, sites, landings).
- **Cloudflare Workers**  
  - APIs REST (`/api/v1/...`).
- **Cloudflare D1**  
  - Banco relacional principal (ERP).
- **Cloudflare KV**  
  - Configs rápidas, cache, feature flags simples.
- **Cloudflare R2**  
  - Arquivos (notas, PDFs, imagens).
- **Durable Objects**  
  - Estado avançado: fila, sessões especiais, locks de recursos, etc.

---

## 3. Padrões de Prompt (Biblioteca)

### 3.1. Persona da IA

Persona padrão:

> “Você é um desenvolvedor sênior full-stack especializado em ERP, APIs REST e front-end moderno (React), usando GitHub, Cloudflare Workers, Cloudflare Pages, D1, KV, R2 e GitHub Actions para CI/CD.”

### 3.2. Forma de Todo Prompt de Desenvolvimento

Estrutura recomendada:

1. **Contexto do projeto**  
2. **Tarefa específica**  
3. **Relembrar regras de integração e fluxos (seção 0)**  
4. **Formato de saída esperado** (apenas código, código + explicação, etc.).

Exemplo genérico:

> “Contexto: [descrição].  
> Siga a seção 0 do nosso guia (integrações + checklist + mapa de fluxos).  
> Tarefa: [detalhar].  
> Formato: resumo + código organizado por arquivo + sugestão de update de mapa de fluxo (se existir impacto) + checklist de impacto.”

### 3.3. Templates de Prompt

#### a) Criação/alteração de função

> “Implemente/refatore a função `[NOME_FUNCAO]` em `[LINGUAGEM]`.  
> Ela recebe `[PARÂMETROS]` e deve `[DESCRIÇÃO DA LÓGICA]`.  
> Siga as camadas domain/application/infrastructure se aplicável.  
> Responda apenas com o código, acompanhado do checklist de impacto (mesmo que tudo N/A).”

#### b) Endpoint de API (ERP)

> “Crie/alterar um endpoint REST em Cloudflare Workers (TypeScript) para `[RECURSO]`:  
> - Rota: `[MÉTODO] /api/v1/[rota]`  
> - Entrada: `[body / query / params]`  
> - Saída: `[estruturar JSON]`  
> Use camadas domain/application/infrastructure, siga o padrão de resposta `{ success, data, error }`.  
> Indique impactados no mapa de arquitetura e atualize o checklist.  
> Se o fluxo de trabalho for afetado, forneça o trecho de atualização para `docs/fluxo-trabalho-visao-geral.md`.”

#### c) Tela React (ERP ou site)

> “Crie uma tela React para `[FUNÇÃO]` da entidade `[ENTIDADE]`, consumindo o endpoint `[URL]`.  
> Inclua:
> - Lista com paginação,
> - Filtros básicos,
> - Botões para criar/editar/excluir (se aplicável).  
> Prepare para rodar em Cloudflare Pages.  
> No final, preencha o checklist de impacto e, se a UX do fluxo mudar, sugira atualização do mapa de fluxo.”

---

## 4. Padrões de Arquitetura e Código (ERP/APIs)

### 4.1. Arquitetura em Camadas

Sempre dividir:

- `domain`
  - Entidades,
  - Regras de negócio puras.
- `application`
  - Use cases (casos de uso),
  - Orquestra fluxo de negócio.
- `infrastructure`
  - Implementações de repositórios,  
  - Handlers HTTP (Workers),  
  - Integrações externas,  
  - Configurações.

Regra importante:

> Nada em `domain` deve conhecer HTTP, Workers, D1 ou Cloudflare.  
> `domain` só conhece regras de negócio.

### 4.2. APIs REST

Padrão de rota:

- `/api/v1/...` (pode evoluir para v2, v3).

Formato de resposta:

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

Erros:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR_CODIGO",
    "message": "Mensagem amigável"
  }
}
```

Paginação:

- Query params: `page`, `pageSize`.
- Resposta: `items`, `total`, `page`, `pageSize`.

---

## 5. Padrões Específicos de ERP

Módulos mínimos:

- **Cadastros**
  - Clientes, Fornecedores, Produtos, Usuários, Empresas, Tabelas auxiliares.
- **Estoque**
  - Saldo por local,
  - Movimentações,
  - Inventários.
- **Financeiro**
  - Contas a pagar/receber,
  - Centros de custo (se aplicável),
  - Integração com bancos/gateways (futuro).
- **Fiscal**
  - CFOP, NCM,
  - Regras de tributação (pode começar simplificado).
- **Relatórios**
  - Resumos de vendas, estoque, financeiros.

Para cada entidade nova:

> “Para a entidade `[NOME]`, gere:
> - Modelo de domínio,  
> - Interface de repositório + implementação em D1,  
> - Casos de uso (create, update, delete, list, getById),  
> - Endpoints HTTP correspondentes,  
> - Esquema SQL (migração D1),  
> - Testes unitários básicos,  
> - Atualização do mapa de fluxo de trabalho (quando ela fizer parte de um fluxo),  
> - Checklist de impacto.”

---

## 6. Padrões para Sites (Institucionais/Landings)

Stack:

- React (ou framework definido) em Cloudflare Pages.

Requisitos:

- Responsivo.
- SEO básico.
- Acessibilidade mínima.
- Componentes compartilháveis (Button, Card, Layout).

É opcional manter um **mapa de fluxos de navegação** (similar ao ERP), mas recomendado em projetos maiores de marketing.

---

## 7. DevOps (GitHub + Cloudflare + CI/CD)

### 7.1. GitFlow simplificado

- Branch principal: `main`.
- Branches de feature: `feature/nome-da-feature`.

### 7.2. GitHub Actions

Arquivos do tipo:

- `.github/workflows/deploy.yml`

Responsabilidades:

- Instalar dependências;
- Rodar testes;
- Buildar;
- Deploy em Cloudflare Pages/Workers usando secrets.

A IA nunca deve colocar valores reais de tokens, apenas placeholders:

```yaml
${{ secrets.CF_API_TOKEN }}
${{ secrets.CF_ACCOUNT_ID }}
${{ secrets.CF_PROJECT_NAME }}
```

---

## 8. Segurança e Segredos

Regras fixas:

- Nunca expor tokens ou chaves reais em código, documentação ou respostas.
- Sempre usar:
  - `secrets` do GitHub Actions,
  - Variáveis de ambiente configuradas no Cloudflare.

Quando a IA precisar de credenciais:

> Ela deve apenas dizer:  
> “Crie um secret no GitHub chamado `NOME_DO_SECRET` contendo a chave de API do serviço X.”

---

## 9. Documentação

### 9.1. README

Todo projeto deve ter um `README.md` com:

- Descrição do projeto,
- Stack utilizada,
- Como rodar localmente,
- Como rodar testes,
- Como funciona o deploy,
- Links para:
  - Mapa de Arquitetura (se houver arquivo separado),
  - Mapa de Fluxo de Trabalho (arquivo obrigatório mencionado em 0.7),
  - Este guia mestre (`docs/padroes-dev-ia-planac.md`).

### 9.2. Documentação de API

Pode ser:

- Arquivo `openapi.yml`, ou
- Documento Markdown com endpoints listados.

### 9.3. Mapa de Fluxo de Trabalho (reforço)

- Arquivo obrigatório:  
  - `docs/fluxo-trabalho-visao-geral.md`.
- Criado no início do projeto.
- Atualizado a cada alteração relevante.

---

## 10. Testes

- Testes unitários para regras de negócio (`domain` e `application`).
- Testes de integração para API (`infrastructure`).
- A IA deve sugerir testes sempre que alterar regras críticas:
  - Cálculos,
  - Validações,
  - Integrações.

---

## 11. Prompts Mestre (Modelos)

### 11.1. Prompt Mestre Geral

Use este prompt como “modelo base”:

```text
Contexto:
Você é um desenvolvedor sênior full-stack especializado em ERP, APIs REST e front-end moderno (React), usando GitHub, Cloudflare Workers, Cloudflare Pages, D1, KV, R2 e GitHub Actions para CI/CD.

Siga rigorosamente a seção 0 do nosso guia interno:
- Levantar dependências e integrações afetadas;
- Indicar impacto no mapa de arquitetura;
- Considerar CI/CD (GitHub Actions);
- Preencher o Checklist de Impacto de Integração;
- Atualizar (ou sugerir atualização) do Mapa de Fluxo de Trabalho quando o comportamento do sistema mudar.

Projeto:
[Descreva aqui o sistema: ERP principal, painel admin, site X, etc.]

Tarefa agora:
[Ex.: “Criar endpoint de criação de pedido com integração ao gateway de pagamento X, mantendo compatibilidade com o front atual e com o módulo de financeiro.”]

Formato da resposta:
1. Lista das dependências/integrações/partes do sistema impactadas.
2. Explicação rápida de onde isso aparece no mapa de arquitetura.
3. Código completo (novos arquivos ou alterações), organizado por arquivo.
4. Orientações de migração (banco, configs, testes).
5. Sugestão de atualização do mapa de fluxo de trabalho (se aplicável), em Markdown.
6. Checklist de Impacto de Integração preenchido.
```

---

### 11.2. Prompt para Criar o Mapa Inicial de Fluxo de Trabalho

Use isto **no início de um projeto**:

```text
Contexto:
Estamos iniciando um novo projeto de ERP/sistema com a arquitetura definida no nosso guia mestre (Cloudflare, GitHub, etc.).

Quero que você, IA, gere a PRIMEIRA VERSÃO do documento:
`docs/fluxo-trabalho-visao-geral.md`

Este documento deve:
- Descrever os principais fluxos de trabalho do sistema (do ponto de vista do usuário);
- Conectar cada fluxo aos módulos (Cadastros, Estoque, Financeiro, Fiscal, etc.);
- Referenciar, quando fizer sentido, a API (Workers) e o banco (D1), mas sem entrar em detalhes técnicos demais;
- Ser escrito em Markdown, pronto para ser salvo no repositório.

Fluxos mínimos que devem aparecer:
- Fluxo de cadastro de clientes e produtos;
- Fluxo de criação de vendas/pedidos;
- Fluxo de baixa/atualização de estoque;
- Fluxo de contas a receber;
- Fluxos adicionais se fizer sentido (compras, etc.).

Formato da resposta:
- Apenas o conteúdo completo do arquivo `docs/fluxo-trabalho-visao-geral.md` em Markdown.
```

---

### 11.3. Prompt para Atualizar o Mapa de Fluxo de Trabalho

Use sempre que uma alteração mexer com o fluxo:

```text
Contexto:
Vamos fazer/avaliar uma alteração que impacta o fluxo de trabalho do sistema.

Considere que já existe o arquivo `docs/fluxo-trabalho-visao-geral.md`.  
Descreva:
1. Como a alteração impacta os fluxos já existentes.
2. Se cria um novo fluxo.

Depois, gere:
- O trecho atualizado do(s) fluxo(s) impactado(s), em Markdown,
- E indique claramente:
  - Qual seção deve ser substituída,
  - Ou se é um fluxo novo a ser adicionado.

Formato:
1. Explicação textual do impacto.
2. Bloco(s) de Markdown do conteúdo atualizado.
3. Checklist de Impacto de Integração preenchido.
```

---

_Fim do documento._
