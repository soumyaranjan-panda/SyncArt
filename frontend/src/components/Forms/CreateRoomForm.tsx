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

interface FormsProps {
    uuid: () => string;
    socket: Socket;
    setUser: (user: RoomData | null) => void;
}

export default function CreateRoomForm({ uuid, socket, setUser }: FormsProps) {
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [copySuccess, setCopySuccess] = useState("");
    const [isRoomCreated, setIsRoomCreated] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCode = uuid();
        setRoomId(newCode);
        setIsRoomCreated(true);
    };

    const joinRoom = () => {
        if (roomId && name) {
            const userData: RoomData = {
                name,
                roomId,
                userId: uuid(),
                host: true,
                presenter: true,
            };
            setUser(userData);
            socket.emit("userJoined", userData);
            navigate(`/${roomId}`);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopySuccess("Copied!");
            setTimeout(() => setCopySuccess(""), 2000);
        } catch (err) {
            setCopySuccess("Failed to copy");
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 h-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Create Room</h2>
                <p className="text-gray-600">
                    Create a new room and get a unique code.
                </p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        htmlFor="createName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Enter your name
                    </label>
                    <input
                        id="createName"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Generate Room Code
                </button>
            </form>
            {isRoomCreated && (
                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                        Your room code is:
                    </p>
                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            type="text"
                            value={roomId}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Copy
                        </button>
                    </div>
                    {copySuccess && (
                        <p className="text-sm text-green-600 mb-4">
                            {copySuccess}
                        </p>
                    )}
                    <button
                        onClick={joinRoom}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Join Room
                    </button>
                </div>
            )}
        </div>
    );
}