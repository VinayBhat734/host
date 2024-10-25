// middleware/auth.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const moment = require("moment");
const pool = require("../db"); // Ensure you import your db connection

dotenv.config();

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
      const result = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);

      if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Session expired, please log in again.' });
      }

      const session = result.rows[0];

      // Check if the token has expired
      if (moment().isAfter(moment(session.expires_at))) {
          await pool.query('DELETE FROM sessions WHERE token = $1', [token]); // Remove expired session
          return res.status(401).json({ error: 'Session expired, please log in again.' });
      }

      req.user = { id: session.user_id, role: session.role };
      next();
  } catch (err) {
      console.error('Error verifying token:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Periodic cleanup job for expired sessions
const cleanupExpiredSessions = async () => {
  try {
      const result = await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
  } catch (err) {
      console.error('Error cleaning up expired sessions:', err);
  }
};

// Schedule the cleanup job (every hour, for example)
setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Adjust the interval as needed

module.exports = authenticateToken;
