import {
  registerUser,
  loginUser,
  myInfoService
} from '../services/auth.service.js';
import { generateToken } from '../utils/jwt.js';
import { sendResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    await registerUser(req.body);
    sendResponse(res, 201,'User registered successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await loginUser(req.body);
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    sendResponse(res, 200, "Login successfyl", {
      token,
      role: user.role,
      user: user.email
    })
  } catch (error) {
    next(error);
  }
};

export const myInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userInfo = await myInfoService(userId);
    sendResponse(res, 200, "User info retrieved successfully", userInfo);
    
  } catch (error) {
    next(error);
  }
};
