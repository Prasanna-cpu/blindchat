import Joi from "joi"

export const signUpSchema = Joi.object({
    fullName : Joi.string()
        .min(5)
        .max(30)
        .required()
        .trim()
        .messages({
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 5 characters long",
            "string.max": "Full name must be at most 30 characters long"
        }),

    email : Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .lowercase()
        .trim()
        .messages({
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
        }),

    password : Joi.string()
        .min(6)
        .max(128)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
        .messages({
            "string.min": "Password must be at least 6 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            "string.empty": "Password is required",
        }),
})



export const loginSchema = Joi.object({

    email : Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .lowercase()
        .trim()
        .messages({
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
        }),

    password : Joi.string()
        .min(6)
        .max(128)
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
        .messages({
            "string.min": "Password must be at least 6 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            "string.empty": "Password is required",
        }),
})

export const onboardSchema = Joi.object({
    fullName : Joi.string()
        .min(3)
        .max(100)
        .required()
        .trim()
        .messages({
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 3 characters long",
            "string.max": "Full name must be at most 100 characters long"
        }),

    bio : Joi.string()
        .min(10)
        .max(2000)
        .required()
        .trim()
        .messages({
            "string.empty": "Bio is required",
            "string.min": "Bio must be at least 10 characters long",
            "string.max": "Bio must be at most 2000 characters long"
        }),

    nativeLanguage : Joi.string()
        .required()
        .trim()
        .messages({
            "string.empty": "Native language is required"
        }),

    learningLanguage : Joi.string()
        .required()
        .trim()
        .messages({
            "string.empty": "Learning language is required"
        }),

    location : Joi.string()
        .required()
        .trim()
        .messages({
            "string.empty": "Location is required"
        })
})