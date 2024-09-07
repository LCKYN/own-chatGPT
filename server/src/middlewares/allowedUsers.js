const allowedUserIds = [
    '341560715615797251',
];

export const isAllowedUser = (user) => {
    return allowedUserIds.includes(user.id);
};

export const isAllowedUserMiddleware = (req, res, next) => {
    if (req.user && isAllowedUser(req.user)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. User not allowed.' });
    }
};
