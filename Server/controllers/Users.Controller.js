import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { createToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
