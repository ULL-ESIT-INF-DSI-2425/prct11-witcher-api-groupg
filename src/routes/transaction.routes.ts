import express from 'express';
import { Transaction } from '../models/transaction.model.js';

const transactionRouter = express.Router();
transactionRouter.post('/transaction', async (req, res) => {
  const transaction = new Transaction(req.body);
  try {
    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    res.status(400).send(error);
  }
});

