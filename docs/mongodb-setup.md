# MongoDB Configuration for Password Authenticator

## Instalação do MongoDB

### Windows:
1. Baixe o MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Execute o instalador e siga as instruções
3. Inicie o MongoDB como serviço do Windows

### macOS (com Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## Configuração da URI de Conexão

### Local (padrão):
```
MONGODB_URI=mongodb://localhost:27017/password-authenticator
```

### MongoDB Atlas (cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-authenticator?retryWrites=true&w=majority
```

### Docker:
```bash
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

## Verificação da Conexão

Para verificar se o MongoDB está rodando:

### Windows/macOS/Linux:
```bash
mongo --eval "db.adminCommand('ismaster')"
```

### Ou usando mongosh (MongoDB Shell moderno):
```bash
mongosh --eval "db.adminCommand('ismaster')"
```

## Backup e Restore

### Backup:
```bash
mongodump --db password-authenticator --out ./backup
```

### Restore:
```bash
mongorestore --db password-authenticator ./backup/password-authenticator
```

## Segurança

Para uso em produção, configure:
1. Autenticação de usuário
2. SSL/TLS
3. Firewall rules
4. Regular backups

Exemplo de URI com autenticação:
```
MONGODB_URI=mongodb://username:password@localhost:27017/password-authenticator?authSource=admin
```