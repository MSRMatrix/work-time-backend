import { comparePassword } from "../middlewares/hashPassword.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import he from "he"
import TimeLog from "../models/TimeLog.js";
import mongoose from "mongoose";

const secretKey = process.env.JWT_SECRET;


export const createTimelog = async (req, res, next) => {
    try {
      console.log("Eingehende Daten:", req.body);
  
      const { userId, month, year, dayOff, sickDay, holiday, actualTime, targetValue } = req.body;

    //   Methode um das alte automatisch zu löschen
  
      const newTimeLog = new TimeLog({
        userId,  
        month: req.body.monthData,  
        dayOff: dayOff || "0",
        sickDay: sickDay || "0",
        holiday: holiday || "0",
        actualTime: actualTime || "0",
        targetValue: targetValue || "0",
      });
  
      await newTimeLog.save();
  
      res.status(201).json({ timeLog: newTimeLog });
    } catch (error) {
      next(error);
    }
  };
  