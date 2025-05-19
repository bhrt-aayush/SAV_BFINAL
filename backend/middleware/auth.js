import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not Authorized, login again' });
        }

        const token = authHeader.split(' ')[1];
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: token_decode.id };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

export default authMiddleware;