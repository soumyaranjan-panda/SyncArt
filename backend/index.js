const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const rooms = new Map();

io.on("connection", (socket) => {
    console.log("A user connected");
    let namex = "";

    socket.on("userJoined", (data) => {
        const { name, userId, roomId, host, presenter } = data;
        namex = name;
        console.log(`Name: ${name} UserId: ${userId} RoomId: ${roomId} Host: ${host} Presenter: ${presenter}`);
        io.emit("userJoined", {name, userId, roomId, host, presenter});
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { users: new Set([{ userId, name }]), elements: [] });
        } else {
            rooms.get(roomId).users.add({ userId, name });
        }
        
        // Log all users in the room
        const usersInRoom = Array.from(rooms.get(roomId).users);
        console.log(usersInRoom);
        console.log(`Current users in room ${roomId}:\n`, usersInRoom);
        
        socket.emit("userIsJoined", { success: true });
        io.to(roomId).emit("updateUsers", usersInRoom);
        socket.emit("updateDrawing", rooms.get(roomId).elements);
    });

    socket.on("drawElement", (data) => {
        const { roomId, element } = data;
        if (rooms.has(roomId)) {
            rooms.get(roomId).elements.push(element);
            socket.to(roomId).emit("drawElement", element);
        }
    });

    socket.on("updateElement", (data) => {
        const { roomId, element } = data;
        if (rooms.has(roomId)) {
            const roomElements = rooms.get(roomId).elements;
            const index = roomElements.findIndex(el => el.id === element.id);
            if (index !== -1) {
                roomElements[index] = element;
                socket.to(roomId).emit("updateElement", element);
            }
        }
    });

    socket.on("updateDrawing", (data) => {
        const { roomId, elements } = data;
        if (rooms.has(roomId)) {
            rooms.get(roomId).elements = elements;
            socket.to(roomId).emit("updateDrawing", elements);
        }
    });

    socket.on("chatMessage", (data) => {
        const {roomId, message, userId } = data;

        io.to(roomId).emit("chatMessage", message, namex);
    });


    socket.on("disconnect", () => {
        rooms.forEach((room, roomId) => {
            // Remove user from room
            const userToRemove = Array.from(room.users).find(user => user.userId === socket.id);
            if (userToRemove) {
                room.users.delete(userToRemove);
                io.to(roomId).emit("updateUsers", Array.from(room.users));
                console.log(`User ${userToRemove.name} has disconnected. Remaining users in room ${roomId}:`, Array.from(room.users));
            }
        });
    });
});

// New endpoint to get users in a room
app.get("/rooms/:roomId/users", (req, res) => {
    const roomId = req.params.roomId;

    if (rooms.has(roomId)) {
        const users = Array.from(rooms.get(roomId).users);
        return res.json(users);
    } else {
        return res.status(404).json({ message: "Room not found" });
    }
});

app.get("/", (req, res) => {
    res.send("SyncArt Server is running");
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server started at port: ${port}`);
});
