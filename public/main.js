// console.log("THis is called");

const io = require("socket.io-client");
const {Terminal} = require("xterm");

var socket1;

global.saveFile = function (){

}

global.runCommand =function(command){
  if(command=="echo"){

  } else if (command=="run"){
    command = "python /py/index.py\n";
    socket1.emit("input", command);
  }
}

class TerminalUI {
  constructor(socket) {
    this.terminal = new Terminal();
    this.socket = socket;
  }
  /**
   * Attach event listeners for terminal UI and socket.io client
   */
  startListening() {
    this.terminal.onData(data => {
        this.sendInput(data);
    });
    this.socket.on("output", data => {
      // When there is data from PTY on server, print that on Terminal.
      this.write(data);
    });
  }

  /**
   * Print something to terminal UI.
   */
  write(text) {
    this.terminal.write(text);
  }

  /**
   * Utility function to print new line on terminal.
   */
  prompt() {
    this.terminal.write(``);
  }

  /**
   * Send whatever you type in Terminal UI to PTY process in server.
   * @param {*} input Input to send to server
   */
  sendInput(input) {
    this.socket.emit("input", input);
  }

  /**
   *
   * container is a HTMLElement where xterm can attach terminal ui instance.
   * div#terminal-container in this example.
   */
  attachTo(container) {
    this.terminal.open(container);
    // Default text to display on terminal.
    // this.terminal.write("Terminal Connected");
    this.terminal.write("\n");
    this.prompt();
  }

  clear() {
    this.terminal.clear();
    this.terminal.write("\n");
  }
}

// IMPORTANT: Make sure you replace this address with your server address.

const serverAddress = "http://localhost:8080";

function connectToSocket(serverAddress) {
  return new Promise((res,rej) => {
    const socket = io(serverAddress);
    res(socket)
  });
}

function startTerminal(container, socket) {
  // Create an xterm.js instance.
  const terminal = new TerminalUI(socket);

  // Attach created terminal to a DOM element.
  terminal.attachTo(container);

  // When terminal attached to DOM, start listening for input, output events.
  // Check TerminalUI startListening() function for details.
  terminal.startListening();
}


function start() {
  const container = document.getElementById("terminal-container");
  // Connect to socket and when it is available, start terminal.
  // console.log("Started")
  connectToSocket(serverAddress).then(socket => {
    //  socket1 = socket;
    startTerminal(container, socket);
  }).then(err=>{console.log("socket was not connected")});
}

// Better to start on DOMContentLoaded. So, we know terminal-container is loaded
start();
