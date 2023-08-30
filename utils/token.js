import jwt from "jsonwebtoken";

const secretToken = "itiPHP";

//  retrieve the token from the Authorization header , verifies the token using jwt.verify, next () for next middleware
const verifyAuthorization = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const user = jwt.verify(token, secretToken);
        req.userID = user.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Access denied, invalid token" });
    }
};

// Create jwt:

const createAuthorization = (user, expire) => {
    //
    const token = jwt.sign(user, secretToken, { expiresIn: expire });
    return token;
};

export { verifyAuthorization, createAuthorization };
