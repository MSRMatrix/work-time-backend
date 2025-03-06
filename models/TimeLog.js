import mongoose, { Schema, model } from "mongoose";

const Database = process.env.DATABASE;

const TimeSheedDb = mongoose.connection.useDb(Database);

const TimeLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: [
      {
        date: { type: String, required: true },
        day: { type: String },
        startWork: { type: String },
        endWork: { type: String },
        startBreak: { type: String },
        endBreak: { type: String },
        totalTime: { type: String },
        dayOff: { type: Boolean, default: false },
        sickDay: { type: Boolean, default: false },
        holiday: { type: Boolean, default: false },
      },
    ],
    dayOff: { type: String },
    sickDay: { type: String },
    holiday: { type: String },
    actualTime: { type: String },
    targetValue: { type: String },
  },
  { versionKey: false, strictQuery: true }
);

TimeLogSchema.methods.toJSON = function () {
  const log = this.toObject();
  delete log.userId;
  return log;
};

const TimeLog = TimeSheedDb.model("TimeLog", TimeLogSchema);

export default TimeLog;
