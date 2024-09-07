import express from 'express';
import Message from '../models/Message.js';
import { isAuthenticated } from '../middlewares/auth.js';
import mockClaudeResponse from '../services/mockClaudeApi.js';

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
    const userMessage = new Message({
        content: req.body.content,
        sender: req.user.username,
        room: req.params.roomId
    });

    try {
        // Save user message first
        const savedUserMessage = await userMessage.save();
        res.status(201).json(savedUserMessage);

        const io = req.app.get('io');
        io.to(req.params.roomId).emit('new-message', savedUserMessage);

        console.log('Sent user message:', savedUserMessage);

        // Fetch Claude response asynchronously
        const claudeResponse = await mockClaudeResponse(req.body.content);

        const apiMessage = new Message({
            content: claudeResponse,
            sender: 'Claude API',
            room: req.params.roomId
        });

        const savedApiMessage = await apiMessage.save();
        io.to(req.params.roomId).emit('new-message', savedApiMessage);

        console.log('Sent Claude response:', savedApiMessage);

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
