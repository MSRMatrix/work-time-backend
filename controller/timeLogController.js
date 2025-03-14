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
    const { monthData, actualTime, targetValue } = req.body;

    const user = await dataFunction(req, res, next);

    if (user.timeLog) {
      const timelog = await TimeLog.findById(user.timeLog);

      if (timelog) {
        timelog.month.push(...monthData);
        timelog.hoursFromLastMonth = timelog.actualTime;
        timelog.actualTime = "00S 00M";
        await timelog.save();

        return res.status(200).json(timelog);
      }
    }

    const newTimeLog = new TimeLog({
      userId: user._id,
      month: monthData,
      actualTime: actualTime || "00S 00M",
      targetValue: targetValue || "00S 00M",
    });

    user.timeLog = newTimeLog._id;

    await newTimeLog.save();
    await user.save();

    return res.status(201).json(newTimeLog);
  } catch (error) {
    next(error);
  }
};

function splitTime(result, user, timelog) {
  const userHours = user.totalHours.split(" ");
  const timelogHours = timelog.actualTime.split(" ");

  let totalStart = parseFloat(userHours[0]) + result.first;
  let totalEnd = parseFloat(userHours[1]) + result.end;

  let actualStart = parseFloat(timelogHours[0]) + result.first;
  let actualEnd = parseFloat(timelogHours[1]) + result.end;

  if (totalEnd >= 60) {
    totalStart += Math.floor(totalEnd / 60);
    totalEnd = totalEnd % 60;
  }

  if (actualEnd >= 60) {
    actualStart += Math.floor(actualEnd / 60);
    actualEnd = actualEnd % 60;
  }

  const formatTime = (time) => (time < 10 ? `0${time}` : `${time}`);

  const splitResult = {
    total: `${formatTime(totalStart)}S ${formatTime(totalEnd)}M`,
    actual: `${formatTime(actualStart)}S ${formatTime(actualEnd)}M`,
  };

  return splitResult;
}

export const updateTimelog = async (req, res, next) => {
  try {
    const { newLog, result } = req.body;
    const user = await dataFunction(req, res, next);
    const timelog = await TimeLog.findById(user.timeLog);
    const splitResult = splitTime(result, user, timelog);

    timelog.set(newLog);
    user.totalHours = splitResult.total;
    timelog.actualTime = splitResult.actual;

    await timelog.save();
    await user.save();

    res.status(200).json({ message: "Timelog updated!" });
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

    const totalStart = parseFloat(user.totalHours.split(" ")[0]);
    const totalEnd = parseFloat(user.totalHours.split(" ")[1]);

    const timeStart = parseFloat(dayEntry.totalTime.split(" ")[0]);
    const timeEnd = parseFloat(dayEntry.totalTime.split(" ")[1]);

    let newStart = totalStart - timeStart;
    let newEnd = totalEnd - timeEnd;

    if (newEnd < 0) {
      newStart -= 1;
      newEnd += 60;
    }

    const formatTime = (time) => (time < 10 ? `0${time}` : `${time}`);

    let result = `${formatTime(newStart)}S ${formatTime(newEnd)}M`;

    if (isNaN(newStart) || isNaN(newEnd)) {
      result = user.totalHours;
    }

    dayEntry.startWork = "";
    dayEntry.endWork = "";
    dayEntry.startBreak = "";
    dayEntry.endBreak = "";
    dayEntry.totalTime = "";

    if (!dayEntry) {
      return res.status(404).json({ message: "Datum nicht gefunden" });
    }

    if (["dayOff", "sickDay", "holiday"].includes(name)) {
      dayEntry[name] = !dayEntry[name];
      user[name] = dayEntry[name] ? user[name] + 1 : user[name] - 1;
    } else {
      return res.status(400).json({ message: "Ungültiger Toggle-Name" });
    }

    user.totalHours = result;
    timelog.markModified("month");
    await timelog.save();
    await user.save();

    res.status(200).json(timelog);
  } catch (error) {
    next(error);
  }
};

export const changeColor = async (req, res, next) => {
  try {
    const { backgroundColor, fontColor } = req.body;

    const user = await dataFunction(req, res, next);
    const timelog = await TimeLog.findById(user.timeLog);

    if (backgroundColor) {
      timelog.backgroundColor = backgroundColor;
    }

    if (fontColor) {
      timelog.fontColor = fontColor;
    }

    await timelog.save();

    res.status(200).json({ message: "Farben verändert!" });
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

    await TimeLog.findByIdAndUpdate(user.timeLog, { month: [] });

    res.status(200).json({ message: "Monat gelöscht!" });
  } catch (error) {
    next(error);
  }
};

export const hardDeleteTimelog = async (req, res, next) => {
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
