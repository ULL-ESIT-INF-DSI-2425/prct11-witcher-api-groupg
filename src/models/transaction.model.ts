import { Document, Schema, model } from "mongoose";
import { GoodInterface } from "./good.model.js";
import { HunterInterface } from "./hunter.model.js";
import { MerchantInterface } from "./merchant.model.js";
import validator from "validator";

/**
 * Representa una transacción entre un Cazador/Mercader y el sistema.
 * @interface TransactionInterface
 * @property {Array} goods - Bienes involucrados en la transacción
 * @property {string} goodcurrentGoods.goodID - ID del bien.
 * @property {number} goodcurrentGoods.amount - Cantidad de bienes.
 * @property {string} involvedID - ID del cazador o mercader involucrado.
 * @property {string} involvedType - Tipo de involucrado ("Hunter" o "Merchant").
 * @property {string} type - Tipo de transacción ("Buy" o "Sell").
 * @property {Date} date - Fecha de la transacción.
 * @property {number} transactionValue - Importe total de la transacción.
 * @extends Document (de Mongoose)
 */
export interface TransactionInterface extends Document {
  goods: { goodID: GoodInterface; amount: number }[];
  involvedID: HunterInterface | MerchantInterface;
  involvedType: "Hunter" | "Merchant";
  type: "Buy" | "Sell";
  date: Date;
  transactionValue: number;
}

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
            throw new Error(
              "La cantidad de bienes debe ser un número entero mayor que 0",
            );
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
        throw new Error("El valor del bien debe ser mayor o igual que 0.");
      }
    },
  },
});

export const Transaction = model<TransactionInterface>(
  "Transaction",
  TransactionSchema,
);
