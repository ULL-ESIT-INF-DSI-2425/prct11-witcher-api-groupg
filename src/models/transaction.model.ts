import { Document, Schema, model } from "mongoose";
import { Good } from "./good.model.js";
import { Hunter } from "./hunter.model.js";
import { Merchant } from "./merchant.model.js";

interface TransactionInterface extends Document {
  goodDetails: { goodId: string; quantity: number }[];
  involvedId: Schema.Types.ObjectId;
  involvedType: "Hunter" | "Merchant";
  type: "Buy" | "Sell";
  date: Date;
  amount: number;
}

const TransactionSchema = new Schema<TransactionInterface>({
  goodDetails: [
    {
      goodId: {
        type: Schema.Types.ObjectId,
        ref: "Good",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  involvedId: {
    type: Schema.Types.ObjectId,
    refPath: "involvedType",
    required: true,
  },
  involvedType: {
    type: String,
    required: true,
    enum: ["Hunter", "Merchant"],
  },
  type: {
    type: String,
    required: true,
    enum: ["Buy", "Sell"],
  },
  date: {
    type: Date,
    default: Date.now,
    trim: true,
    required: true,
  },
  amount: {
    type: Number,
    trim: true,
    required: true,
  },
});

// Middleware para calcular el importe total antes de guardar
TransactionSchema.pre("save", async function (next) {
  const transaction = this as TransactionInterface;

  // Verificar existencia de cazador/mercader
  const involved =
    transaction.involvedType === "Hunter"
      ? await Hunter.findById(transaction.involvedId)
      : await Merchant.findById(transaction.involvedId);

  if (!involved) {
    throw new Error(`${transaction.involvedType} no encontrado`);
  }

  // Calcular el importe total
  let totalAmount = 0;
  for (const detail of transaction.goodDetails) {
    const good = await Good.findById(detail.goodId);
    if (!good) {
      throw new Error(`Bien con ID ${detail.goodId} no encontrado`);
    }
    if (transaction.type === "Sell" && good.quantity < detail.quantity) {
      throw new Error(`Stock insuficiente para el bien ${good.name}`);
    }
    totalAmount += good.value * detail.quantity;
  }
  transaction.amount = totalAmount;

  next();
});

export const Transaction = model<TransactionInterface>(
  "Transaction",
  TransactionSchema
);