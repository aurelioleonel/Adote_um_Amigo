const getToken = (req) => {

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1]
        return token;
    } catch (error) { };

};

module.exports = getToken;