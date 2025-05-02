import { Document, Schema, model } from 'mongoose';

export interface MerchantInterface extends Document {
  /** Nombre del Merchant. */
  name: string;
  /** Tipo de Merchant (por ejemplo, vendedor de armas, alquimista, etc.). */
  type: string;
  /** Ubicación del Merchant. */
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
