import Joi from "joi";

/**
 *
 * @param {*} schema : A Joi validation schema.
 * fun => Middleware function that uses a schema to validate req.body.
 * @returns  If validation fails, it sends back a 400 Bad Request with details. If it passes, it invokes next() to proceed to the next middleware.
 */

const validateFun = (schema) => (req, res, next) => {
    const validationResult = schema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.details });
    }
    return next();
};

/**
 * joi function
 *
 */
const signUpSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/)
        .min(3)
        .max(30)
        .required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    age: Joi.number().integer(),
    gender: Joi.string().valid("male", "female"),
    phone: Joi.string().min(7).max(14),
});

/**
 * joi valididation
 * fields
 *
 */
const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
});

/**
 * joi valididation
 * fields
 *
 */

const changePasswordSchema = Joi.object({
    password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
});

/**
 * joi valididation
 * fields
 *
 */

const updateSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/)
        .min(3)
        .max(30)
        .required(),
    age: Joi.number().integer(),
    phone: Joi.string().min(7).max(14),
});

// Middleware functions

const validateSignUp = validateFun(signUpSchema);
const validateSignIn = validateFun(signInSchema);
const validateChangePass = validateFun(changePasswordSchema);
const validateUpdate = validateFun(updateSchema);

export {
    validateFun,
    signUpSchema,
    signInSchema,
    updateSchema,
    changePasswordSchema,
    validateSignUp,
    validateSignIn,
    validateChangePass,
    validateUpdate,
};
