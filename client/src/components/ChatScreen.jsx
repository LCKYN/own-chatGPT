import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, Edit2, Send, LogOut, Copy, Moon, Sun } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:7101', { withCredentials: true });

const ChatScreen = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

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
            console.log('Received new message:', newMessage); // Add this to check
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
                textareaRef.current.style.height = 'auto';
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleTextareaChange = (e) => {
        setMessage(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:7101/auth/logout', { credentials: 'include' });
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const CodeBlock = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const [isCopied, setIsCopied] = useState(false);

        const copyToClipboard = () => {
            navigator.clipboard.writeText(children);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        };

        return !inline && match ? (
            <div className="relative">
                <button
                    onClick={copyToClipboard}
                    className={`absolute top-2 right-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} p-1 rounded`}
                >
                    {isCopied ? 'Copied!' : <Copy size={16} />}
                </button>
                <SyntaxHighlighter
                    style={isDarkMode ? vscDarkPlus : vs}
                    language={match[1]}
                    PreTag="div"
                    className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded`}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code className={className} {...props}>
                {children}
            </code>
        );
    };

    return (
        <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            {/* Left sidebar */}
            <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Chat Rooms</h2>
                    <button onClick={handleAddRoom} className={`${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}`}>
                        <PlusCircle size={24} />
                    </button>
                </div>
                <ul className="flex-grow overflow-y-auto">
                    {chatRooms.map((room) => (
                        <li
                            key={room._id}
                            className={`flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${selectedRoom === room._id
                                ? (isDarkMode ? 'bg-blue-700' : 'bg-blue-500')
                                : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300')
                                }`}
                            onClick={() => setSelectedRoom(room._id)}
                        >
                            <span>{room.name}</span>
                            <div>
                                <button onClick={() => handleRenameRoom(room._id)} className={`mr-2 ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-500'}`}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleRemoveRoom(room._id)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} flex justify-between items-center`}>
                    <span>{user?.username}</span>
                    <button onClick={handleLogout} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}>
                        <LogOut size={24} />
                    </button>
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex justify-between items-center`}>
                    <h2 className="text-2xl font-bold">{chatRooms.find(room => room._id === selectedRoom)?.name}</h2>
                    <button onClick={toggleTheme} className={`${isDarkMode ? 'text-yellow-400' : 'text-gray-600'}`}>
                        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                </div>

                {/* Chat history */}
                <div className={`flex-1 p-4 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {messages.map((msg) => (
                        <div key={msg._id} className="mb-4 flex justify-between items-start">
                            <div className="flex-grow">
                                <span className="font-bold">{msg.sender}: </span>
                                <ReactMarkdown
                                    className="inline whitespace-pre-wrap"
                                    components={{
                                        code: CodeBlock,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                            {msg.sender === user?.username && (
                                <button onClick={() => handleDeleteMessage(msg._id)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'} ml-2`}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-end">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message... (Shift+Enter for new line)"
                            className={`flex-1 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden`}
                            style={{ minHeight: '40px', maxHeight: '200px' }}
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px]"
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
