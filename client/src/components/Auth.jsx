import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:7101/api/user', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Unauthorized') {
                    navigate('/');
                } else {
                    setUser(data);
                }
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                navigate('/');
            });
    }, [navigate]);

    const handleLogin = () => {
        window.location.href = 'http://localhost:7101/auth/discord';
    };

    const handleLogout = () => {
        fetch('http://localhost:7101/auth/logout', { credentials: 'include' })
            .then(() => {
                setUser(null);
                navigate('/');
            })
            .catch(err => console.error('Error logging out:', err));
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <button
                    onClick={handleLogin}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Login with Discord
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 bg-gray-100">
            <span>Welcome, {user.username}!</span>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Logout
            </button>
        </div>
    );
};

export default Auth;
