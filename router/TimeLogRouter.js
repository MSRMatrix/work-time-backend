import express from "express"
import { timeLogUpdateValidator, timelogValidator, validateRequest } from "../middlewares/validator/validatorFunctions.js"
import { createTimelog } from "../controller/timeLogController.js";

const router = express.Router()

router
.route("/").post(createTimelog)

// router
// .route("/").post(timelogValidator, validateRequest ,)

// router
// .route("/").delete()

// router
// .route("/").patch(timeLogUpdateValidator(["", ""]), validateRequest ,updateList)

// router
// .route("/reset-data").delete(resetData)

// router
// .route("/empty-list").delete(emptyList)

export default router;