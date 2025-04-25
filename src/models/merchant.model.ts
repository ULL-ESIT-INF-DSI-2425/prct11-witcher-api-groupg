import mongoose, { Document, Schema } from 'mongoose';

export interface MerchantDocumentInterface extends Document {
  /** Nombre del Merchant. */
  name: string;
  /** Tipo de Merchant (por ejemplo, vendedor de armas, alquimista, etc.). */
  type: string;
  /** Ubicación del Merchant. */
  location: string;
}

const MerchantSchema = new Schema<MerchantDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
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

export default mongoose.model<MerchantDocumentInterface>('Merchant', MerchantSchema);
