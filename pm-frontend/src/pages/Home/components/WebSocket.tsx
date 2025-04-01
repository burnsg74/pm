import React, { useState, useEffect, useRef } from 'react';

function WebSocketComponent() {
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState<any[]>([]); // Specify the type of messages
    const socket = useRef<WebSocket | null>(null); // Use useRef to persist socket across renders and define type

    useEffect(() => {
        // Initialize WebSocket connection
        socket.current = new WebSocket('ws://localhost:8080'); // Replace with your WebSocket server URL

        socket.current.onopen = () => {
            console.log('WebSocket connection opened');
            // Optionally send a message to the server upon connection
            socket.current?.send('Hello from client!');
        };

        socket.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        socket.current.onerror = (error: Event) => { // Explicitly type error
            console.error('WebSocket error:', error);
        };

        socket.current.onmessage = (event: MessageEvent) => { // Explicitly type event
            console.log('Message received:', event.data);
            setReceivedMessages((prevMessages) => [...prevMessages, event.data]);
        };

        // Cleanup function to close the connection when the component unmounts
        return () => {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.close();
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount and unmount

    const sendMessage = () => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(message);
            setMessage(''); // Clear input after sending
        } else {
            console.log('WebSocket is not open. Message not sent.');
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { // Typing the event
        setMessage(event.target.value);
    };

    return (
        <div>
            <h1>WebSocket Example</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter message"
                    value={message}
                    onChange={handleInputChange}
                />
                <button onClick={sendMessage}>Send Message</button>
            </div>
            <div>
                <h2>Received Messages:</h2>
                <ul>
                    {receivedMessages.map((msg: any, index: number) => ( // Typing msg and index
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default WebSocketComponent;