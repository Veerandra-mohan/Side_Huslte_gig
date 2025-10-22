
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IGig extends Document {
  user: IUser['_id'];
  community: string;
  title: string;
  description: string;
  createdAt: Date;
}

const GigSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IGig>('Gig', GigSchema);
