/**
 * 🛡️ SECURITY SENTINEL: RECURSIVE DATA SANITIZATION
 * Removes any keys starting with "$" or "." to prevent NoSQL Injection.
 * Specifically engineered for Express 5 compatibility.
 */
const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            if (key.startsWith('$') || key.includes('.')) {
                console.warn(`[SECURITY]: Sanitized forbidden key: ${key}`);
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        });
    }
};

export const mongoSanitizeMiddleware = (req, res, next) => {
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
};

/**
 * 🛡️ HTTP PARAMETER POLLUTION (HPP) PROTECTOR
 * Prevents multiple parameters with the same name.
 * Keeps only the last one for security consistency.
 */
export const hppMiddleware = (req, res, next) => {
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (Array.isArray(req.query[key])) {
                req.query[key] = req.query[key][req.query[key].length - 1];
            }
        });
    }
    next();
};

/**
 * 🛡️ XSS INPUT SANITIZER
 * Escapes HTML characters in text inputs to prevent Cross-Site Scripting.
 */
const escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

const sanitizeXss = (obj, skipKeys = ['password', 'confirmPassword', 'avatar', 'materials', 'options']) => {
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            if (skipKeys.includes(key)) return;
            if (typeof obj[key] === 'string') {
                obj[key] = escapeHtml(obj[key]);
            } else if (typeof obj[key] === 'object') {
                sanitizeXss(obj[key], skipKeys);
            }
        });
    }
};

export const xssSanitizeMiddleware = (req, res, next) => {
    if (req.body) sanitizeXss(req.body);
    next();
};
