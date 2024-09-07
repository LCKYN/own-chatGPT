import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:7101/auth/user', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Unauthorized') {
                    setUser(null);
                } else {
                    setUser(data);
                }
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return (
            <div>
                <p>You need to log in to access this page.</p>
                <button onClick={() => window.location.href = 'http://localhost:7101/auth/discord'}>
                    Log in with Discord
                </button>
            </div>
        );
    }

    return children;
};

export default Auth;
