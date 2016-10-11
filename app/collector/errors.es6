const noConfigError = Error("configuration for collector is undefined");
const missingConfigParam = Error("configuration for collector has missing or invalid parameters");


module.exports = {noConfigError, missingConfigParam};