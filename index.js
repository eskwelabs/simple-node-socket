const net = require('net');
const fs = require('fs');
const path = require('path');
const LineByLineReader = require('line-by-line');

const PORT = 9001;

function rand(items) {
  // "|" for a kinda "int div"
  return items[items.length * Math.random() | 0];
}

const CSV_FILES = fs.readdirSync('.').filter(f => path.extname(f) == '.csv');

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new net.Server();
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen(PORT, function() {
    console.log(`Server listening for connection requests on socket localhost:${PORT}`);
});

let lineSincePause = 0;

server.on('connection', function(socket) {
    console.log('A new connection has been established.');

    const csvFile = rand(CSV_FILES);
    const lr = new LineByLineReader(csvFile);

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.
    // socket.write('Hello, client.\n');

    // socket.write(`Hi. I will send you ${csvFile}\n`);

    lr.on('line', function(line) {
      socket.write(line);
      lineSincePause = lineSincePause + 1;

      if(lineSincePause > 20 && (Math.random() > 0.5)) {
        const pauseTime = Math.floor(Math.random() * 1000);

        // pause emitting of lines...
        lr.pause();
        lineSincePause = 0;
        // ...do your asynchronous line processing..
        setTimeout(function () {

          // ...and continue emitting lines.
          lr.resume();
        }, pauseTime);
      }
    });


    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function(chunk) {
        console.log(`Data received from client: ${chunk.toString()}`);
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});
