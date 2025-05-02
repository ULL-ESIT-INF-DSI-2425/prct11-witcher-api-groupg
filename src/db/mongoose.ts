import { connect } from 'mongoose';

try {
  await connect('mongodb://127.0.0.1:27017/notes-api');
  console.log('Connection to MongoDB server established');
} catch (error) {
  console.log(error);
}