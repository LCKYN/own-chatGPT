const ClaudeResponse = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return `Mock Claude API response to: "${message}"`;
};

export default ClaudeResponse;
