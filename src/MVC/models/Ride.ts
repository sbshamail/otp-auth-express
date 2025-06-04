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
  fromLocation: string;
  toLocation: string;
  arrivalTime: Date;
  carNumber: string;
  carPic: string; // optional
  otherImages?: string[];
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

// const LocationSchema: Schema = new Schema({
//   latitude: { type: Number, required: true },
//   longitude: { type: Number, required: true },
// });
const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});
LocationSchema.index({ coordinates: "2dsphere" });
const RideSchema: Schema = new Schema(
  {
    UserId: { type: ObjectId, ref: "User", required: true },
    from: { type: LocationSchema, required: true },
    to: { type: LocationSchema, required: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    arrivalTime: { type: Date, required: true },
    carNumber: { type: String, required: true },
    carPic: { type: String, require: true },
    otherImages: {
      type: [String],
    },
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
