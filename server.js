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
  (err, db) => {
    if (err) throw err;
    debug(`Connected to db successfully!`);
  }
);
