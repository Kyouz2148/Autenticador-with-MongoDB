const crypto = require('crypto');

// Função para gerar chaves de segurança
function generateSecurityKeys() {
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const encryptionKey = crypto.randomBytes(32).toString('hex');
  
  console.log('🔐 Chaves de segurança geradas:');
  console.log('');
  console.log('Copie e cole no seu arquivo .env:');
  console.log('');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`ENCRYPTION_KEY=${encryptionKey}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Mantenha essas chaves seguras e nunca as compartilhe!');
}

// Gerar chaves se executado diretamente
if (require.main === module) {
  generateSecurityKeys();
}

module.exports = { generateSecurityKeys };