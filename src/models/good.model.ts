import { Document, Schema, model } from 'mongoose';

export interface GoodInterface extends Document {
  name: string;
  description: string;
  material: string;
  weight: number;
  value: number;
}

const GoodSchema = new Schema<GoodInterface>({
  name: {
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
  value: {
    type: Number,
    required: true,
  },
});

export const Good = model<GoodInterface>('Good', GoodSchema);