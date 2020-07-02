const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.stack);
  console.log(`${err.name}:, ${err.message}`);
  console.log('UNCAUGHT EXCEPTION Shutting down ...');
  process.exit(1);
});
dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('db connection successfully!');
  });

const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`app running from the port ${server.address().port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log(`${err.name}:, ${err.message}`);
  console.log('UNHANDLED REJECTION Shutting down ...');
  server.close(() => {
    process.exit(1);
  });
});
