import mongoose, { Schema, Document } from "mongoose";

export interface IAnalysis extends Document {
  transcription: string;
  personalityAnalysis: string;
  createdAt: Date;
}

const AnalysisSchema: Schema = new Schema({
  transcription: { type: String, required: true },
  personalityAnalysis: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Analysis ||
  mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
