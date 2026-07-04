import pool from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { getCurrentUserProfileService } from "./user.service.js";

export const registerUser = async ({ full_name, email, password, role }) => {
  // check role
  if (role === "admin") {
    throw new Error("Unautthorized! You cannot make an admin acount")
  };

  const roleResult = await pool.query(
    'SELECT id FROM roles WHERE role_name = $1',
    [role]
  );

  if (roleResult.rows.length === 0) {
    throw new Error('Invalid role');
  }

  // check email
  const emailCheck = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (emailCheck.rows.length > 0) {
    throw new Error('Email already exists');
  }

  const role_id = roleResult.rows[0].id;
  const hashedPassword = await hashPassword(password);

  await pool.query(
    // UPDATED - PROFILE PHOTO FEATURE: username defaults to email prefix for new accounts.
    `INSERT INTO users (full_name, username, email, password, role_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [full_name, email.split("@")[0], email, hashedPassword, role_id]
  );
};

export const loginUser = async ({ email, password }) => {
  const result = await pool.query(
    `SELECT users.id, users.password, roles.role_name
     FROM users
     JOIN roles ON users.role_id = roles.id
     WHERE users.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    role: user.role_name,
    email: email
  };
};

export const myInfoService = async (userId) => {
  // ===== PROFILE PHOTO FEATURE START =====
  return getCurrentUserProfileService(userId);
  // ===== PROFILE PHOTO FEATURE END =====
};
