// src/shared/utils/SecurityValidator.js
import { z } from 'zod';

/**
 * Enterprise-level Security Validator
 * Provides comprehensive validation for usernames and other security-critical fields
 */
export class SecurityValidator {
    
    /**
     * Reserved usernames that should never be allowed
     */
    static RESERVED_USERNAMES = [
        // System usernames
        'admin', 'root', 'system', 'sys', 'daemon', 'operator', 'service',
        'administrator', 'superuser', 'su', 'sudo', 'wheel', 'adm',
        
        // Web/API related
        'api', 'www', 'web', 'mail', 'ftp', 'ssh', 'ssl', 'tls',
        'http', 'https', 'smtp', 'pop', 'imap', 'dns', 'dhcp',
        
        // Application specific
        'app', 'application', 'server', 'client', 'database', 'db',
        'cache', 'redis', 'mongo', 'sql', 'mysql', 'postgres',
        
        // User-facing
        'user', 'guest', 'anonymous', 'public', 'private', 'test',
        'demo', 'example', 'sample', 'default', 'nobody', 'null',
        'undefined', 'unknown', 'temp', 'tmp', 'backup', 'archive',
        
        // Social media specific
        'support', 'help', 'info', 'contact', 'about', 'team',
        'staff', 'moderator', 'mod', 'bot', 'official', 'verified',
        
        // Legal/Policy
        'terms', 'privacy', 'policy', 'legal', 'copyright', 'dmca',
        'security', 'abuse', 'report', 'complaint', 'violation',
        
        // Navigation/UI
        'login', 'register', 'signup', 'signin', 'logout', 'signout',
        'profile', 'settings', 'config', 'configuration', 'preferences',
        'dashboard', 'panel', 'console', 'control', 'manage', 'management',
        
        // Generic
        'news', 'blog', 'forum', 'chat', 'message', 'messages',
        'notification', 'notifications', 'alert', 'alerts', 'feed',
        'trending', 'popular', 'featured', 'recommended', 'discover'
    ];

    /**
     * Patterns that could indicate malicious intent
     */
    static MALICIOUS_PATTERNS = [
        // XSS attempts
        /<script/i, /<\/script>/i, /javascript:/i, /onclick=/i, /onload=/i,
        /onerror=/i, /onmouseover=/i, /onfocus=/i, /onblur=/i,
        
        // SQL Injection attempts
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i,
        /(--|\/\*|\*\/|;|'|")/,
        
        // Path traversal
        /\.\.\//g, /\.\.\\\/g, /%2e%2e%2f/gi, /%2e%2e%5c/gi,
        
        // Command injection
        /(\||&|;|\$\(|\`)/,
        
        // HTML/XML injection
        /<[^>]*>/,
        
        // URL/Protocol injection
        /(https?|ftp|file|data|javascript):/i,
        
        // Template injection
        /\{\{|\}\}|\$\{|\}/,
        
        // LDAP injection
        /(\(|\)|\*|\||&)/,
        
        // NoSQL injection
        /(\$ne|\$gt|\$lt|\$gte|\$lte|\$regex|\$where)/i
    ];

    /**
     * Validates username with comprehensive security checks
     * @param {string} username - Username to validate
     * @returns {Object} - Validation result with success/error details
     */
    static validateUsername(username) {
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            sanitized: null
        };

        // Basic validation
        if (!username || typeof username !== 'string') {
            result.errors.push('Username is required and must be a string');
            return result;
        }

        const trimmedUsername = username.trim();
        
        // Length validation
        if (trimmedUsername.length < 3) {
            result.errors.push('Username must be at least 3 characters long');
        }
        
        if (trimmedUsername.length > 30) {
            result.errors.push('Username cannot exceed 30 characters');
        }

        // Character validation - allow letters, numbers, dots, underscores, hyphens
        if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
            result.errors.push('Username can only contain letters, numbers, dots (.), underscores (_), and hyphens (-)');
        }

        // Security validations
        const securityChecks = [
            {
                test: /^[._-]/.test(trimmedUsername) || /[._-]$/.test(trimmedUsername),
                error: 'Username cannot start or end with special characters'
            },
            {
                test: /[._-]{2,}/.test(trimmedUsername),
                error: 'Username cannot contain consecutive special characters'
            },
            {
                test: !/[a-zA-Z0-9]/.test(trimmedUsername),
                error: 'Username must contain at least one letter or number'
            },
            {
                test: /^\d+$/.test(trimmedUsername),
                error: 'Username cannot be all numbers'
            }
        ];

        securityChecks.forEach(check => {
            if (check.test) {
                result.errors.push(check.error);
            }
        });

        // Reserved username check
        if (this.RESERVED_USERNAMES.includes(trimmedUsername.toLowerCase())) {
            result.errors.push('This username is reserved and cannot be used');
        }

        // Malicious pattern detection
        this.MALICIOUS_PATTERNS.forEach(pattern => {
            if (pattern.test(trimmedUsername)) {
                result.errors.push('Username contains potentially harmful content');
                return;
            }
        });

        // Additional security checks
        const additionalChecks = [
            {
                test: /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(trimmedUsername),
                error: 'Username cannot be a Windows reserved name'
            },
            {
                test: /\s/.test(trimmedUsername),
                error: 'Username cannot contain spaces'
            },
            {
                test: /[^\x20-\x7E]/.test(trimmedUsername),
                error: 'Username contains invalid characters'
            }
        ];

        additionalChecks.forEach(check => {
            if (check.test) {
                result.errors.push(check.error);
            }
        });

        // Warnings (non-blocking but should be noted)
        if (/^\d/.test(trimmedUsername)) {
            result.warnings.push('Username starting with numbers may be less memorable');
        }

        if (trimmedUsername.length > 20) {
            result.warnings.push('Long usernames may be difficult to remember');
        }

        if (!/[a-zA-Z]/.test(trimmedUsername)) {
            result.warnings.push('Username without letters may be less user-friendly');
        }

        // Set result
        result.isValid = result.errors.length === 0;
        result.sanitized = result.isValid ? trimmedUsername.toLowerCase() : null;

        return result;
    }

    /**
     * Validates password strength with enterprise requirements
     * @param {string} password - Password to validate
     * @param {Object} options - Additional options like username to prevent similarity
     * @returns {Object} - Validation result
     */
    static validatePassword(password, options = {}) {
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            strength: 'weak',
            score: 0
        };

        if (!password || typeof password !== 'string') {
            result.errors.push('Password is required');
            return result;
        }

        let score = 0;

        // Length checks
        if (password.length < 8) {
            result.errors.push('Password must be at least 8 characters long');
        } else if (password.length >= 8) {
            score += 1;
        }

        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;

        // Character type checks
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[@$!%*?&]/.test(password);

        if (!hasLowercase) result.errors.push('Password must contain at least one lowercase letter');
        else score += 1;

        if (!hasUppercase) result.errors.push('Password must contain at least one uppercase letter');
        else score += 1;

        if (!hasNumbers) result.errors.push('Password must contain at least one number');
        else score += 1;

        if (!hasSpecialChars) result.errors.push('Password must contain at least one special character (@$!%*?&)');
        else score += 1;

        // Common pattern checks
        if (/(.)\1{2,}/.test(password)) {
            result.warnings.push('Password contains repeated characters');
        }

        // Sequential character checks
        if (/123456|abcdef|qwerty/i.test(password)) {
            result.warnings.push('Password contains common sequences');
        }

        // Dictionary word checks (basic)
        const commonPasswords = ['password', 'admin', '123456', 'qwerty', 'letmein'];
        if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
            result.errors.push('Password contains common words');
        }

        // Username similarity check
        if (options.username && password.toLowerCase().includes(options.username.toLowerCase())) {
            result.errors.push('Password cannot contain username');
        }

        // Calculate strength
        result.score = score;
        if (score >= 7) result.strength = 'very strong';
        else if (score >= 5) result.strength = 'strong';
        else if (score >= 3) result.strength = 'medium';
        else result.strength = 'weak';

        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Validates email address
     * @param {string} email - Email to validate
     * @returns {Object} - Validation result
     */
    static validateEmail(email) {
        const result = {
            isValid: false,
            errors: [],
            sanitized: null
        };

        if (!email || typeof email !== 'string') {
            result.errors.push('Email is required');
            return result;
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            result.errors.push('Invalid email format');
        }

        // Length check
        if (trimmedEmail.length > 254) {
            result.errors.push('Email address too long');
        }

        // Malicious pattern check
        this.MALICIOUS_PATTERNS.forEach(pattern => {
            if (pattern.test(trimmedEmail)) {
                result.errors.push('Email contains potentially harmful content');
                return;
            }
        });

        result.isValid = result.errors.length === 0;
        result.sanitized = result.isValid ? trimmedEmail : null;
        return result;
    }

    /**
     * Sanitizes input by removing potentially harmful content
     * @param {string} input - Input to sanitize
     * @returns {string} - Sanitized input
     */
    static sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/[<>"'&]/g, '') // Remove basic HTML chars
            .replace(/javascript:/gi, '') // Remove javascript protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 1000); // Limit length
    }

    /**
     * Validates if a string contains only safe characters
     * @param {string} input - Input to validate
     * @returns {boolean} - True if safe
     */
    static isSafeString(input) {
        if (!input || typeof input !== 'string') return false;
        
        return !this.MALICIOUS_PATTERNS.some(pattern => pattern.test(input));
    }
}     if (/123|abc|qwerty|password|admin|letmein/i.test(password)) {
            result.errors.push('Password contains common patterns that are easy to guess');
        }

        // Username similarity check
        if (options.username && password.toLowerCase().includes(options.username.toLowerCase())) {
            result.errors.push('Password cannot contain the username');
        }

        // Calculate strength
        result.score = score;
        if (score >= 7) result.strength = 'very strong';
        else if (score >= 5) result.strength = 'strong';
        else if (score >= 3) result.strength = 'medium';
        else result.strength = 'weak';

        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Sanitizes input to prevent XSS and injection attacks
     * @param {string} input - Input to sanitize
     * @returns {string} - Sanitized input
     */
    static sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
            .slice(0, 500); // Limit length
    }

    /**
     * Validates email with enhanced security checks
     * @param {string} email - Email to validate
     * @returns {Object} - Validation result
     */
    static validateEmail(email) {
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            sanitized: null
        };

        if (!email || typeof email !== 'string') {
            result.errors.push('Email is required');
            return result;
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        // Basic email format validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(trimmedEmail)) {
            result.errors.push('Please enter a valid email address');
        }

        // Length validation
        if (trimmedEmail.length > 254) {
            result.errors.push('Email address is too long');
        }

        // Disposable email detection (basic)
        const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com', 'mailinator.com'];
        const domain = trimmedEmail.split('@')[1];
        if (domain && disposableDomains.includes(domain)) {
            result.warnings.push('This appears to be a disposable email address');
        }

        // Malicious pattern check
        this.MALICIOUS_PATTERNS.forEach(pattern => {
            if (pattern.test(trimmedEmail)) {
                result.errors.push('Email contains potentially harmful content');
                return;
            }
        });

        result.isValid = result.errors.length === 0;
        result.sanitized = result.isValid ? trimmedEmail : null;
        return result;
    }
}

// Export default validation schemas using the SecurityValidator
export const secureValidationSchemas = {
    username: z.string()
        .transform(val => val.trim())
        .refine(val => {
            const validation = SecurityValidator.validateUsername(val);
            return validation.isValid;
        }, {
            message: "Username validation failed"
        })
        .transform(val => SecurityValidator.validateUsername(val).sanitized),
    
    password: z.string()
        .refine(val => {
            const validation = SecurityValidator.validatePassword(val);
            return validation.isValid;
        }, {
            message: "Password does not meet security requirements"
        }),
    
    email: z.string()
        .transform(val => val.trim().toLowerCase())
        .refine(val => {
            const validation = SecurityValidator.validateEmail(val);
            return validation.isValid;
        }, {
            message: "Email validation failed"
        })
        .transform(val => SecurityValidator.validateEmail(val).sanitized)
};

export default SecurityValidator;
