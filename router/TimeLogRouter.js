import express from "express"
import { timeLogUpdateValidator, timelogValidator, validateRequest } from "../middlewares/validator/validatorFunctions.js"
import { createTimelog, deleteTimelog, checkFunction, updateTimelog, changeColor } from "../controller/timeLogController.js";

const router = express.Router()

router
.route("/").post(createTimelog)

// router
// .route("/").post(timelogValidator, validateRequest ,)

router
.route("/").delete(deleteTimelog)

router
.route("/check").patch(checkFunction)

router
.route("/").patch(updateTimelog)

router
.route("/color").patch(changeColor)

// router
// .route("/").patch(timeLogUpdateValidator(["", ""]), validateRequest ,updateTimelog)


// router
// .route("/reset-data").delete(resetData)

// router
// .route("/empty-list").delete(emptyList)

export default router;