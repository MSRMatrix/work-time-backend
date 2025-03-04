import express from "express"
import UserRouter from "./UserRouter.js"
import TimeLogRouter from "./TimeLogRouter.js"
import { authorize } from "../controller/UserController.js"

const router = express.Router()

router
.use("/user", UserRouter)

// router
// .use("/timelog", authorize(["User"]), TimeLogRouter)

router
.use("/timelog", TimeLogRouter)

export default router;