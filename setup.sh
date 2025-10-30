#!/bin/bash

# Script de setup para Password Authenticator
echo "🔐 Password Authenticator - Setup"
echo "=================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o MongoDB está rodando
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB não encontrado. Certifique-se de que o MongoDB está instalado e rodando."
fi

echo "📦 Instalando dependências do servidor..."
npm install

echo "📦 Instalando dependências do cliente..."
cd client && npm install && cd ..

# Verificar se existe arquivo .env
if [ ! -f .env ]; then
    echo "🔧 Criando arquivo .env..."
    cp .env.example .env
    
    echo "🔑 Gerando chaves de segurança..."
    node scripts/generate-keys.js
    
    echo ""
    echo "⚠️  Configure as variáveis no arquivo .env antes de continuar!"
    echo "Edite o arquivo .env com suas configurações:"
    echo "- MONGODB_URI (URL do MongoDB)"
    echo "- JWT_SECRET (gerado acima)"
    echo "- ENCRYPTION_KEY (gerado acima)"
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "🚀 Setup concluído!"
echo ""
echo "Para iniciar o aplicativo:"
echo "1. Configure o arquivo .env"
echo "2. Execute 'npm run dev' para o servidor"
echo "3. Em outro terminal, execute 'npm run client' para o frontend"
echo ""
echo "📖 Mais informações no README.md"