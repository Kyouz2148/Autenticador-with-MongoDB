# 🚀 Instruções de Deploy e Configuração

## Deploy Rápido

### 1. Clonando o Repositório
```bash
git clone https://github.com/Kyouz2148/Autenticador-with-MongoDB.git
cd Autenticador-with-MongoDB
```

### 2. Setup Automático
```bash
# Windows
setup.bat

# Linux/macOS
chmod +x setup.sh
./setup.sh
```

### 3. Configuração Manual
Se preferir fazer manualmente:

```bash
# Instalar dependências
npm install
cd client && npm install && cd ..

# Gerar chaves de segurança
npm run setup

# Configurar .env (copie as chaves geradas)
cp .env.example .env
# Edite o .env com suas configurações
```

### 4. Iniciar Aplicação
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

## Configuração de Produção

### MongoDB Atlas
1. Crie uma conta em https://mongodb.com/atlas
2. Crie um cluster
3. Configure IP whitelist (0.0.0.0/0 para qualquer IP)
4. Obtenha a connection string
5. Configure no .env:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-authenticator
```

### Deploy Heroku
```bash
# Instalar Heroku CLI
# Login
heroku login

# Criar app
heroku create seu-app-name

# Configurar variáveis
heroku config:set MONGODB_URI=sua-uri-mongodb
heroku config:set JWT_SECRET=sua-jwt-secret
heroku config:set ENCRYPTION_KEY=sua-encryption-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy Vercel (Frontend)
```bash
cd client
npx vercel

# Configure as variáveis:
# REACT_APP_API_URL=https://seu-backend-url/api
```

## Troubleshooting

### Problema: MongoDB não conecta
**Solução**: 
- Verifique se MongoDB está rodando: `mongod --version`
- Para Windows: Execute como administrador ou inicie o serviço
- Para cloud: Verifique a URI e credenciais

### Problema: Códigos TOTP não funcionam
**Solução**:
- Verifique se o secret está correto (32 caracteres base32)
- Confirme algoritmo e período
- Sincronize horário do sistema

### Problema: Erro de CORS
**Solução**:
Configure CLIENT_URL no .env do backend:
```env
CLIENT_URL=http://localhost:3000  # desenvolvimento
CLIENT_URL=https://seu-frontend.vercel.app  # produção
```

## Estrutura para Produção

```
production/
├── backend/ (Node.js + MongoDB)
├── frontend/ (React build estático)
├── nginx/ (Proxy reverso)
└── docker/ (Containerização)
```

## Backup de Dados

### Backup automático
```bash
# Criar script de backup
mongodump --uri="sua-uri-mongodb" --out="./backup-$(date +%Y%m%d)"

# Agendar no cron (Linux/macOS)
crontab -e
# Adicionar: 0 2 * * * /path/to/backup-script.sh
```

### Restore
```bash
mongorestore --uri="sua-uri-mongodb" ./backup-20241029/password-authenticator/
```

## Monitoramento

### Logs de Produção
```bash
# PM2 para gerenciar processo
npm install -g pm2
pm2 start server/index.js --name "password-authenticator"
pm2 logs password-authenticator
```

### Health Check
- Backend: `GET /api/health`
- Frontend: Verificar se carrega em `CLIENT_URL`

## Segurança em Produção

1. **SSL/HTTPS obrigatório**
2. **Firewall configurado**
3. **Backup regular**
4. **Monitoramento de logs**
5. **Variáveis de ambiente seguras**
6. **Rate limiting ajustado**

## Suporte

- 📧 Email: seu-email@exemplo.com
- 🐛 Issues: https://github.com/Kyouz2148/Autenticador-with-MongoDB/issues
- 📖 Wiki: https://github.com/Kyouz2148/Autenticador-with-MongoDB/wiki