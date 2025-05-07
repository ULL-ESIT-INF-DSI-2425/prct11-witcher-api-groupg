import { Document, Schema, model } from "mongoose";
import validator from "validator";

/**
 * Representa un bien en el sistema.
 * @interface GoodInterface
 * @property {string} name - Nombre del bien.
 * @property {string} description - Descripción del bien.
 * @property {string} material - Material del bien.
 * @property {number} weight - Peso del bien.
 * @property {number} stock - Cantidad de bienes disponibles.
 * @property {number} value - Valor en coronas del bien.
 * @extends Document (de Mongoose)
 */
export interface GoodInterface extends Document {
  name: string;
  description: string;
  material:
    | "Acero"
    | "Madera"
    | "Piedra"
    | "Hierro"
    | "Cuero"
    | "Tela"
    | "Vidrio"
    | "Bronce"
    | "Plata"
    | "Oro"
    | "Desconocido";
  weight: number;
  stock: number;
  value: number;
}

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
          "El nombre del bien debe comenzar con una letra mayúscula.",
        );
      } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
        throw new Error(
          "El nombre del bien solo puede contener letras y espacios.",
        );
      } else if (!validator.isLength(value, { min: 2, max: 30 })) {
        throw new Error(
          "El nombre del bien debe tener entre 2 y 30 caracteres.",
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
          "La descripción del bien debe comenzar con una letra mayúscula.",
        );
      } else if (!validator.isAlphanumeric(value, "es-ES", { ignore: " " })) {
        throw new Error(
          "La descripción del bien solo puede contener letras, números y espacios.",
        );
      } else if (!validator.isLength(value, { min: 10, max: 100 })) {
        throw new Error(
          "El nombre del bien debe tener entre 10 y 100 caracteres.",
        );
      }
    },
  },
  material: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Acero",
      "Madera",
      "Piedra",
      "Hierro",
      "Cuero",
      "Tela",
      "Vidrio",
      "Bronce",
      "Plata",
      "Oro",
      "Desconocido",
    ],
  },
  weight: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error("El peso del bien debe ser mayor que 0.");
      }
    },
  },
  stock: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (!validator.isInt(value.toString(), { min: 1 })) {
        throw new Error(
          "El stock del bien debe ser un número entero positivo.",
        );
      }
    },
  },
  value: {
    type: Number,
    required: true,
    validate: (value: number) => {
      if (value <= 0) {
        throw new Error("El valor del bien debe ser mayor que 0.");
      }
    },
  },
});

export const Good = model<GoodInterface>("Good", GoodSchema);
