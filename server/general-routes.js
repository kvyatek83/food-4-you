const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper function for consistent error handling and logging
const handleError = (error, res, operation, entity = 'user') => {
  const timestamp = new Date().toISOString();
  const errorMessage = error.message || 'Unknown error';
  
  // Determine error code based on error type
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode = 500;
  
  if (error.name === 'SequelizeValidationError') {
    errorCode = 'VALIDATION_ERROR';
    statusCode = 400;
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    errorCode = 'DUPLICATE_ENTRY';
    statusCode = 409;
  } else if (error.message && error.message.includes('not found')) {
    errorCode = 'NOT_FOUND';
    statusCode = 404;
  }
  
  // Log error for production monitoring
  console.error(`[${timestamp}] ${operation} failed:`, {
    error: errorMessage,
    code: errorCode,
    statusCode: statusCode,
    stack: error.stack,
    entity: entity,
    operation: operation
  });

  // Return structured error response
  res.status(statusCode).json({
    message: errorCode,
    params: {
      operation: operation,
      entity: entity,
      timestamp: timestamp,
      details: errorMessage
    }
  });
};

router.post("/login", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        message: "VALIDATION_ERROR",
        params: {
          operation: "login",
          entity: "user",
          details: "Username and password are required"
        }
      });
    }

    const users = await db.readUsersFromDatabase();
    const user = users.find((user) => user.username === req.body.username);

    if (!user) {
      console.error(`[${new Date().toISOString()}] Login failed: User ${req.body.username} not found`);
      return res.status(404).json({
        message: "USER_NOT_FOUND",
        params: {
          operation: "login",
          entity: "user",
          username: req.body.username
        }
      });
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      console.error(`[${new Date().toISOString()}] Login failed: Invalid password for user ${req.body.username}`);
      return res.status(401).json({
        message: "INVALID_CREDENTIALS",
        params: {
          operation: "login",
          entity: "user",
          username: req.body.username
        }
      });
    }

    const role = user.role.toUpperCase();
    const expiresInKey = `${role}_EXPIRES_IN`;

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env[expiresInKey] || "24h",
      }
    );

    console.log(`[${new Date().toISOString()}] User ${req.body.username} logged in successfully`);
    res.status(200).json({ 
      auth: true, 
      token: token,
      message: "LOGIN_SUCCESS",
      params: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    handleError(error, res, "login", "user");
  }
});

module.exports = router;
