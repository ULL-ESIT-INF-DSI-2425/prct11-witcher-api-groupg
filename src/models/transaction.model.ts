import { Document, Schema, model } from "mongoose";
import { GoodInterface } from "./good.model.js";
import { HunterInterface } from "./hunter.model.js";
import { MerchantInterface } from "./merchant.model.js";

interface TransactionInterface extends Document {
  goodIds: GoodInterface["_id"][];
  involvedId: HunterInterface["_id"] | MerchantInterface["_id"];
  date: Date;
  amount: number;
}

const TransactionSchema = new Schema<TransactionInterface>({
  goodIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Good",
      required: true,
    },
  ],
  involvedId: {
    type: Schema.Types.ObjectId,
    refPath: "involvedType",
    required: true,
  },
  date: {
    trim: true,
    required: true,
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
    trim: true,
  },
});

TransactionSchema.statics.calculateAmount = async function (transactionId: string): Promise<number> {
  const transaction = await this.findById(transactionId).populate("goodIds", "value");
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const totalAmount = transaction.goodIds.reduce((sum: number, good: any) => sum + good.price, 0);
  return totalAmount;
};

export const Transaction = model<TransactionInterface>(
  "Transaction",
  TransactionSchema,
);
