const jwt = require("jsonWebToken");
const getToken = require("./get-token");

// middlewate to validade token
const chekToken = (req, res, next) => {

    let msg = "";
    const token = getToken(req)
    if (!req.headers.authorization) {
        msg = "Usuário não autorizado";
    } else if (!token) {
        msg = "Usuário não possui Token válido"

    }
    if (msg != "") {
        return res.status(401).json({ message: msg });
    }

    try {
        const verified = jwt.verify(token, "nossosecret");
        req.user = verified
        next();
    } catch (error) {
        return res.status(400).json({ message: "Token inválido" });
    }


}

module.exports = chekToken;