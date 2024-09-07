import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: 'http://localhost:7100'
}), (req, res) => {
    res.redirect('http://localhost:7100/chat');
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
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
