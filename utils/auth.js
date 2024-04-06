import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    }

export const validateToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
    }

export const validateUser = (req, res, next) => {
    try {
        const token = req.headers.authorization.split("Bearer ")[1];
        const user = validateToken(token);
        res.locals.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Invalid token" });
    }
    }