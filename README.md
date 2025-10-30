# 🔐 Password Authenticator

Um aplicativo autenticador de senhas moderno e seguro com Time-based One-Time Password (TOTP) usando MongoDB, Node.js e React.

![Password Authenticator](https://img.shields.io/badge/Password-Authenticator-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green)

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com JWT e bcrypt
- 📱 **Geração de códigos TOTP** de 6/8 dígitos
- 🔄 **Atualização automática** a cada 30 segundos
- 📊 **QR Code** para configuração fácil
- 💾 **Armazenamento seguro** no MongoDB
- 🔒 **Criptografia AES-256-GCM** para dados sensíveis
- 📱 **Interface responsiva** com Material-UI
- 🚀 **Backup e restore** de contas
- ⚡ **Performance otimizada** com índices MongoDB
- 🛡️ **Rate limiting** e proteção contra ataques

## 🏗️ Tecnologias

### Backend
- **Node.js** + Express.js
- **MongoDB** + Mongoose
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **speakeasy** para TOTP
- **helmet** para segurança
- **express-rate-limit** para proteção

### Frontend
- **React 18** + TypeScript
- **Material-UI (MUI)** para componentes
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Context API** para estado global

### Segurança
- **AES-256-GCM** para criptografia
- **JWT** com expiração
- **Rate limiting** anti-brute force
- **Headers de segurança** com helmet
- **Validação** de entrada em todas rotas

## 🚀 Instalação Rápida

### 1. Clone o repositório
```bash
git clone <repository-url>
cd password-authenticator
```

### 2. Execute o script de setup
```bash
# Windows
setup.bat

# Linux/macOS
chmod +x setup.sh
./setup.sh
```

### 3. Configure o MongoDB
- Instale o MongoDB localmente ou use MongoDB Atlas
- A URI padrão é: `mongodb://localhost:27017/password-authenticator`

### 4. Configure as variáveis de ambiente
Edite o arquivo `.env` criado pelo setup:
```env
MONGODB_URI=mongodb://localhost:27017/password-authenticator
JWT_SECRET=<gerado_automaticamente>
ENCRYPTION_KEY=<gerado_automaticamente>
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 5. Inicie o aplicativo
```bash
# Terminal 1 - Servidor
npm run dev

# Terminal 2 - Cliente
npm run client
```

### 6. Acesse o aplicativo
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Uso

### Primeiro acesso
1. **Registre-se** com username, email e senha segura
2. **Faça login** com suas credenciais
3. **Adicione sua primeira conta** clicando em "Adicionar Conta"

### Adicionando contas
1. **Método 1 - Gerar novo secret**:
   - Preencha nome do serviço e conta
   - Clique em "Gerar Novo Secret"
   - Use o QR Code em outros apps

2. **Método 2 - Secret existente**:
   - Preencha nome do serviço e conta
   - Cole o secret TOTP do serviço
   - Configure opções avançadas se necessário

### Usando códigos
- Códigos são **renovados automaticamente** a cada 30s
- **Clique para copiar** códigos para área de transferência
- **Barra de progresso** mostra tempo restante
- **Códigos ficam vermelhos** nos últimos 5 segundos

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor em modo desenvolvimento
npm run client       # Inicia cliente React

# Produção
npm start            # Inicia servidor em produção
npm run build        # Build do cliente para produção

# Utilitários
npm run setup        # Gera chaves de segurança
npm run install-client  # Instala dependências do cliente
```

## 📁 Estrutura do Projeto

```
password-authenticator/
├── 📁 server/              # Backend Node.js
│   ├── index.js           # Servidor principal
│   ├── 📁 models/         # Modelos MongoDB
│   │   ├── User.js        # Modelo de usuário
│   │   └── Account.js     # Modelo de conta
│   ├── 📁 routes/         # Rotas da API
│   │   ├── auth.js        # Autenticação
│   │   └── accounts.js    # Gerenciamento de contas
│   ├── 📁 middleware/     # Middleware personalizado
│   │   └── auth.js        # Middleware de autenticação
│   └── 📁 utils/          # Utilitários
│       ├── totp.js        # Funções TOTP
│       └── encryption.js  # Criptografia
├── 📁 client/             # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/ # Componentes React
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AccountCard.tsx
│   │   │   └── AddAccountDialog.tsx
│   │   ├── 📁 contexts/   # Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── ToastContext.tsx
│   │   └── App.tsx        # Componente principal
├── 📁 docs/              # Documentação
│   ├── mongodb-setup.md  # Setup MongoDB
│   └── user-guide.md     # Guia do usuário
├── 📁 scripts/           # Scripts utilitários
│   └── generate-keys.js  # Gerador de chaves
├── setup.bat             # Setup Windows
├── setup.sh              # Setup Linux/macOS
├── .env.example          # Exemplo de configuração
└── README.md             # Esta documentação
```

## 🔒 Segurança

### Criptografia
- **Senhas**: bcrypt com 12 rounds
- **Secrets TOTP**: AES-256-GCM
- **Tokens JWT**: HS256 com expiração de 7 dias
- **Chaves**: Geradas com crypto.randomBytes

### Proteções
- **Rate limiting**: 100 req/15min geral, 5 req/15min auth
- **Headers de segurança**: Helmet.js
- **Validação rigorosa**: express-validator
- **CORS configurado**: Apenas origins permitidas
- **Sanitização**: Trim e validação de entrada

## 📦 Backup e Restore

### Backup dos dados
```bash
mongodump --db password-authenticator --out ./backup
```

### Restore dos dados
```bash
mongorestore --db password-authenticator ./backup/password-authenticator
```

### Backup das chaves
⚠️ **IMPORTANTE**: Faça backup do arquivo `.env` com as chaves de segurança!

## 🔧 Configuração de Produção

### 1. Variáveis de ambiente
```env
NODE_ENV=production
MONGODB_URI=<mongodb_atlas_uri>
CLIENT_URL=<frontend_url>
PORT=5000
```

### 2. MongoDB em produção
- Use **MongoDB Atlas** para cloud
- Configure **autenticação** e **SSL**
- Crie **índices** para performance:
```javascript
db.accounts.createIndex({ userId: 1, isActive: 1 })
db.accounts.createIndex({ userId: 1, order: 1 })
```

### 3. Deploy
- **Heroku**: Configurado com `heroku-postbuild`
- **Docker**: Dockerfile incluído
- **PM2**: Para gerenciamento de processo
- **Nginx**: Para proxy reverso

## 🐛 Resolução de Problemas

### MongoDB não conecta
```bash
# Verificar se MongoDB está rodando
mongod --version
mongo --eval "db.adminCommand('ismaster')"

# Ou com mongosh
mongosh --eval "db.adminCommand('ismaster')"
```

### Códigos não aparecem
- Verifique se o secret TOTP está correto (32 caracteres base32)
- Confirme que o algoritmo e período estão corretos
- Veja os logs do servidor para erros de descriptografia

### Token expirado
- Faça logout/login novamente
- Verifique se a data/hora do sistema está sincronizada

## 🛣️ Roadmap

- [ ] 📱 PWA (Progressive Web App)
- [ ] 🌙 Modo escuro
- [ ] 📷 Scan QR Code por câmera
- [ ] 📤 Exportação/importação de contas
- [ ] 🔍 Busca e filtros
- [ ] 📂 Categorização de contas
- [ ] ☁️ Sincronização multi-dispositivo
- [ ] 🔔 Notificações de segurança
- [ ] 📊 Analytics de uso
- [ ] 🌐 Internacionalização (i18n)

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 📖 **Documentação**: [docs/user-guide.md](docs/user-guide.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/usuario/password-authenticator/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/usuario/password-authenticator/discussions)

---

Feito com ❤️ por [Alan Godois](https://github.com/alan-godois)