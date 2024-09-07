import express from 'express';
import Room from '../models/Room.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    const room = new Room({ name: req.body.name });
    try {
        const newRoom = await room.save();
        res.status(201).json(newRoom);
        req.app.get('io').emit('room-created', newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        if (room) {
            res.json(room);
            req.app.get('io').emit('room-updated', room);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (room) {
            await Message.deleteMany({ room: req.params.id });
            res.status(204).send();
            req.app.get('io').emit('room-deleted', req.params.id);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
