const { admin } = require("../firebaseAdmin");

/**
 * Middleware de autenticação JWT Firebase
 * Verifica o token Bearer no header Authorization
 * Adiciona req.userId e req.userEmail para as rotas
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Verifica se o header Authorization existe e começa com "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token não fornecido",
        message: "Inclua 'Authorization: Bearer {token}' no header"
      });
    }

    // Extrai o token após "Bearer "
    const token = authHeader.split(" ")[1];

    // Verifica o token com Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Adiciona informações do usuário ao request
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    req.userTier = decodedToken.tier; // Se armazenado em custom claims

    // Continua para a próxima rota
    next();
  } catch (error) {
    console.error("❌ Erro ao verificar token:", error.message);

    // Diferentes tipos de erro
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expirado",
        message: "Faça login novamente"
      });
    }

    if (error.code === "auth/argument-error") {
      return res.status(401).json({
        error: "Token inválido",
        message: "Formato de token incorreto"
      });
    }

    return res.status(403).json({
      error: "Token inválido",
      message: "Não foi possível verificar sua autenticação"
    });
  }
};

/**
 * Middleware opcional que aceita tanto JWT quanto x-user-id (para retrocompatibilidade)
 * Usado durante migração gradual
 */
const authenticateLegacy = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const legacyUserId = req.headers['x-user-id'];

  // Tenta JWT primeiro
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authenticateJWT(req, res, next);
  }

  // Fallback para x-user-id (será removido no futuro)
  if (legacyUserId) {
    console.warn("⚠️  DEPRECATED: Usando x-user-id. Migre para JWT Bearer token.");
    req.userId = legacyUserId;
    return next();
  }

  return res.status(401).json({
    error: "Não autenticado",
    message: "Forneça token JWT ou x-user-id"
  });
};

module.exports = { authenticateJWT, authenticateLegacy };
