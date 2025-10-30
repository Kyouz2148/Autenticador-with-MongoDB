@echo off
echo 🔐 Password Authenticator - Setup
echo ==================================

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se o MongoDB está rodando
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  MongoDB não encontrado. Certifique-se de que o MongoDB está instalado e rodando.
)

echo 📦 Instalando dependências do servidor...
call npm install

echo 📦 Instalando dependências do cliente...
cd client && call npm install && cd ..

REM Verificar se existe arquivo .env
if not exist .env (
    echo 🔧 Criando arquivo .env...
    copy .env.example .env
    
    echo 🔑 Gerando chaves de segurança...
    node scripts/generate-keys.js
    
    echo.
    echo ⚠️  Configure as variáveis no arquivo .env antes de continuar!
    echo Edite o arquivo .env com suas configurações:
    echo - MONGODB_URI (URL do MongoDB)
    echo - JWT_SECRET (gerado acima)
    echo - ENCRYPTION_KEY (gerado acima)
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo 🚀 Setup concluído!
echo.
echo Para iniciar o aplicativo:
echo 1. Configure o arquivo .env
echo 2. Execute 'npm run dev' para o servidor
echo 3. Em outro terminal, execute 'npm run client' para o frontend
echo.
echo 📖 Mais informações no README.md
pause