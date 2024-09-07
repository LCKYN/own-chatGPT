import express from 'express';
import Message from '../models/Message.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:roomId', isAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:roomId', isAuthenticated, async (req, res) => {
    const message = new Message({
        content: req.body.content,
        sender: req.user.username,
        room: req.params.roomId
    });
    try {
        const newMessage = await message.save();
        res.status(201).json(newMessage);
        req.app.get('io').to(req.params.roomId).emit('new-message', newMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (message) {
            res.status(204).send();
            req.app.get('io').to(message.room.toString()).emit('message-deleted', req.params.id);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
