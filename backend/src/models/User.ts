
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Make password optional on the interface
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Keep password required in the schema but hide it by default
});

export default mongoose.model<IUser>('User', UserSchema);
