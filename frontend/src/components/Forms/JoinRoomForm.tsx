import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

interface RoomData {
    name: string;
    roomId: string;
    userId: string;
    host: boolean;
    presenter: boolean;
}

interface JoinRoomFormProps {
    uuid: () => string;
    socket: Socket;
}

export default function JoinRoomForm({ uuid, socket }: JoinRoomFormProps) {
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: RoomData = {
            name,
            roomId,
            userId: uuid(),
            host: false,
            presenter: false,
        };
        socket.emit("userJoined", userData);
        navigate(`/${roomId}`);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 h-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Join Room</h2>
                <p className="text-gray-600">Enter your name and the room code to join.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="joinName" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter your name
                    </label>
                    <input 
                        id="joinName" 
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Room Code
                    </label>
                    <input 
                        id="roomCode" 
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter room code" 
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Join Room
                </button>
            </form>
        </div>
    );
}