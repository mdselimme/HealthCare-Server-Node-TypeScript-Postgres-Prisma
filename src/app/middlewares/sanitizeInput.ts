import { NextFunction, Request, Response } from "express";

/**
 * Middleware to trim string inputs and remove potentially harmful characters
 */
export const sanitizeInput = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Sanitize body (mutate instead of replace)
    if (req.body && typeof req.body === "object") {
        Object.assign(req.body, sanitizeObject(req.body));
    }

    // Sanitize query (cannot reassign in Express 5)
    if (req.query && typeof req.query === "object") {
        Object.assign(req.query, sanitizeObject(req.query));
    }

    // Sanitize params (cannot reassign)
    if (req.params && typeof req.params === "object") {
        Object.assign(req.params, sanitizeObject(req.params));
    }

    next();
};

const sanitizeObject = (obj: any): any => {
    if (typeof obj !== "object" || obj === null) {
        return sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const sanitized: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
    }
    return sanitized;
};

const sanitizeValue = (value: any): any => {
    if (typeof value === "string") {
        // Trim whitespace
        value = value.trim();

        // Remove null bytes
        value = value.replace(/\0/g, "");

        // Optional: strip dangerous HTML chars
        // value = value.replace(/[<>]/g, "");
    }
    return value;
};
