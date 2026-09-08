import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticateUser } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { updateProfileSchema, addressSchema } from "../validators/authValidation";

const router = Router();

// Protect all user routes with JWT Authentication
router.use(authenticateUser);

// Profile Management
router.get("/profile", userController.getProfile);
router.put("/profile", validateRequest(updateProfileSchema), userController.updateProfile);

// Address Book Management
router.get("/addresses", userController.getAddresses);
router.post("/addresses", validateRequest(addressSchema), userController.addAddress);
router.put("/addresses/:id", userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

export default router;
