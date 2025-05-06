import { Document, Schema, model } from 'mongoose';

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
  type: string;
  location: string;
}

const MerchantSchema = new Schema<MerchantInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Note name must start with a capital letter');
      }
    },
  },
  type: {
    type: String,
    trim: true,
    required: true,
    enum: ['blacksmith', 'alchemist', 'general merchant', 'hunter']
  },
  location: {
    type: String,
    trim: true,
    required: true,
  },
})

export const Merchant = model<MerchantInterface>('Merchant', MerchantSchema);
