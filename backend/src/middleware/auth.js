import jwtService from '../services/jwt.service.js';
import { User } from '../models/user.model.js';

/**
 * Middleware to require authentication via JWT
 * Validates JWT token and attaches user to request object
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwtService.verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid or expired token',
      });
    }

    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = jwtService.verifyToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          req.user = {
            userId: decoded.userId,
            email: user.email,
          };
        }
      } catch (error) {
        // Token invalid, but continue without auth
        // This is optional auth, so we don't fail
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
};

