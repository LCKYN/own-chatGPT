import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import session from 'express-session';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import messageRoutes from './routes/messages.js';
import setupSocket from './services/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: 'http://localhost:7101/auth/discord/callback',
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
    // Here you would typically find or create a user in your database
    done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const io = setupSocket(server);
app.set('io', io);

// Routes
app.use('/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

const port = process.env.PORT || 7101;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
