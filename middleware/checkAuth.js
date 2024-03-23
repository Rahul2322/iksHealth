const { verifyToken, signToken } = require('../utils/jwt');


exports.verifyTokenMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        const refreshToken = req.headers["x-refresh"];

        if (!accessToken) {
            return res.status(401).json({ success: false, message: 'Token Validation Failed: Authorization header missing' });
        }

        const token = accessToken.split(' ')[1];
        const accessTokenDetails = await verifyToken(token);
       console.log(accessTokenDetails)
        if (accessTokenDetails.valid) {
            req.userDetails = accessTokenDetails.decoded;
            return next();
        }

        if (refreshToken) {
            const refreshTokenDetails = await verifyToken(refreshToken);

            if (refreshTokenDetails.valid && !refreshTokenDetails.expired) {
                const newAccessToken = await reIssueAccessToken(refreshToken);

                if (newAccessToken) {
                    res.setHeader("x-access-token", newAccessToken);
                    req.userDetails = refreshTokenDetails.decoded;
                    return next();
                }
            }
        }

        return res.status(401).json({ success: false, message: 'Token Validation Failed: Invalid token' });
    } catch (error) {
        next(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const reIssueAccessToken = async (refreshToken) => {
    const { decoded, valid } = await verifyToken(refreshToken);

    if (!valid || !decoded) {
        return null;
    }

    const accessToken = signToken(decoded);
    return accessToken;
};
