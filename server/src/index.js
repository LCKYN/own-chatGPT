import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import session from 'express-session';
import cors from 'cors';
import MongoStore from 'connect-mongo';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import messageRoutes from './routes/messages.js';
import setupSocket from './services/socket.js';
import { isAllowedUser, isAllowedUserMiddleware } from './middlewares/allowedUsers.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors({
    origin: 'http://localhost:7100',  // Allow requests from your frontend
    credentials: true,                 // Allow credentials (cookies/sessions) to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
}));
app.use(express.json());

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: 'http://localhost:7101/auth/discord/callback',
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
    // Check if the user's ID is in the allowed list
    if (isAllowedUser(profile)) {
        done(null, profile);
    } else {
        done(null, false, { message: 'User not allowed' });
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const io = setupSocket(server, sessionMiddleware);
app.set('io', io);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/rooms', isAllowedUserMiddleware, roomRoutes);
app.use('/api/messages', isAllowedUserMiddleware, messageRoutes);

const port = process.env.PORT || 7101;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
