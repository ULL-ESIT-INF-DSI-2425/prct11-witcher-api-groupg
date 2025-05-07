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
    | "Asesino"
    | "No especificado";
  location: string;
}

const validation = (value: string) => {
  if (!value.match(/^[A-ZÁÉÍÓÚÑ]/)) {
    throw new Error("El nombre y la localizacion del cliente deben comenzar con una letra mayúscula.");
  } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
    throw new Error("El nombre y la localizacion del cliente solo pueden contener letras y espacios.");
  } else if (!validator.isLength(value, { min: 2, max: 30 })) {
    throw new Error("El nombre y la localizacion del cliente deben tener entre 2 y 30 caracteres.");
  }
};

const HunterSchema = new Schema<HunterInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: validation,
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
      "No especificado",
    ],
  },
  location: {
    type: String,
    required: true,
    trim: true,
    validate: validation,
  }
});

export const Hunter = model<HunterInterface>("Hunter", HunterSchema);
