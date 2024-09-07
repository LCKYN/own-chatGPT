import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LckynIntro from './components/LckynIntro'
import ChatScreen from './components/ChatScreen'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAllowed, setIsAllowed] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:7101/auth/user', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.message !== 'Unauthorized') {
                    setIsAuthenticated(true);
                    setIsAllowed(true);
                }
            })
            .catch(err => {
                console.error('Error checking auth status:', err);
                if (err.message.includes('not allowed')) {
                    setIsAllowed(false);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className="bg-gray-100 min-h-screen">
                <Routes>
                    <Route path="/" element={<LckynIntro isAuthenticated={isAuthenticated} isAllowed={isAllowed} />} />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated} isAllowed={isAllowed}>
                                <ChatScreen />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    )
}

export default App
