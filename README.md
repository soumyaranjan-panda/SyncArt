# Sync App
[Frontend](https://sync-art.vercel.app/) | [Backend](https://syncart.onrender.com) 

A real-time collaborative application built with React, TypeScript, and socket.io, designed for seamless synchronization and interaction between users in different rooms. The frontend is hosted on Vercel, and the backend is deployed on Render.



## Demo

[Watch on YouTube](https://www.youtube.com/watch?v=33xZUR5Of-w&t)

## Features

- **Room-based Synchronization**: Users can create or join rooms using unique room codes generated via UUID.
- **Real-time Chat**: Instant messaging within rooms using socket.io for real-time data transfer.
- **User Management**: Users are assigned unique IDs based on their socket connection.
- **Collaborative Whiteboard**: Draw, write, and collaborate on a shared whiteboard using interactive UI components.
- **Frontend and Backend Deployment**: The frontend is served via Vercel, while the backend is deployed on Render.

## Tech Stack

- **Frontend**: React, TypeScript, CSS
- **Backend**: Node.js, Express, socket.io
- **Deployment**: Vercel (frontend), Render (backend)
- **Tools**: GitHub for version control

## Installation and Setup

To set up the development environment locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/sync-app.git
   cd sync-app
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Usage

### Creating or Joining a Room:

- Open the app and click on "Create Room" to generate a new room with a unique code.
- Share the code with others or join an existing room using a provided code.

### Real-time Chat:

- Use the chat panel to send and receive messages with other users in the room instantly.

### Collaborative Whiteboard:

- Draw and interact with others on the whiteboard. All changes are synchronized in real-time.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /rooms/:roomId/users | Get all the users in the room |

## Folder Structure

```
sync-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
├── backend/
│   └── server.js
└── README.md
```

## Contributing

1. Fork the repository and create a new branch:
   ```bash
   git checkout -b feature-branch
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "Add new feature"
   ```

3. Push to your forked repository and create a pull request:
   ```bash
   git push origin -u feature-branch
   ```

## Troubleshooting

- **Socket Connection Issues**: Ensure the backend is correctly running and the socket.io connection is established on the same port.
- **CORS Errors**: Make sure the frontend URL is whitelisted in the backend CORS configuration.

---

© 2024 Sync App. All rights reserved.
