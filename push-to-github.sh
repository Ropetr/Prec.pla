#!/bin/bash

echo "=========================================="
echo "📦 UPLOAD PARA GITHUB - PLANAC SISTEMA"
echo "=========================================="
echo ""
echo "Este script vai enviar os arquivos para:"
echo "https://github.com/Ropetr/Prec.pla.git"
echo ""

# Verifica se está no diretório correto
if [ ! -f "index.html" ]; then
    echo "❌ ERRO: Arquivo index.html não encontrado!"
    echo "Certifique-se de estar na pasta planac-sistema"
    exit 1
fi

echo "✅ Arquivos encontrados!"
echo ""

# Inicializa git se necessário
if [ ! -d ".git" ]; then
    echo "📝 Inicializando Git..."
    git init
fi

# Configura o git
echo "⚙️ Configurando Git..."
git config user.email "rodrigo@planacdivisorias.com.br"
git config user.name "PLANAC Sistema"

# Adiciona todos os arquivos
echo "📁 Adicionando arquivos..."
git add .

# Faz o commit
echo "💾 Fazendo commit..."
git commit -m "Sistema de Precificação PLANAC v2.0 - Dashboard, Scanner e Tema Oficial" || echo "Nada para commitar"

# Configura o branch principal
echo "🌿 Configurando branch main..."
git branch -M main

# Adiciona o repositório remoto
echo "🔗 Conectando ao GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Ropetr/Prec.pla.git

# Faz o push
echo ""
echo "🚀 Enviando para o GitHub..."
echo "Você precisará inserir suas credenciais do GitHub:"
echo ""
git push -u origin main --force

echo ""
echo "=========================================="
echo "✅ CONCLUÍDO!"
echo "=========================================="
echo ""
echo "Acesse seu repositório em:"
echo "https://github.com/Ropetr/Prec.pla"
echo ""
echo "Para fazer deploy no Cloudflare:"
echo "1. Vá em dash.cloudflare.com"
echo "2. Workers & Pages > Create > Pages"
echo "3. Connect to Git > Selecione Prec.pla"
echo "4. Deploy!"
echo ""
