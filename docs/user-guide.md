# 🔐 Password Authenticator - Guia de Uso

## Como usar o aplicativo

### 1. Configuração Inicial

1. **Configure o MongoDB**:
   - Instale o MongoDB localmente ou use MongoDB Atlas
   - O aplicativo se conectará automaticamente em `mongodb://localhost:27017/password-authenticator`

2. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

3. **Inicie o cliente** (em outro terminal):
   ```bash
   npm run client
   ```

4. **Acesse o aplicativo**:
   - Abra http://localhost:3000 no seu navegador

### 2. Criando sua conta

1. Clique em "Registre-se" na tela de login
2. Preencha:
   - Username (3+ caracteres, apenas letras, números, _ ou -)
   - Email válido
   - Senha (6+ caracteres com maiúscula, minúscula e número)
3. Confirme a senha
4. Clique em "Criar Conta"

### 3. Adicionando contas para autenticação

#### Método 1: Gerar novo secret
1. Clique em "Adicionar Conta"
2. Preencha o nome do serviço e conta
3. Clique em "Gerar Novo Secret"
4. Use o QR Code gerado para configurar em outros apps
5. Configure opções avançadas se necessário
6. Clique em "Criar Conta"

#### Método 2: Usar secret existente
1. Clique em "Adicionar Conta"
2. Preencha o nome do serviço e conta
3. Cole o secret TOTP fornecido pelo serviço
4. Configure opções avançadas se necessário
5. Clique em "Criar Conta"

### 4. Usando os códigos

- **Códigos são atualizados automaticamente** a cada 30 segundos
- **Clique em "Copiar Código"** para copiar para área de transferência
- **Barra de progresso** mostra tempo restante até renovação
- **Códigos ficam vermelhos** quando restam apenas 5 segundos

### 5. Gerenciando contas

- **Editar**: Clique nos 3 pontos → Editar
- **Ver QR Code**: Clique nos 3 pontos → Ver QR Code
- **Remover**: Clique nos 3 pontos → Remover

## Funcionalidades Avançadas

### Configurações de Código
- **Dígitos**: 6 ou 8 dígitos
- **Período**: 30, 60 ou 120 segundos
- **Algoritmo**: SHA1, SHA256 ou SHA512

### Segurança
- **Senhas criptografadas** com bcrypt (12 rounds)
- **Secrets TOTP criptografados** com AES-256-GCM
- **Tokens JWT** com expiração de 7 dias
- **Rate limiting** para prevenir ataques
- **Headers de segurança** com helmet

### Backup e Restore
Para fazer backup dos dados:
```bash
mongodump --db password-authenticator --out ./backup
```

Para restaurar:
```bash
mongorestore --db password-authenticator ./backup/password-authenticator
```

## Resolução de Problemas

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a URI no arquivo `.env`
- Para Windows: Execute `mongod` ou inicie o serviço

### Códigos não aparecem
- Verifique se o secret TOTP está correto
- Tente remover e adicionar a conta novamente
- Verifique os logs do servidor para erros

### Erro de token expirado
- Faça logout e login novamente
- Verifique se a data/hora do sistema está correta

### Performance lenta
- Verifique a conexão com o MongoDB
- Considere criar índices adicionais para grandes volumes de dados

## Estrutura do Projeto

```
password-authenticator/
├── server/              # Backend Node.js
│   ├── index.js        # Servidor principal
│   ├── models/         # Modelos do MongoDB
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Middleware personalizado
│   └── utils/          # Utilitários (TOTP, criptografia)
├── client/             # Frontend React
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── contexts/   # Context providers
│   │   └── App.tsx     # Componente principal
├── docs/               # Documentação
├── scripts/            # Scripts utilitários
└── README.md          # Documentação principal
```

## Próximas Funcionalidades

- [ ] Backup/restore automático
- [ ] Suporte a múltiplos algoritmos
- [ ] Sincronização entre dispositivos
- [ ] Modo escuro
- [ ] Importação de QR codes por câmera
- [ ] Exportação de contas
- [ ] Busca e filtros
- [ ] Categorização de contas

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte os logs do servidor e cliente
3. Verifique a documentação do MongoDB
4. Abra uma issue no repositório do projeto