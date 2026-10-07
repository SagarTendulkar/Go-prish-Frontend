const validatePassword = (password) => {
    const rules = [
        {
            test: password.length >= 8,
            message: "At least 8 characters",
        },
        {
            test: /[A-Z]/.test(password),
            message: "At least one uppercase letter",
        },
        {
            test: /[0-9]/.test(password),
            message: "At least one number",
        },
    ];

    const failed = rules.filter((r) => !r.test);
    return {
        isValid: failed.length === 0,
        errors: failed.map((r) => r.message),
    };
};

export default validatePassword;