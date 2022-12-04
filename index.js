//index.js
const http = require("http");
var cors = require('cors')
const bodyParser = require("body-parser");
const fs = require('fs');
 
const express = require("express")
const app = express();
app.use(cors())
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/test", (req,res)=>{res.render("index")});
app.get("/terminal", (req, res) => {res.render("terminal")});

app.post("/save", (req, res)=> {
  fs.writeFile("/usr/py/"+req.body['file'], req.body['value'], err => {
    if (err) {
      console.error(err);
    }
    return res.send({"success":"201"})
  });
})

// terminal socket programming

const server = require("http").Server(app);
  
const PTYService = require("./PTYService");

class SocketService {
  constructor() {
     this.socket = null;
     this.pty = null;
  }

  attachServer(server) {
    if (!server) {
      throw new Error("Server not found...");
    }

    const io = require('socket.io')(server, {
        cors: {
          origin: '*',
      }
    });

    console.log("Created socket server. Waiting for client connection.");
    // "connection" event happens when any client connects to this io instance.
    io.on("connection", socket => {
      console.log("Client connect to socket.", socket.id);

      this.socket = socket;

      this.socket.on("disconnect", () => {
        console.log("Disconnected Socket: ", socket.id);
      });

      // Create a new pty service when client connects.
      this.pty = new PTYService(this.socket);

     // Attach event listener for socket.io
      this.socket.on("input", input => {
        // Runs this listener when socket receives "input" events from socket.io client.
                // input event is emitted on client side when user types in terminal UI
        this.pty.write(input);
      });
    });
  }
}

const port = 8080;

server.listen(port, function() {
  console.log("Server listening on : ", port);
  const socketService = new SocketService();
  socketService.attachServer(server);
});
