import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}
// Store speaking times for meeting productivity tracking
let userSpeakingTimes = {}
// Store shared code for each room
let sharedCode = {}
// Store polls by roomId
let polls = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // Initialize shared code for this room if it doesn't exist
            if (sharedCode[path] === undefined) {
                sharedCode[path] = "// Start coding together...\nfunction hello() {\n  console.log('Hello, Meetly!');\n}";
            }

            // connections[path].forEach(elem => {
            //     io.to(elem)
            // })

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        // Whiteboard event listeners
        socket.on("draw", (data) => {
            // Get the room for this socket
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            
            if (found === true) {
                // Broadcast to all other users in the same room
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("draw", data);
                    }
                });
            }
        });

        socket.on("clear", () => {
            // Get the room for this socket
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            
            if (found === true) {
                // Broadcast clear to all users in the same room
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("clear");
                });
            }
        });

        // Speaking time tracking events
        socket.on("start-speaking", (userId) => {
            // Get the room for this socket
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            
            if (found === true) {
                // Initialize user speaking time record if it doesn't exist
                if (!userSpeakingTimes[matchingRoom]) {
                    userSpeakingTimes[matchingRoom] = {};
                }
                
                if (!userSpeakingTimes[matchingRoom][userId]) {
                    userSpeakingTimes[matchingRoom][userId] = { total: 0, start: null };
                }
                
                userSpeakingTimes[matchingRoom][userId].start = Date.now();
                
                // Broadcast updated times to all users in the same room
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("update-times", userSpeakingTimes[matchingRoom]);
                });
            }
        });

        socket.on("stop-speaking", (userId) => {
            // Get the room for this socket
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            
            if (found === true && userSpeakingTimes[matchingRoom] && userSpeakingTimes[matchingRoom][userId]) {
                const record = userSpeakingTimes[matchingRoom][userId];
                if (record && record.start) {
                    record.total += Date.now() - record.start;
                    record.start = null;
                }
                
                // Broadcast updated times to all users in the same room
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("update-times", userSpeakingTimes[matchingRoom]);
                });
            }
        });

        // Code collaboration events
        socket.on("get-code", () => {
            // Get the room for this socket
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            
            if (found === true) {
                // Send current code to the user who requested it
                socket.emit("init-code", sharedCode[matchingRoom] || "// Start coding together...");
            }
        });

        socket.on("code-change", (newCode) => {
            // Get the room for this socket
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);
            
            if (found === true) {
                // Update shared code for this room
                sharedCode[matchingRoom] = newCode;
                
                // Broadcast code change to all other users in the same room
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("update-code", newCode);
                    }
                });
            }
        });

        // Poll events
        // Create a new poll
        socket.on("createPoll", ({ roomId, question, options }) => {
            polls[roomId] = { question, options, votes: Array(options.length).fill(0) };
            io.to(roomId).emit("newPoll", polls[roomId]);
            console.log(`Poll created in room ${roomId}`);
        });

        // Submit vote
        socket.on("votePoll", ({ roomId, optionIndex }) => {
            if (polls[roomId]) {
                polls[roomId].votes[optionIndex] += 1;
                io.to(roomId).emit("updatePoll", polls[roomId]);
            }
        });

        // End poll
        socket.on("endPoll", ({ roomId }) => {
            if (polls[roomId]) {
                io.to(roomId).emit("pollEnded", polls[roomId]);
                delete polls[roomId];
            }
        });

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                            
                            // Clean up speaking times for this room
                            if (userSpeakingTimes[key]) {
                                delete userSpeakingTimes[key];
                            }
                            
                            // Clean up shared code for this room
                            if (sharedCode[key]) {
                                delete sharedCode[key];
                            }
                            
                            // Clean up polls for this room
                            if (polls[key]) {
                                delete polls[key];
                            }
                        }
                    }
                }

            }


        })


    })


    return io;
}