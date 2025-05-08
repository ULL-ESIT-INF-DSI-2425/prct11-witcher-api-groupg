import { Document, Schema, model } from "mongoose";
import validator from "validator";

/**
 * Represents a merchant.
 * @interface MerchantInterface
 * @property {string} name - Merchant name.
 * @property {string} type - Merchant type.
 * @property {string} location - Merchant location.
 * @extends Document (Mongoose)
 */
export interface MerchantInterface extends Document {
  name: string;
  type:
    | "General"
    | "Alchemist"
    | "Blacksmith"
    | "Gunsmith"
    | "Craftman"
    | "Tailor"
    | "Jeweler"
    | "Mage"
    | "Uknown";
  location: string;
}

/**
 * This function validates the name and location of the merchant.
 * @param value - The value to validate.
 * - It must start with an uppercase letter.
 * - It must only contain letters and spaces.
 * - It must be between 2 and 30 characters long.
 * @throws {Error} If the value does not meet the validation criteria.
 */
const validation = (value: string) => {
  const upperCase = /^[A-ZÁÉÍÓÚÑ]/
  if (!upperCase.exec(value)) {
    throw new Error("Merchant name and location must start with an uppercase letter.");
  } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
    throw new Error("Merchant name and location must only contain letters and spaces.");
  } else if (!validator.isLength(value, { min: 2, max: 30 })) {
    throw new Error("Merchant name and location must be between 2 and 30 characters long.");
  }
};

/**
 * Mongoose schema for the Merchant model.
 * @type {Schema}
 * @property {String} name - Merchant name.
 * @property {String} type - Merchant type.
 * @property {String} location - Merchant location.
 */
const MerchantSchema = new Schema<MerchantInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: validation,
  },
  type: {
    type: String,
    trim: true,
    required: true,
    enum: [
      "General",
      "Alchemist",
      "Blacksmith",
      "Gunsmith",
      "Craftman",
      "Tailor",
      "Jeweler",
      "Mage",
      "Uknown",
    ],
  },
  location: {
    type: String,
    trim: true,
    required: true,
    validate: validation,
  },
});

export const Merchant = model<MerchantInterface>("Merchant", MerchantSchema);
