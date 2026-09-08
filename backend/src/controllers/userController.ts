import { Request, Response } from "express";
import { userService } from "../services/userService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const userController = {
  /**
   * GET /api/v1/users/profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getProfile(req.user!.id);
      return sendSuccess(res, user, "User profile retrieved");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to get profile", 400);
    }
  },

  /**
   * PUT /api/v1/users/profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const updated = await userService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, "Profile updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update profile", 400);
    }
  },

  /**
   * GET /api/v1/users/addresses
   */
  async getAddresses(req: Request, res: Response) {
    try {
      const addresses = await userService.getAddresses(req.user!.id);
      return sendSuccess(res, addresses, "Saved addresses retrieved");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to get addresses", 400);
    }
  },

  /**
   * POST /api/v1/users/addresses
   */
  async addAddress(req: Request, res: Response) {
    try {
      const newAddress = await userService.addAddress(req.user!.id, req.body);
      return sendSuccess(res, newAddress, "Address added successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to add address", 400);
    }
  },

  /**
   * PUT /api/v1/users/addresses/:id
   */
  async updateAddress(req: Request, res: Response) {
    try {
      const addressId = req.params.id as string;
      const updated = await userService.updateAddress(req.user!.id, addressId, req.body);
      return sendSuccess(res, updated, "Address updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update address", 400);
    }
  },

  /**
   * DELETE /api/v1/users/addresses/:id
   */
  async deleteAddress(req: Request, res: Response) {
    try {
      const addressId = req.params.id as string;
      const result = await userService.deleteAddress(req.user!.id, addressId);
      return sendSuccess(res, result, "Address deleted successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to delete address", 400);
    }
  },
};
