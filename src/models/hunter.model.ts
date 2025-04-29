import { Document, Schema, model } from 'mongoose';

export interface HunterInterface extends Document {
  name: string;
  type: 'weapons dealer' | 'alchemist' | 'wizard' | 'hunter';
  location: string;
}

const HunterSchema = new Schema<HunterInterface>({
  name: { 
    type: String, 
    required: true,  
    trim: true,
    unique: true 
  },
  type: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ['weapons dealer', 'alchemist', 'wizard', 'hunter']
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
})

export const Hunter = model<HunterInterface>('Hunter', HunterSchema);