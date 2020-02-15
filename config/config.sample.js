const api = {
    key: 'bancho api key',
    config: {
        parseNumeric: true // Parse numeric values into numbers/floats, excluding ids
    }
}
const port = process.env.PORT || 13333

module.exports = {
    api,
    port
};