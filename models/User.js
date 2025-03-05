import mongoose, { Schema, model } from "mongoose";

const Database = process.env.DATABASE;

const TimeSheedDb = mongoose.connection.useDb(Database);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    totalHours: { type: Number, default: 0 },
    timeLog: { type: mongoose.Schema.Types.ObjectId, ref: "TimeLog" },
  },
  { versionKey: false, strictQuery: true }
);

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user._id;
  delete user.role;
  return user;
};

const User = TimeSheedDb.model("User", UserSchema);

export default User;

// import mongoose, { Schema, model } from "mongoose";

// const UserSchema = new Schema(
//   {
//     username: { type: String, required: true, unique: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     verified: { type: Boolean, default: false },
//     twoFactorAuthentication: { type: Boolean },
//     code: { type: Number },
//     attempts: { type: Number },
//     createdAt: { type: Date, default: Date.now },
//     timeout: { type: Date },
//     role: { type: String, enum: ["User"], default: "User" },
//     list: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
//   },
//   { versionKey: false, strictQuery: true }
// );

// UserSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user._id;
//   delete user.role;
//   delete user.verified;
//   delete user.code;
//   delete user.attempts;
//   delete user.timeout;
//   delete user.twoFactorAuthentication;
//   return user;
// };

// const User = model("User", UserSchema);

// export default User;
