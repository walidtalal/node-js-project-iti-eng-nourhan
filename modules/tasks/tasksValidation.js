import Joi from "joi";

// Define validation functions
const validateFun = (schema) => (req, res, next) => {
    const validationResult = schema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.details });
    }
    return next();
};

// Define validation schemas
const addTaskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    assignTo: Joi.string().required(),
    deadline: Joi.date().required(),
});

const updateTaskSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
    title: Joi.string(),
    description: Joi.string(),
    status: Joi.string().valid("nodejsproject", "doing", "done"),
});

const deleteTaskSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

// Apply validation functions to schemas
const validateAdd = validateFun(addTaskSchema);
const validateUpdate = validateFun(updateTaskSchema);
const validateDelete = validateFun(deleteTaskSchema);

// Export validation functions and schemas
export {
    validateFun,
    validateAdd,
    validateUpdate,
    validateDelete,
    addTaskSchema,
    updateTaskSchema,
    deleteTaskSchema,
};
