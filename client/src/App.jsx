import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import LckynIntro from './components/LckynIntro'
import ChatScreen from './components/ChatScreen'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <Router>
            <div className="bg-gray-100 min-h-screen">
                <Routes>
                    <Route path="/" element={<LckynIntro />} />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
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
