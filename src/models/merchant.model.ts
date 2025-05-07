import { Document, Schema, model } from "mongoose";
import validator from "validator";

/**
 * Representa un mercader en el sistema.
 * @interface MerchantInterface
 * @property {string} name - Nombre del mercader.
 * @property {string} type - Tipo de mercader.
 * @property {string} location - Ubicación del mercader.
 * @extends Document (de Mongoose)
 */
export interface MerchantInterface extends Document {
  name: string;
  type:
    | "General"
    | "Alquimista"
    | "Herrero"
    | "Cazador"
    | "Armero"
    | "Artesano"
    | "Sastre"
    | "Joyero"
    | "Mago"
    | "No especificado";
  location: string;
}

const validation = (value: string) => {
  if (!value.match(/^[A-ZÁÉÍÓÚÑ]/)) {
    throw new Error("El nombre y la localizacion del mercader deben comenzar con una letra mayúscula.");
  } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
    throw new Error("El nombre y la localizacion del mercader solo pueden contener letras y espacios.");
  } else if (!validator.isLength(value, { min: 2, max: 30 })) {
    throw new Error("El nombre y la localizacion del mercader deben tener entre 2 y 30 caracteres.");
  }
};

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
      "Alquimista",
      "Herrero",
      "Cazador",
      "Armero",
      "Artesano",
      "Sastre",
      "Joyero",
      "Mago",
      "No especificado",
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
