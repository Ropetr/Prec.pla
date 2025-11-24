<<<<<<< HEAD
# 🏗️ Sistema de Precificação PLANAC

Sistema completo de precificação com cálculo tributário, gestão de produtos e integração com notas fiscais.

## 📦 Arquivos Incluídos

- `index.html` - Sistema principal com dashboard e login
- `scanner.html` - Scanner de emails para importação de XMLs
- `worker.js` - Backend Worker para Cloudflare
- `tema-planac.css` - Tema visual oficial PLANAC
- `wrangler.toml` - Configuração do Cloudflare Worker

## 🚀 Deploy Rápido (Cloudflare Pages)

### Opção 1: Upload Direto (Mais Simples)

1. **Acesse o Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com
   ```

2. **Crie um novo projeto**
   - Vá em `Workers & Pages`
   - Clique em `Create application`
   - Escolha `Pages`
   - Clique em `Upload assets`

3. **Faça upload dos arquivos**
   - Arraste o arquivo `index.html`
   - Ou faça upload da pasta inteira

4. **Configure o domínio**
   - Nome do projeto: `planac-sistema`
   - URL gerada: `planac-sistema.pages.dev`

5. **Deploy!**
   - Clique em `Deploy site`
   - Pronto! Sistema online em segundos

### Opção 2: Via GitHub (Recomendado)

1. **Crie um repositório no GitHub**
   ```bash
   # Inicialize o git
   git init
   
   # Adicione os arquivos
   git add .
   
   # Commit inicial
   git commit -m "Sistema PLANAC - Deploy inicial"
   
   # Crie o repositório no GitHub
   # Vá em github.com/new
   # Nome: planac-sistema
   
   # Conecte ao repositório
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/planac-sistema.git
   git push -u origin main
   ```

2. **Conecte ao Cloudflare Pages**
   - No Cloudflare Dashboard
   - `Workers & Pages` > `Create application` > `Pages`
   - `Connect to Git`
   - Autorize o GitHub
   - Selecione o repositório `planac-sistema`

3. **Configure o build**
   ```
   Build command: (deixe vazio)
   Build output directory: /
   Root directory: /
   ```

4. **Deploy automático**
   - Toda alteração no GitHub atualiza o site automaticamente

## 🔧 Deploy do Worker (Backend)

Para funcionalidades avançadas como scanner de emails:

1. **Instale o Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Configure suas credenciais**
   ```bash
   wrangler login
   ```

3. **Configure o banco D1**
   ```bash
   # Crie o banco de dados
   wrangler d1 create planac-database
   
   # Anote o ID do banco
   # Atualize no wrangler.toml
   ```

4. **Deploy do Worker**
   ```bash
   wrangler publish worker.js
   ```

## 🌐 URLs do Sistema

Após o deploy, você terá:

- **Sistema Principal**: `https://planac-sistema.pages.dev`
- **Scanner de Emails**: `https://planac-sistema.pages.dev/scanner.html`
- **API Worker**: `https://planac-worker.SEU-USUARIO.workers.dev`

## 🎨 Personalização

### Alterar cores do tema
Edite as variáveis CSS no início do `index.html`:
```css
--planac-primary: #e53e3e;
--planac-primary-dark: #dc2626;
```

### Adicionar produtos
No arquivo `index.html`, localize o array `products`:
```javascript
const products = [
    { code: '000095', name: 'GUIA 48', ncm: '72166110', cost: 11.10, hasST: false },
    // Adicione mais produtos aqui
];
```

### Configurar emails
No `worker.js`, atualize os emails monitorados:
```javascript
const emails = [
    { address: 'financeiro@planacdivisorias.com.br', type: 'entrada' },
    // Adicione mais emails
];
```

## 📊 Funcionalidades

✅ **Sistema de Login**
- Autenticação local
- Sessão de usuário

✅ **Dashboard**
- Métricas em tempo real
- Cards com estatísticas
- Atividades recentes

✅ **Precificação**
- Modo unitário e por grupo
- Cálculo com ST e DIFAL
- Margem automática

✅ **Gestão de Produtos**
- 572 produtos cadastrados
- Busca por código/NCM/nome
- Identificação de ST

✅ **Scanner de Emails**
- Importação de XMLs
- Processamento automático
- Log de operações

## 🔐 Configurações

### Banco de Dados (D1)
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "planac-database"
database_id = "SEU-ID-AQUI"
```

### Variáveis de Ambiente
```toml
[vars]
IMAP_HOST = "imap.hostinger.com"
IMAP_PORT = "993"
EMAIL_PASSWORD = "sua-senha"
```

## 📝 Notas Importantes

1. **Segurança**: Em produção, implemente autenticação real
2. **HTTPS**: Cloudflare fornece SSL automaticamente
3. **Performance**: CDN global incluído
4. **Backup**: Faça backup regular do banco D1

## 🤝 Suporte

Para dúvidas ou problemas:
- Email: rodrigo@planacdivisorias.com.br
- Sistema: https://planac-sistema.pages.dev

## 📄 Licença

© 2024 PLANAC Distribuidora - Todos os direitos reservados

---

**Desenvolvido para otimização tributária e precificação inteligente**
=======
# Prec.pla
>>>>>>> f88fd9ee47d59fd162b998260f41cc75d49da10d
