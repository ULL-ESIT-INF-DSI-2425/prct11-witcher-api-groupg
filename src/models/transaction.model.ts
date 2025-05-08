import { Document, Schema, model } from "mongoose";
import { GoodInterface } from "./good.model.js";
import { HunterInterface } from "./hunter.model.js";
import { MerchantInterface } from "./merchant.model.js";
import validator from "validator";

/**
 * Represents a transaction between a hunter/merchant and the system.
 * @interface TransactionInterface
 * @property {Array} goods - Goods involved in the transaction.
 * @property {string} goodcurrentGoods.goodID - Good ID of the item involved in the transaction.
 * @property {number} goodcurrentGoods.amount - Amount of goods involved in the transaction.
 * @property {string} involvedID - ID of the involved (hunter or merchant).
 * @property {string} involvedType - Type of the involved ("Hunter" or "Merchant").
 * @property {string} type - Type of transaction ("Buy" or "Sell").
 * @property {Date} date - Date of the transaction.
 * @property {number} transactionValue - Total value of the transaction.
 * @extends Document (Mongoose)
 */
export interface TransactionInterface extends Document {
  goods: { goodID: GoodInterface; amount: number }[];
  involvedID: HunterInterface | MerchantInterface;
  involvedType: "Hunter" | "Merchant";
  type: "Buy" | "Sell";
  date: Date;
  transactionValue: number;
}

/**
 * Mongoose schema for the Transaction model.
 * @type {Schema}
 * @property {Array} goods - Goods involved in the transaction.
 * @property {Schema.Types.ObjectId} goods.goodID - Good ID of the item involved in the transaction.
 * @property {Number} goods.amount - Amount of goods involved in the transaction.
 * @property {Schema.Types.ObjectId} involvedID - ID of the involved (hunter or merchant).
 * @property {String} involvedType - Type of the involved ("Hunter" or "Merchant").
 * @property {String} type - Type of transaction ("Buy" or "Sell").
 * @property {Date} date - Date of the transaction.
 * @property {Number} transactionValue - Total value of the transaction.
 */
const TransactionSchema = new Schema<TransactionInterface>({
  goods: [
    {
      goodID: {
        type: Schema.Types.ObjectId,
        ref: "Good",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        validate: (value: number) => {
          if (!validator.isInt(value.toString(), { min: 1 })) {
            throw new Error("Good amount must be a positive integer.");
          }
        },
      },
    },
  ],
  involvedID: {
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
    required: false,
  },
  transactionValue: {
    type: Number,
    trim: true,
    required: false,
    default: 0,
    validate: (value: number) => {
      if (value < 0) {
        throw new Error(
          "Transaction value must be greater than or equal to 0.",
        );
      }
    },
  },
});

export const Transaction = model<TransactionInterface>(
  "Transaction",
  TransactionSchema,
);
