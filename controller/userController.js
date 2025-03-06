import User from "../models/User.js";
import { hashPassword, comparePassword } from "../middlewares/hashPassword.js";
import { issueJwt } from "../helpers/jwt.js";
import jwt from "jsonwebtoken";
import { mailerFunction } from "../helpers/nodemailer.js";
import { dataFunction } from "../helpers/dataFunction.js";
import TimeLog from "../models/TimeLog.js";

const secretKey = process.env.JWT_SECRET;

export const getUserData = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    const user = await User.findById(data._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const timelog = await TimeLog.findById(user.timeLog)

    res.status(200).json({
      user: user,
      timelog: timelog
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    if (await User.findOne({ email: email })) {
      return res.status(404).json({ message: "Email already exist!" });
    }

    const password = (req.body.password = await hashPassword(
      req.body.password.trim()
    ));

    const user = await User.create({
      email: email,
      password: password,
    });

    res.status(201).json({ message: "User successfully created", user: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

    const user = await User.findById(data._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const checkPassword = await comparePassword(
      req.body.password,
      user.password
    );
    if (!checkPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // Needs to delete the timeLog

    await User.findByIdAndDelete(user._id);

    const topic = `Profile deleted`;
    const message = `We deleted all of your data! Goodbye!`;

    mailerFunction(user, topic, message);

    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

export const editTime = async (req, res, next) => {
  try {
    const user = await dataFunction(req, res, next);
    const sickDay = req.body.sickDay
    const dayOff = req.body.dayOff
    const holiday = req.body.holiday
    const totalHours = req.body.totalHours

    if(sickDay){
      user.sickDay = sickDay;
    }
    if(dayOff){
      user.dayOff = dayOff;
    }
    if(holiday){
      user.holiday = holiday;
    }
    if(totalHours){
      user.totalHours = totalHours;
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await dataFunction(req, res, next);
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    const confirmPassword = req.body.confirmPassword.trim();

    const checkPassword = await comparePassword(confirmPassword, user.password);

    if (!checkPassword) {
      return res.status(404).json({ message: "Wrong password" });
    }

    if (password.length >= 8) {
      user.password = await hashPassword(password);
      const topic = `Profile update`;
      const message = `Your password was updated!`;
      mailerFunction(user, topic, message);
    }

    if (email) {
      user.email = email;
      const topic = `Profile update`;
      const message = `Your email was updated!`;
      mailerFunction(user, topic, message);
    }
    await user.save();

    res.status(200).json({ message: "User successfully updated", user: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const searchEmail = await User.findOne({ email });

    if (!searchEmail) {
      const message = "Email-Adresse wurde nicht gefunden!";
      return res.status(404).json({ message });
    }

    const passwordCompare = await comparePassword(
      password,
      searchEmail.password
    );

    if (!passwordCompare) {
      const message = "Passwort stimmt nicht!";
      res.status(404).json({ message });
    }

    const token = issueJwt(searchEmail);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ searchEmail, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send("User logged out");
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) return res.status(401).json({ error: "Invalid token." });

      const userRole = decoded.role;

      if (!roles.includes(userRole)) {
        return res
          .status(403)
          .json({ error: "Access denied. Insufficient permissions." });
      }

      req.user = decoded;
      next();
    });
  };
};

export const getData = async (req, res, next) => {
  try {
    const data = await dataFunction(req, res, next);

    if (!data) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};
