
validator = {}

validator.validateRequiredFields = (fields, bodyObj) => {
    missingField = null 
    fields.forEach(val => {
        if (!bodyObj.hasOwnProperty(val)) {
            missingField = val
        }
    });
    return missingField
}

module.exports = validator;