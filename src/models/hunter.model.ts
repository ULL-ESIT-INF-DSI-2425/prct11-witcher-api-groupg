import { Document, Schema, model } from "mongoose";
import validator from "validator";

/**
 * Representa un cazador en el sistema.
 * @interface HunterInterface
 * @property {string} name - Nombre del cazador.
 * @property {string} race - Tipo de cazador.
 * @property {string} location - Ubicación del cazador.
 * @extends Document (de Mongoose)
 */
export interface HunterInterface extends Document {
  name: string;
  race:
    | "Humano"
    | "Elfo"
    | "Enano"
    | "Orco"
    | "Hechicero"
    | "Mago"
    | "Guerrero"
    | "Cazador"
    | "Bárbaro"
    | "Clérigo"
    | "Asesino";
  location: string;
}

const HunterSchema = new Schema<HunterInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: (value: string) => {
      if (!value.match(/^[A-ZÁÉÍÓÚÑ]/)) {
        throw new Error(
          "El nombre del cliente debe comenzar con una letra mayúscula.",
        );
      } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
        throw new Error(
          "El nombre del cliente solo puede contener letras y espacios.",
        );
      } else if (!validator.isLength(value, { min: 2, max: 30 })) {
        throw new Error(
          "El nombre del cliente debe tener entre 2 y 30 caracteres.",
        );
      }
    },
  },
  race: {
    type: String,
    required: true,
    trim: true,
    enum: [
      "Humano",
      "Elfo",
      "Enano",
      "Orco",
      "Hechicero",
      "Mago",
      "Guerrero",
      "Cazador",
      "Bárbaro",
      "Clérigo",
      "Asesino",
    ],
  },
  location: {
    type: String,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-ZÁÉÍÓÚÑ]/)) {
        throw new Error(
          "La ubicación del cliente debe comenzar con una letra mayúscula.",
        );
      } else if (!validator.isAlphanumeric(value, "es-ES", { ignore: " " })) {
        throw new Error(
          "La ubicación del cliente solo puede contener letras, números y espacios.",
        );
      } else if (!validator.isLength(value, { min: 2, max: 30 })) {
        throw new Error(
          "La ubicación del cliente debe tener entre 2 y 30 caracteres.",
        );
      }
    },
  },
});

export const Hunter = model<HunterInterface>("Hunter", HunterSchema);
