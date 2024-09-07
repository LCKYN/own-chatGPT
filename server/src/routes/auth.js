import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/auth/login-failed' }),
    (req, res) => {
        res.redirect('http://localhost:7100/chat');
    }
);

router.get('/login-failed', (req, res) => {
    res.status(401).json({ message: 'Login failed. User not allowed.' });
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout error', error: err.message });
        }
        res.redirect('http://localhost:7100');
    });
});

router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

export default router;
