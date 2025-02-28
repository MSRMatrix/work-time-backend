import mongoose, { Schema, model } from "mongoose";

const Database = process.env.DATABASE;

const TimeSheedDb = mongoose.connection.useDb(Database);

const TimeLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: [
      {
        date: { type: Number, required: true, required: true },
        workTime: { type: Number },
        clients: { type: Number },
        breakTime: { type: Number},
        totalTime: { type: Number},
      },
    ],
    dayOff: { type: Number },
    sickDay: { type: Number },
    holiday: { type: Number },
    actualTime: { type: Number },
    targetValue: { type: Number },
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