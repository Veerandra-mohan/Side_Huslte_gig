
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IGig } from './Gig';

export interface IMessage extends Document {
  gig: IGig['_id'];
  sender: IUser['_id'];
  receiver: IUser['_id'];
  message: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  gig: { type: Schema.Types.ObjectId, ref: 'Gig', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', MessageSchema);
