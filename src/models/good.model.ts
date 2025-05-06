import { Document, Schema, model } from 'mongoose';

/**
 * Representa un bien en el sistema.
 * @interface GoodInterface
 * @property {string} name - Nombre del bien.
 * @property {string} description - Descripción del bien.
 * @property {string} material - Material del bien.
 * @property {number} weight - Peso del bien.
 * @property {number} quantity - Cantidad del bien.
 * @property {number} value - Valor del bien.
 * @extends Document (de Mongoose)
 */
export interface GoodInterface extends Document {
  name: string;
  description: string;
  material: string;
  weight: number;
  quantity: number;
  value: number;
}

const GoodSchema = new Schema<GoodInterface>({
  name: {
    unique: true,
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  material: {
    type: String,
    required: true,
    trim: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

export const Good = model<GoodInterface>('Good', GoodSchema);