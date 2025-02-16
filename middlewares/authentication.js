require("dotenv").config();
const { AUTH_TOKEN } = process.env;

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).json({
        status: false,
        error: "Token tidak valid",
      });
    }

    const tokenHash = token.split(`Bearer `)[1];
    if (!tokenHash) {
      return res.status(403).json({
        status: false,
        error: "Token tidak valid",
      });
    }

    if (tokenHash !== AUTH_TOKEN) {
      return res.status(403).json({
        status: false,
        error: "Token tidak valid",
      });
    }

    req.authHash = tokenHash;
    return next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error?.message,
    });
  }
};

module.exports = authentication;