import { connect } from 'mongoose';

connect('mongodb://127.0.0.1:27017').then(() => {
  console.log('Connection to MongoDB server established');
}).catch(() => {
  console.log('Unable to connect to MongoDB server');
});