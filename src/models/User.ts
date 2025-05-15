import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  password: string;
  fullName: string;
  cnic?: string;
  address: string;
  photoUrl?: string;
  status: "active" | "disabled";
  role: "1" | "2";
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    cnic: { type: String },
    address: { type: String, required: true },
    photoUrl: { type: String },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    role: { type: String, enum: ["1", "2"] },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export { User };
