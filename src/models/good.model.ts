import { Document, Schema, model } from "mongoose";
import validator from "validator";

/**
 * Represents a good in the database.
 * @interface GoodInterface
 * @property {string} name - Good name.
 * @property {string} description - Good description.
 * @property {string} material - Good material.
 * @property {number} weight - Good weight in kilograms.
 * @property {number} stock - Good stock quantity.
 * @property {number} value - Good value.
 * @extends Document (Mongoose)
 */
export interface GoodInterface extends Document {
  name: string;
  description: string;
  material:
    | "Steel"
    | "Wood"
    | "Stone"
    | "Iron"
    | "Leather"
    | "Cloth"
    | "Glass"
    | "Bronze"
    | "Silver"
    | "Gold"
    | "Unknown";
  weight: number;
  stock: number;
  value: number;
}

/**
 * Mongoose schema for the Good model.
 * @type {Schema}
 * @property {String} name - Good name.
 * @property {String} description - Good description.
 * @property {String} material - Good material.
 * @property {Number} weight - Good weight in kilograms.
 * @property {Number} stock - Good stock quantity.
 * @property {Number} value - Good value.
 */
const GoodSchema = new Schema<GoodInterface>({
  name: {
    unique: true,
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const startsWithUppercase = /^[A-ZÁÉÍÓÚÑ]/
      if (!startsWithUppercase.exec(value)) {
        throw new Error(
          "Good name must start with an uppercase letter.",
        );
      } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
        throw new Error(
          "Good name can only contain letters and spaces.",
        );
      } else if (!validator.isLength(value, { min: 2, max: 30 })) {
        throw new Error(
          "Good name must be between 2 and 30 characters.",
        );
      }
    },
  },
  description: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      const startsWithUppercase = /^[A-ZÁÉÍÓÚÑ]/;
      if (!startsWithUppercase.exec(value)) {
        throw new Error(
          "Good description must start with an uppercase letter.",
        );
      } else if (!validator.isAlphanumeric(value, "es-ES", { ignore: " " })) {
        throw new Error(
          "Good description can only contain letters, numbers, and spaces.",
        );
      } else if (!validator.isLength(value, { min: 10, max: 100 })) {
        throw new Error(
          "Good description must be between 10 and 100 characters.",
        );
      }
    },
  },
  material: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Steel",
      "Wood",
      "Stone",
      "Iron",
      "Leather",
      "Cloth",
      "Glass",
      "Bronze",
      "Silver",
      "Gold",
      "Unknown",
    ],
  },
  weight: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error("Weight must be greater than 0.");
      }
    },
  },
  stock: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (!validator.isInt(value.toString(), { min: 1 })) {
        throw new Error(
          "Good stock must be a positive integer.",
        );
      }
    },
  },
  value: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error("Good value must be greater than 0.");
      }
    },
  },
});

export const Good = model<GoodInterface>("Good", GoodSchema);
