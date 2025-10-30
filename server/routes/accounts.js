const express = require('express');
const { body, validationResult } = require('express-validator');
const Account = require('../models/Account');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateSecret, generateToken, verifyToken, getTimeRemaining } = require('../utils/totp');

const router = express.Router();

// Validações
const accountValidation = [
  body('serviceName')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome do serviço deve ter entre 1 e 100 caracteres')
    .trim(),
  body('accountName')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome da conta deve ter entre 1 e 100 caracteres')
    .trim(),
  body('issuer')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Emissor deve ter no máximo 100 caracteres')
    .trim(),
  body('digits')
    .optional()
    .isInt({ min: 6, max: 8 })
    .withMessage('Dígitos deve ser entre 6 e 8'),
  body('period')
    .optional()
    .isInt({ min: 15, max: 300 })
    .withMessage('Período deve ser entre 15 e 300 segundos'),
  body('algorithm')
    .optional()
    .isIn(['sha1', 'sha256', 'sha512'])
    .withMessage('Algoritmo deve ser sha1, sha256 ou sha512')
];

// Obter todas as contas do usuário
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({
      userId: req.user.userId,
      isActive: true
    }).sort({ order: 1, createdAt: -1 });

    // Descriptografar secrets e gerar códigos atuais
    const accountsWithCodes = accounts.map(account => {
      try {
        const decryptedSecret = decrypt(account.secret);
        const currentCode = generateToken(
          decryptedSecret,
          account.digits,
          account.period,
          account.algorithm
        );

        return {
          id: account._id,
          serviceName: account.serviceName,
          accountName: account.accountName,
          issuer: account.issuer,
          digits: account.digits,
          period: account.period,
          algorithm: account.algorithm,
          icon: account.icon,
          color: account.color,
          order: account.order,
          currentCode,
          timeRemaining: getTimeRemaining(account.period),
          createdAt: account.createdAt
        };
      } catch (error) {
        console.error(`Erro ao processar conta ${account._id}:`, error);
        return {
          id: account._id,
          serviceName: account.serviceName,
          accountName: account.accountName,
          error: 'Erro ao gerar código'
        };
      }
    });

    res.json({
      accounts: accountsWithCodes,
      total: accountsWithCodes.length
    });

  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Criar nova conta
router.post('/', accountValidation, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const {
      serviceName,
      accountName,
      secret,
      issuer,
      digits = 6,
      period = 30,
      algorithm = 'sha1',
      icon = 'default',
      color = '#1976d2'
    } = req.body;

    // Verificar se já existe uma conta com mesmo serviço e nome
    const existingAccount = await Account.findOne({
      userId: req.user.userId,
      serviceName: serviceName.trim(),
      accountName: accountName.trim(),
      isActive: true
    });

    if (existingAccount) {
      return res.status(409).json({
        message: 'Conta já existe para este serviço'
      });
    }

    // Validar secret TOTP (tentar gerar um código de teste)
    try {
      generateToken(secret, digits, period, algorithm);
    } catch (error) {
      return res.status(400).json({
        message: 'Secret TOTP inválido'
      });
    }

    // Criptografar secret
    const encryptedSecret = encrypt(secret);

    // Obter próximo order
    const lastAccount = await Account.findOne({
      userId: req.user.userId
    }).sort({ order: -1 });

    const order = lastAccount ? lastAccount.order + 1 : 0;

    // Criar conta
    const account = new Account({
      userId: req.user.userId,
      serviceName: serviceName.trim(),
      accountName: accountName.trim(),
      secret: encryptedSecret,
      issuer: issuer?.trim(),
      digits,
      period,
      algorithm,
      icon,
      color,
      order
    });

    await account.save();

    // Gerar código atual para resposta
    const currentCode = generateToken(secret, digits, period, algorithm);

    res.status(201).json({
      message: 'Conta criada com sucesso',
      account: {
        id: account._id,
        serviceName: account.serviceName,
        accountName: account.accountName,
        issuer: account.issuer,
        digits: account.digits,
        period: account.period,
        algorithm: account.algorithm,
        icon: account.icon,
        color: account.color,
        order: account.order,
        currentCode,
        timeRemaining: getTimeRemaining(period),
        createdAt: account.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar conta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Gerar novo secret para uma conta
router.post('/generate-secret', async (req, res) => {
  try {
    const { serviceName, accountName, issuer } = req.body;

    if (!serviceName || !accountName) {
      return res.status(400).json({
        message: 'Nome do serviço e da conta são obrigatórios'
      });
    }

    const secretData = await generateSecret(
      serviceName,
      accountName,
      issuer || 'Password Authenticator'
    );

    res.json({
      message: 'Secret gerado com sucesso',
      ...secretData
    });

  } catch (error) {
    console.error('Erro ao gerar secret:', error);
    res.status(500).json({
      message: 'Erro ao gerar secret',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Obter códigos atuais de todas as contas
router.get('/codes', async (req, res) => {
  try {
    const accounts = await Account.find({
      userId: req.user.userId,
      isActive: true
    }).sort({ order: 1 });

    const codes = accounts.map(account => {
      try {
        const decryptedSecret = decrypt(account.secret);
        const currentCode = generateToken(
          decryptedSecret,
          account.digits,
          account.period,
          account.algorithm
        );

        return {
          id: account._id,
          serviceName: account.serviceName,
          accountName: account.accountName,
          currentCode,
          timeRemaining: getTimeRemaining(account.period),
          digits: account.digits,
          period: account.period
        };
      } catch (error) {
        console.error(`Erro ao gerar código para conta ${account._id}:`, error);
        return {
          id: account._id,
          serviceName: account.serviceName,
          accountName: account.accountName,
          error: 'Erro ao gerar código'
        };
      }
    });

    res.json({ codes });

  } catch (error) {
    console.error('Erro ao buscar códigos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Atualizar conta
router.put('/:id', accountValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }

    const {
      serviceName,
      accountName,
      issuer,
      icon,
      color,
      order
    } = req.body;

    // Atualizar campos
    if (serviceName) account.serviceName = serviceName.trim();
    if (accountName) account.accountName = accountName.trim();
    if (issuer !== undefined) account.issuer = issuer?.trim();
    if (icon) account.icon = icon;
    if (color) account.color = color;
    if (order !== undefined) account.order = order;

    await account.save();

    // Gerar código atual
    const decryptedSecret = decrypt(account.secret);
    const currentCode = generateToken(
      decryptedSecret,
      account.digits,
      account.period,
      account.algorithm
    );

    res.json({
      message: 'Conta atualizada com sucesso',
      account: {
        id: account._id,
        serviceName: account.serviceName,
        accountName: account.accountName,
        issuer: account.issuer,
        digits: account.digits,
        period: account.period,
        algorithm: account.algorithm,
        icon: account.icon,
        color: account.color,
        order: account.order,
        currentCode,
        timeRemaining: getTimeRemaining(account.period),
        updatedAt: account.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Excluir conta
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!account) {
      return res.status(404).json({ message: 'Conta não encontrada' });
    }

    // Soft delete
    account.isActive = false;
    await account.save();

    res.json({ message: 'Conta excluída com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reordenar contas
router.put('/reorder', async (req, res) => {
  try {
    const { accountIds } = req.body;

    if (!Array.isArray(accountIds)) {
      return res.status(400).json({
        message: 'accountIds deve ser um array'
      });
    }

    // Atualizar ordem das contas
    const updatePromises = accountIds.map((accountId, index) =>
      Account.updateOne(
        { _id: accountId, userId: req.user.userId, isActive: true },
        { order: index }
      )
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Contas reordenadas com sucesso' });

  } catch (error) {
    console.error('Erro ao reordenar contas:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;