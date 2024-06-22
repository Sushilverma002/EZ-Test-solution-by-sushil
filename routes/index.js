import { Router } from "express";

const router = Router();
import user from "../controllers/userCntrl.js";

//============== user routes ============
router.post("/signUp", user.register);
router.get("/verfiyEmail/:token", user.verfiyMail);
router.post("/login", user.login);

export default router;
