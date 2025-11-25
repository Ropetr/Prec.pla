# Projeto ERP / Plataforma Web

Este repositório contém o código de um sistema ERP e/ou painel admin/sistema web, desenvolvido com apoio de IA, seguindo uma arquitetura padronizada baseada em:

- **GitHub** para versionamento e CI/CD
- **Cloudflare Workers** para APIs
- **Cloudflare Pages** para frontends (React ou similar)
- **Cloudflare D1, KV, R2 e Durable Objects** para dados e estado

> Toda a interação com IA para desenvolvimento deste projeto segue os padrões definidos em  
> `docs/padroes-dev-ia-planac.md`.

---

## 📚 Documentação Principal

- **Padrões de Desenvolvimento com IA**  
  `docs/padroes-dev-ia-planac.md`  
  Contém:
  - Regras de integração,
  - Stack padrão,
  - Arquitetura,
  - Padrões de ERP, APIs, sites,
  - Prompts mestre,
  - Regras de atualização de mapas.

- **Mapa de Fluxo de Trabalho do Sistema (Visão de Negócio)**  
  `docs/fluxo-trabalho-visao-geral.md`  
  Contém:
  - Passo a passo dos fluxos principais do ERP (cadastro, venda, estoque, financeiro),
  - Referência entre módulos e comportamento do sistema,
  - Deve ser atualizado a cada alteração relevante.

---

## 🧱 Arquitetura (Resumo)

- **Frontends**
  - Painel ERP / Admin (React) → hospedado em Cloudflare Pages.
  - Sites institucionais ou landings (quando aplicável).

- **Backend / APIs**
  - Cloudflare Workers expondo endpoints REST em `/api/v1/...`.

- **Banco de Dados e Armazenamento**
  - Cloudflare D1 → banco relacional principal (ERP).
  - Cloudflare KV → configs e cache simples.
  - Cloudflare R2 → arquivos (PDFs, imagens, anexos).
  - Durable Objects (quando necessário) → estado avançado.

- **DevOps**
  - Repositório GitHub.
  - Workflows em `.github/workflows/*.yml` para:
    - Testes,
    - Build,
    - Deploy automático para Cloudflare.

Mais detalhes em: `docs/padroes-dev-ia-planac.md`.

---

## 🚀 Como Rodar Localmente

> Os passos exatos podem variar conforme a estrutura do projeto (monorepo, múltiplos apps etc.).  
> Ajuste esta seção conforme o projeto real.

### 1. Pré-requisitos

- Node.js (versão compatível com o projeto)
- npm ou pnpm/yarn
- Wrangler CLI (se usar Cloudflare Workers localmente)

### 2. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO
```

### 3. Instalar dependências

```bash
npm install
# ou
pnpm install
```

### 4. Rodar ambiente de desenvolvimento

Exemplo para frontend:

```bash
npm run dev
```

Exemplo para backend Workers (ajustar conforme o projeto):

```bash
npm run dev:workers
```

---

## ✅ Testes

Execute os testes com:

```bash
npm test
```

Ou conforme o script definido em `package.json`.

Testes importantes:

- Unitários para regras de negócio (camada `domain`/`application`).
- Integração para endpoints (camada `infrastructure`).

---

## 🔁 CI/CD (GitHub Actions + Cloudflare)

- Ao fazer **push** na branch `main` (ou outra definida):
  - Os workflows em `.github/workflows/` são disparados.
  - São executados:
    - Testes,
    - Build,
    - Deploy para Cloudflare Workers/Pages.

Secrets sensíveis (tokens de API, etc.) **não** devem aparecer no código.  
Eles devem estar configurados como:

- `secrets` no GitHub Actions,
- Variáveis de ambiente no painel do Cloudflare.

---

## 🤖 Uso de IA neste Projeto

Este projeto é desenvolvido com suporte constante de IA seguindo as regras:

- Sempre que a IA gerar ou alterar código:
  - Deve listar dependências e integrações impactadas.
  - Deve indicar o impacto no mapa de arquitetura.
  - Deve preencher o **Checklist de Impacto de Integração**.
  - Deve sugerir atualizações no `docs/fluxo-trabalho-visao-geral.md` quando o fluxo de trabalho for alterado.

Todos os detalhes estão em:  
`docs/padroes-dev-ia-planac.md`

---

## 📌 Manutenção da Documentação

- Atualizar `docs/fluxo-trabalho-visao-geral.md` sempre que:
  - Novos módulos forem adicionados,
  - Fluxos existentes forem alterados.

- Ajustar `docs/padroes-dev-ia-planac.md` quando:
  - A stack evoluir,
  - Novas regras de arquitetura e integrações forem definidas.

---

_Fim do README._
