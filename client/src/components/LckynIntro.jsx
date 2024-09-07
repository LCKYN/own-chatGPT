import React from 'react';
import { Link } from 'react-router-dom';

const LckynIntro = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:7101/auth/discord';
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 text-center">
            <h1 className="text-6xl font-bold mb-4">
                It's me, the <span className="text-blue-600">LCKYN</span>
            </h1>
            <p className="text-xl max-w-2xl mb-8">
                I work on transforming complex data into actionable insights and developing cutting-edge machine learning solutions.
            </p>
            <button
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Login with Discord
            </button>
        </div>
    );
};

export default LckynIntro;
