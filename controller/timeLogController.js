import { comparePassword } from "../middlewares/hashPassword.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import he from "he";
import TimeLog from "../models/TimeLog.js";
import mongoose from "mongoose";
import { dataFunction } from "../helpers/dataFunction.js";

const secretKey = process.env.JWT_SECRET;

export const createTimelog = async (req, res, next) => {
  try {
    const { month, year, dayOff, sickDay, holiday, actualTime, targetValue } =
      req.body;

    const user = await dataFunction(req, res, next);
    if (user.timeLog) {
      await TimeLog.findByIdAndDelete({ _id: user.timeLog });
    }

    const newTimeLog = new TimeLog({
      userId: user._id,
      month: req.body.monthData,
      dayOff: dayOff || "0",
      sickDay: sickDay || "0",
      holiday: holiday || "0",
      actualTime: actualTime || "0",
      targetValue: targetValue || "0",
      disable: false
    });

    user.timeLog = newTimeLog._id;

    await user.save();
    await newTimeLog.save();

    res.status(201).json(newTimeLog);
  } catch (error) {
    next(error);
  }
};

export const updateTimelog = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const deleteTimelog = async (req, res, next) => {
  try {
    const user = await dataFunction(req, res, next);

    if (!user) {
      return res.status(404).json({ message: "Nutzer nicht gefunden" });
    }

    if (!user.timeLog) {
      return res.status(404).json({ message: "Kein TimeLog gefunden" });
    }

    await TimeLog.findByIdAndDelete(user.timeLog);

    await User.findByIdAndUpdate(user._id, { $unset: { timeLog: "" } });

    res.status(200).json({ message: "Monat gelöscht!" });
  } catch (error) {
    next(error);
  }
};
