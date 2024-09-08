import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import Message from '../models/Message.js';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const getClaudeResponse = async (message, roomId) => {
    try {
        // Fetch all messages in the room
        const roomMessages = await Message.find({ room: roomId }).sort({ createdAt: 1 });

        // Prepare the conversation history for Claude
        const conversationHistory = roomMessages.map(msg => ({
            role: msg.sender === 'Claude API' ? 'assistant' : 'user',
            content: msg.content
        }));

        console.log('Conversation history:', conversationHistory);

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: conversationHistory
        });

        // Extract the text content from the response
        const responseText = response.content[0].text;

        return responseText;
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
};

export default getClaudeResponse;
