import Forms from "./components/Forms/Forms";
import { Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage";
import { v4 as uuidv4 } from "uuid";

import { io, Socket } from "socket.io-client";
import { useEffect } from "react";

// Update the server URL to match your actual server port
const server = "http://localhost:5000";
const socket: Socket = io(server, {
  transports: ["websocket"]
});
function App() {

  useEffect(() => {
    const handleUserJoined = (data: { success: boolean }) => {
      if (data.success) {
        console.log("User Joined");
      } else {
        console.log("User Joined Error");
      }
    };

    socket.on("userIsJoined", handleUserJoined);

    return () => {
      socket.off("userIsJoined", handleUserJoined);
    };
  }, []);

  return (
    <div className="container">
      <Routes>
        <Route
          path="/"
          element={
            <Forms
              uuid={uuidv4}
              socket={socket}
            />
          }
        />
        <Route path="/:roomId" element={<RoomPage server={server} socket={socket} />} />
      </Routes>
    </div>
  );
}

export default App;