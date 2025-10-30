const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');

if (!process.env.ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY não definida! Usando chave temporária.');
}

/**
 * Criptografa um texto usando AES-256-GCM
 * @param {string} text - Texto a ser criptografado
 * @returns {string} - Texto criptografado no formato: iv:authTag:encryptedData
 */
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16); // Vetor de inicialização
    const cipher = crypto.createCipher(ALGORITHM, KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Retorna iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar:', error);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Descriptografa um texto usando AES-256-GCM
 * @param {string} encryptedData - Dados criptografados no formato: iv:authTag:encryptedData
 * @returns {string} - Texto descriptografado
 */
function decrypt(encryptedData) {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de dados criptografados inválido');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, KEY);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    throw new Error('Falha na descriptografia');
  }
}

/**
 * Gera uma chave de criptografia segura
 * @returns {string} - Chave em formato hexadecimal
 */
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  generateKey
};