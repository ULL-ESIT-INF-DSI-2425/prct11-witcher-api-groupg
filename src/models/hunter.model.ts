import mongoose, { Document, Schema } from 'mongoose';

export interface HunterDocumentInterface extends Document {
  name: string;
  type: 'weapons dealer' | 'alchemist' | 'wizard' | 'hunter';
  location: string;
}

const HunterSchema = new Schema<HunterDocumentInterface>({
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

export default mongoose.model<HunterDocumentInterface>('Hunter', HunterSchema);