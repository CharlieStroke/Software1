import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const createToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};
