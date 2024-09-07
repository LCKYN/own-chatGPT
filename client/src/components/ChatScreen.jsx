import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, Edit2, Send, LogOut } from 'lucide-react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:7101', { withCredentials: true });

const ChatScreen = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchUser();
        fetchChatRooms();

        socket.on('connect_error', (err) => {
            if (err.message === 'Unauthorized') {
                navigate('/');
            }
        });

        socket.on('room-created', (newRoom) => {
            setChatRooms(prevRooms => [...prevRooms, newRoom]);
        });

        socket.on('room-updated', (updatedRoom) => {
            setChatRooms(prevRooms => prevRooms.map(room => room._id === updatedRoom._id ? updatedRoom : room));
        });

        socket.on('room-deleted', (roomId) => {
            setChatRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
            if (selectedRoom === roomId) {
                setSelectedRoom(null);
                setMessages([]);
            }
        });

        socket.on('new-message', (newMessage) => {
            if (newMessage.room === selectedRoom) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        });

        socket.on('message-deleted', (messageId) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
        });

        return () => {
            socket.off('connect_error');
            socket.off('room-created');
            socket.off('room-updated');
            socket.off('room-deleted');
            socket.off('new-message');
            socket.off('message-deleted');
        };
    }, [navigate, selectedRoom]);

    useEffect(() => {
        if (selectedRoom) {
            socket.emit('join-room', selectedRoom);
            fetchMessages(selectedRoom);
        }

        return () => {
            if (selectedRoom) {
                socket.emit('leave-room', selectedRoom);
            }
        };
    }, [selectedRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchUser = async () => {
        try {
            const response = await fetch('http://localhost:7101/auth/user', { credentials: 'include' });
            if (response.status === 401) {
                navigate('/');
                return;
            }
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user:', error);
            navigate('/');
        }
    };

    const fetchChatRooms = async () => {
        try {
            const response = await fetch('http://localhost:7101/api/rooms', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            console.log('Fetch response:', response);
            if (response.status === 401) {
                navigate('/');
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched chat rooms:', data);
            setChatRooms(data);
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:7101/api/messages/${roomId}`, { credentials: 'include' });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleAddRoom = async () => {
        const roomName = prompt('Enter new room name:');
        if (roomName) {
            try {
                const response = await fetch('http://localhost:7101/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name: roomName }),
                });
                const newRoom = await response.json();
                setChatRooms([...chatRooms, newRoom]);
            } catch (error) {
                console.error('Error adding room:', error);
            }
        }
    };

    const handleRemoveRoom = async (roomId) => {
        if (window.confirm('Are you sure you want to remove this room?')) {
            try {
                await fetch(`http://localhost:7101/api/rooms/${roomId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                setChatRooms(chatRooms.filter(room => room._id !== roomId));
                if (selectedRoom === roomId) {
                    setSelectedRoom(null);
                    setMessages([]);
                }
            } catch (error) {
                console.error('Error removing room:', error);
            }
        }
    };

    const handleRenameRoom = async (roomId) => {
        const newName = prompt('Enter new room name:');
        if (newName) {
            try {
                const response = await fetch(`http://localhost:7101/api/rooms/${roomId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name: newName }),
                });
                const updatedRoom = await response.json();
                setChatRooms(chatRooms.map(room => room._id === roomId ? updatedRoom : room));
            } catch (error) {
                console.error('Error renaming room:', error);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedRoom) {
            try {
                const response = await fetch(`http://localhost:7101/api/messages/${selectedRoom}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content: message }),
                });
                const newMessage = await response.json();
                setMessages([...messages, newMessage]);
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await fetch(`http://localhost:7101/api/messages/${messageId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                setMessages(messages.filter(msg => msg._id !== messageId));
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:7101/auth/logout', { credentials: 'include' });
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Chat Rooms</h2>
                    <button onClick={handleAddRoom} className="text-green-400 hover:text-green-300">
                        <PlusCircle size={24} />
                    </button>
                </div>
                <ul className="flex-grow overflow-y-auto">
                    {chatRooms.map((room) => (
                        <li
                            key={room._id}
                            className={`flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${selectedRoom === room._id ? 'bg-blue-600' : 'hover:bg-gray-700'
                                }`}
                            onClick={() => setSelectedRoom(room._id)}
                        >
                            <span>{room.name}</span>
                            <div>
                                <button onClick={() => handleRenameRoom(room._id)} className="mr-2 text-yellow-400 hover:text-yellow-300">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleRemoveRoom(room._id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <span>{user?.username}</span>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                        <LogOut size={24} />
                    </button>
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                {/* Chat history */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">{chatRooms.find(room => room._id === selectedRoom)?.name}</h2>
                    {messages.map((msg) => (
                        <div key={msg._id} className="mb-2 flex justify-between items-start">
                            <div>
                                <span className="font-bold">{msg.sender}: </span>
                                <span>{msg.content}</span>
                            </div>
                            {msg.sender === user?.username && (
                                <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatScreen;
