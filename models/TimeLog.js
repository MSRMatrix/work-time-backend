import mongoose, { Schema, model } from "mongoose";

const Database = process.env.DATABASE;

const TimeSheedDb = mongoose.connection.useDb(Database);

const TimeLogSchema = new Schema(
  {
    hours: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: Number, required: true },
    week: { type: Number, required: true },
    month: { type: Number, required: true },
    dayOff: { type: Number, required: true },
    actualTime: { type: Number, required: true },
    targetValue: { type: Number, required: true },
  },
  { versionKey: false, strictQuery: true }
);

TimeLogSchema.methods.toJSON = function () {
  const log = this.toObject();
  delete log.userId;
  return log;
};

const TimeLog = TimeSheedDb.model("TimeLog", TimeLog);

export default TimeLog;