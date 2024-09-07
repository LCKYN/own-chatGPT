import { Server } from 'socket.io';

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:7100",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.passport && session.passport.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`Client joined room ${roomId}`);
        });

        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            console.log(`Client left room ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

export default setupSocket;
