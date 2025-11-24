@echo off
echo ==========================================
echo 📦 UPLOAD PARA GITHUB - PLANAC SISTEMA
echo ==========================================
echo.
echo Este script vai enviar os arquivos para:
echo https://github.com/Ropetr/Prec.pla.git
echo.

REM Verifica se está no diretório correto
if not exist "index.html" (
    echo ❌ ERRO: Arquivo index.html não encontrado!
    echo Certifique-se de estar na pasta planac-sistema
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados!
echo.

REM Inicializa git se necessário
if not exist ".git" (
    echo 📝 Inicializando Git...
    git init
)

REM Configura o git
echo ⚙️ Configurando Git...
git config user.email "rodrigo@planacdivisorias.com.br"
git config user.name "PLANAC Sistema"

REM Adiciona todos os arquivos
echo 📁 Adicionando arquivos...
git add .

REM Faz o commit
echo 💾 Fazendo commit...
git commit -m "Sistema de Precificação PLANAC v2.0 - Dashboard, Scanner e Tema Oficial"

REM Configura o branch principal
echo 🌿 Configurando branch main...
git branch -M main

REM Remove origin se existir e adiciona novo
echo 🔗 Conectando ao GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/Ropetr/Prec.pla.git

REM Faz o push
echo.
echo 🚀 Enviando para o GitHub...
echo Você precisará inserir suas credenciais do GitHub:
echo.
git push -u origin main --force

echo.
echo ==========================================
echo ✅ CONCLUÍDO!
echo ==========================================
echo.
echo Acesse seu repositório em:
echo https://github.com/Ropetr/Prec.pla
echo.
echo Para fazer deploy no Cloudflare:
echo 1. Vá em dash.cloudflare.com
echo 2. Workers e Pages - Create - Pages
echo 3. Connect to Git - Selecione Prec.pla
echo 4. Deploy!
echo.
pause
