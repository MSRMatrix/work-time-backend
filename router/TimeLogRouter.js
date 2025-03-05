import express from "express"
import { timeLogUpdateValidator, timelogValidator, validateRequest } from "../middlewares/validator/validatorFunctions.js"
import { createTimelog, deleteTimelog } from "../controller/timeLogController.js";

const router = express.Router()

router
.route("/").post(createTimelog)

// router
// .route("/").post(timelogValidator, validateRequest ,)

router
.route("/").delete(deleteTimelog)

// router
// .route("/").patch(timeLogUpdateValidator(["", ""]), validateRequest ,updateList)

// router
// .route("/reset-data").delete(resetData)

// router
// .route("/empty-list").delete(emptyList)

export default router;