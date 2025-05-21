import mongoose, { Schema, Document } from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

interface ILocation {
  latitude: number;
  longitude: number;
}

export interface IRide extends Document {
  UserId: mongoose.Types.ObjectId;
  from: ILocation;
  to: ILocation;
  arrivalTime: Date;
  carNumber: string;
  carPic?: string; // optional
  carType: string;
  carName: string;
  carModel?: string;
  seatsAvailable: number;
  negotiable: boolean;
  pricePerSeat?: number;
  totalPrice?: number;
  notes?: string;
  createdAt: Date;
}

const LocationSchema: Schema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const RideSchema: Schema = new Schema(
  {
    UserId: { type: ObjectId, ref: "User", required: true },
    from: { type: LocationSchema, required: true },
    to: { type: LocationSchema, required: true },
    arrivalTime: { type: Date, required: true },
    carNumber: { type: String, required: true },
    carPic: { type: String },
    seatsAvailable: { type: Number, required: true },
    pricePerSeat: { type: Number },
    totalPrice: { type: Number },
    negotiable: {
      type: Boolean,
    },
    notes: { type: String },
    carType: {
      type: String,
      enum: ["car", "van", "box", "jeep", "other"],
      required: true,
    },

    carName: {
      type: String,
      required: true,
    },

    carModel: {
      type: String,
    },
  },
  { timestamps: true }
);

const Ride = mongoose.model<IRide>("Ride", RideSchema);
export { Ride };
