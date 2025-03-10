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
    const user = await dataFunction(req, res, next);
    const {newLog} = req.body;
    const timelog = await TimeLog.findById(user.timeLog)
    timelog.set(newLog);

    await timelog.save();

    res.status(200).json({message: "Timelog updated!"});
  } catch (error) {
    next(error);
  }
};

export const checkFunction = async (req, res, next) => {
  try {
    const { name, date } = req.body;
    
    const user = await dataFunction(req, res, next);
    const timelog = await TimeLog.findById(user.timeLog);

    if (!timelog) {
      return res.status(404).json({ message: "Timelog nicht gefunden" });
    }

    const dayEntry = timelog.month.find((item) => item.date === date);

    if (!dayEntry) {
      return res.status(404).json({ message: "Datum nicht gefunden" });
    }

    if (["dayOff", "sickDay", "holiday"].includes(name)) {
      dayEntry[name] = !dayEntry[name]; 
      user[name] = dayEntry[name] ? user[name] + 1 : user[name] -  1
    } else {
      return res.status(400).json({ message: "Ungültiger Toggle-Name" });
    }

    // Mongoose über Änderung informieren
    timelog.markModified("month");
    await timelog.save();
    await user.save()

    res.status(200).json(timelog);
  } catch (error) {
    next(error);
  }
};


export const actualTimeCalculator = async (req, res, next) => {
  try {
    const { data } = req.body;
    const user = await dataFunction(req, res, next);
    const timelog = await TimeLog.findById(user.timeLog);

    await timelog.save();
    await user.save()

    res.status(200).json(timelog);
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
