import { comparePassword } from "../middlewares/hashPassword.js";
import List from "../models/TimeLog.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import he from "he"

const secretKey = process.env.JWT_SECRET;

