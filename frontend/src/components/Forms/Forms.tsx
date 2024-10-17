import { Socket } from "socket.io-client"; // Only import Socket
import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";

// Define the RoomData interface
interface RoomData {
    name: string;
    roomId: string;
    userId: string;
    host: boolean;
    presenter: boolean;
}

interface FormsProps {
    uuid: () => string; // Function type for UUID
    socket: Socket; // Socket type
}

export default function Forms({ uuid, socket }: FormsProps) {
    return (
        <div className="container mx-auto md:mt-5 p-4 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                    <CreateRoomForm uuid={uuid} socket={socket} />
                </div>
                <div className="w-full">
                    <JoinRoomForm uuid={uuid} socket={socket} />
                </div>
            </div>
        </div>
    );
}
