require('dotenv').config();

const chalk = require('chalk');
const express = require('express');
const { MongoClient } = require('mongodb');
const morgan = require('morgan');
const debug = require('debug')('app:index');
const socket = require('socket.io');
const helmet = require('helmet');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));

app.use(express.static('public'));

const server = app.listen(PORT, () => {
  debug(
    `Webserver started successfull on port ... ${chalk.inverse.green.bold(
      PORT
    )}`
  );
});

const io = socket(server);

// connect to mongo
MongoClient.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true },
  (err, client) => {
    if (err) throw err;
    debug(`Connected to db successfully!`);

    // connecti to socket.io
    io.on('connection', (socket) => {
      debug(`Connect established: ${chalk.bold.green(socket.id)}`);
      let chat = client.db('mongochat').collection('chats');

      // send status
      const sendStatus = (status) => {
        socket.emit('status', status);
      };

      // get chats
      chat
        .find()
        .limit(100)
        .sort({ _id: 1 })
        .toArray((err, res) => {
          if (err) throw err;
          socket.emit('output', res);
        });

      // input events
      socket.on('input', (data) => {
        const { name, message } = data;
        if (!name || !message) {
          return sendStatus(`Please enter a name and message`);
        }
        chat.insert(
          {
            name,
            message
          },
          () => {
            io.emit('output', [data]);
            sendStatus({
              message: 'Message sent',
              clear: true
            });
          }
        );
      });
      // handle clear
      socket.on('clear', (data) => {
        // remove all chats from the collection
        chat.remove({}, () => {
          socket.emit('cleared');
        });
      });
    });
  }
);
