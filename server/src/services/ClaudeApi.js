import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const getClaudeResponse = async (message) => {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [
                { role: "user", content: message }
            ]
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
