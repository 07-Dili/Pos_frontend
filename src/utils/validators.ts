export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
    return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
};
