import mongoose, { Schema, Document } from "mongoose";

export interface IAnalysis extends Document {
  userId?: mongoose.Schema.Types.ObjectId;
  ipAddress?: string;
  transcription: string;
  personalityAnalysis: string;
  createdAt: Date;
}

const AnalysisSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
  ipAddress: { type: String, required: false },
  transcription: { type: String, required: true },
  personalityAnalysis: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Analysis ||
  mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
