import { useState, useRef, useEffect } from "react";
import Whiteboard from "../components/Whiteboard";
import ChatBox from "../components/ChatBox";
import { Socket } from "socket.io-client";

interface RoomPageProps {
    socket: Socket;
    server: string;
}

interface DrawingElement {
    type: string;
    offsetX: number;
    offsetY: number;
    path: [number, number][];
    stroke: string;
    width?: number;
    height?: number;
}

interface ChatMessage {
    user: string;
    message: string;
}

interface User {
    userId: string;
    name: string;
}

const RoomPage = ({ socket }: RoomPageProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [tool, setTool] = useState("pencil");
    const [color, setColor] = useState("#000000");

    const [elements, setElements] = useState<DrawingElement[]>([]);
    const [history, setHistory] = useState<DrawingElement[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingElement[][]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [roomId, setRoomId] = useState("");
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const currentRoomId = window.location.pathname.split("/")[1] || "";
        setRoomId(currentRoomId);

        socket.on("userJoined", (data) => {
            console.log(data);
        });

        socket.on("updateUsers", (updatedUsers: User[]) => {
            setUsers(updatedUsers);
        });

        socket.on("updateDrawing", (newElements: DrawingElement[]) => {
            setElements(newElements);
        });

        socket.on("chatMessage", (message: ChatMessage, namex: string) => {
            setChatMessages((prev) => [
                ...prev,
                {
                    user: namex,
                    message: message.message,
                },
            ]);
        });

        return () => {
            socket.off("userJoined");
            socket.off("updateUsers");
            socket.off("updateDrawing");
            socket.off("chatMessage");
        };
    }, [socket]);

    const handleUndo = () => {
        if (history.length === 0) return;
        const previousElements = history[history.length - 1];
        setRedoStack((prevRedoStack) => [elements, ...prevRedoStack]);
        setElements(previousElements);
        setHistory((prevHistory) => {
            const newHistory = [...prevHistory];
            newHistory.pop();
            return newHistory;
        });
        socket.emit("updateDrawing", { roomId, elements: previousElements });
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const nextElements = redoStack[0];
        setHistory((prevHistory) => [...prevHistory, elements]);
        setElements(nextElements);
        setRedoStack((prevRedoStack) => {
            const newStack = [...prevRedoStack];
            newStack.pop();
            return newStack
        });
        socket.emit("updateDrawing", { roomId, elements: nextElements });
    };

    const handleClearCanvas = () => {
        setHistory((prevHistory) => [...prevHistory, elements]);
        setElements([]);
        setRedoStack([]);
        socket.emit("updateDrawing", { roomId, elements: [] });
    };

    const addElement = (newElement: DrawingElement) => {
        setHistory((prev) => [...prev, elements]);
        const updatedElements = [...elements, newElement];
        setElements(updatedElements);
        setRedoStack([]);
        socket.emit("updateDrawing", { roomId, elements: updatedElements });
    };

    const sendChatMessage = (message: string) => {
        const newMessage = { message };

        socket.emit("chatMessage", { roomId, message: newMessage });
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 flex-row-reverse flex overflow-hidden">
                <main className="flex-1 overflow-auto p-4">
                    <Whiteboard
                        canvasRef={canvasRef}
                        ctxRef={ctxRef}
                        elements={elements}
                        setElements={setElements}
                        tool={tool}
                        color={color}
                        addElement={addElement}
                        socket={socket}
                        roomId={roomId}
                    />
                </main>
                <div className="w-80 bg-white shadow-lg flex flex-col h-[100%] justify-between">
                    <div className=" flex flex-col gap-3 p-3">
                        {/* header */}
                        <header className="flex justify-between bg-white shadow-md p-4">
                            <h1 className="text-3xl font-bold">SyncArt</h1>
                            <p className="text-sm text-gray-500">
                                Users Online: {users.length}
                            </p>
                        </header>
                        {/* tool */}
                        <select
                            className="w-full bg-gray-100 text-black outline:none hover:outline hover:outline-2 hover:outline-black p-2 rounded-md "
                            value={tool}
                            onChange={(e) => setTool(e.target.value)}
                        >
                            <option value="pencil">Pencil</option>
                            <option value="eraser">Eraser</option>
                            <option value="line">Line</option>
                            <option value="rectangle">Rectangle</option>
                        </select>
                        {/* Color */}
                        <div className="flex w-full items-center space-x-2 bg-gray-100 text-black p-2 rounded-md outline:none hover:outline hover:outline-2 hover:outline-black">
                            <span className="text-md">Color:</span>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className=" w-4/5 h-7 rounded-md"
                            />
                        </div>
                        {/* Undo */}
                        <button
                            className="w-full bg-gray-100 text-black p-2 rounded-md outline:none hover:outline hover:outline-2 hover:outline-black"
                            onClick={handleUndo}
                        >
                            Undo
                        </button>
                        {/* Redo */}
                        <button
                            className="w-full bg-gray-100 text-black p-2 rounded-md outline:none hover:outline hover:outline-2 hover:outline-black"
                            onClick={handleRedo}
                        >
                            Redo
                        </button>
                        {/* Clear */}
                        <button
                            className="w-full bg-gray-100 text-black p-2 rounded-md outline:none hover:outline hover:outline-2 hover:outline-black"
                            onClick={handleClearCanvas}
                        >
                            Clear Canvas
                        </button>
                    </div>
                    <ChatBox
                        messages={chatMessages}
                        sendMessage={sendChatMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default RoomPage;
