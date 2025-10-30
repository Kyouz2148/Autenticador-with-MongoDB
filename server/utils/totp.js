const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Gera um novo secret TOTP
 * @param {string} serviceName - Nome do serviço
 * @param {string} accountName - Nome da conta/usuário
 * @param {string} issuer - Emissor (nome da aplicação)
 * @returns {Object} - Contém secret, otpauth_url e qr_code
 */
async function generateSecret(serviceName, accountName, issuer = 'Password Authenticator') {
  try {
    const secret = speakeasy.generateSecret({
      name: `${serviceName} (${accountName})`,
      issuer: issuer,
      length: 32
    });

    // Gerar QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
      qr_code: qrCodeDataUrl,
      manual_entry_key: secret.base32
    };
  } catch (error) {
    console.error('Erro ao gerar secret:', error);
    throw new Error('Falha ao gerar secret TOTP');
  }
}

/**
 * Gera um código TOTP atual
 * @param {string} secret - Secret em base32
 * @param {number} digits - Número de dígitos (padrão: 6)
 * @param {number} period - Período em segundos (padrão: 30)
 * @param {string} algorithm - Algoritmo hash (padrão: 'sha1')
 * @returns {string} - Código TOTP atual
 */
function generateToken(secret, digits = 6, period = 30, algorithm = 'sha1') {
  try {
    return speakeasy.totp({
      secret: secret,
      digits: digits,
      step: period,
      algorithm: algorithm,
      encoding: 'base32'
    });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    throw new Error('Falha ao gerar token TOTP');
  }
}

/**
 * Verifica se um código TOTP é válido
 * @param {string} token - Código a ser verificado
 * @param {string} secret - Secret em base32
 * @param {number} digits - Número de dígitos (padrão: 6)
 * @param {number} period - Período em segundos (padrão: 30)
 * @param {string} algorithm - Algoritmo hash (padrão: 'sha1')
 * @param {number} window - Janela de tolerância (padrão: 1)
 * @returns {boolean} - True se o token é válido
 */
function verifyToken(token, secret, digits = 6, period = 30, algorithm = 'sha1', window = 1) {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      token: token,
      digits: digits,
      step: period,
      algorithm: algorithm,
      encoding: 'base32',
      window: window
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}

/**
 * Calcula o tempo restante até o próximo período
 * @param {number} period - Período em segundos (padrão: 30)
 * @returns {number} - Segundos restantes
 */
function getTimeRemaining(period = 30) {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

/**
 * Gera múltiplos códigos TOTP para diferentes algoritmos/configurações
 * @param {string} secret - Secret em base32
 * @returns {Object} - Códigos para diferentes configurações
 */
function generateMultipleTokens(secret) {
  try {
    return {
      default: generateToken(secret), // 6 dígitos, 30s, SHA1
      secure: generateToken(secret, 8, 30, 'sha256'), // 8 dígitos, 30s, SHA256
      timeRemaining: getTimeRemaining()
    };
  } catch (error) {
    console.error('Erro ao gerar múltiplos tokens:', error);
    throw new Error('Falha ao gerar tokens TOTP');
  }
}

module.exports = {
  generateSecret,
  generateToken,
  verifyToken,
  getTimeRemaining,
  generateMultipleTokens
};