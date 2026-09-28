import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/local_db.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not read local_db.json, initializing fresh store');
  }
  return { users: [], scans: [] };
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing to local_db.json:', e);
  }
}

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export const dbStore = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (isMongoConnected()) {
      const { User } = await import('../models/User.js');
      return await User.findOne({ email: email.toLowerCase() });
    }
    const data = loadLocalData();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isMongoConnected()) {
      const { User } = await import('../models/User.js');
      return await User.findById(id);
    }
    const data = loadLocalData();
    const user = data.users.find(u => u._id === id) || null;
    if (user) {
      const clean = { ...user };
      delete clean.passwordHash;
      return clean;
    }
    return null;
  },

  async updateUserPassword(email, newPasswordHash) {
    if (isMongoConnected()) {
      const { User } = await import('../models/User.js');
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return false;
      user.passwordHash = newPasswordHash;
      await user.save();
      return true;
    }
    const data = loadLocalData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    saveLocalData(data);
    return true;
  },

  async createUser({ name, email, passwordHash }) {
    if (isMongoConnected()) {
      const { User } = await import('../models/User.js');
      const user = new User({ name, email, passwordHash });
      await user.save();
      return user.toJSON();
    }
    const data = loadLocalData();
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveLocalData(data);
    const clean = { ...newUser };
    delete clean.passwordHash;
    return clean;
  },

  // --- SCANS ---
  async saveScan({ userId, vegetable, disease, confidence, isHealthy, thumbnail }) {
    if (isMongoConnected()) {
      const { Scan } = await import('../models/Scan.js');
      const scan = new Scan({
        user: userId,
        vegetable,
        disease,
        confidence,
        isHealthy,
        thumbnail
      });
      await scan.save();
      return scan;
    }
    const data = loadLocalData();
    const newScan = {
      _id: `scn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user: userId,
      vegetable,
      disease,
      confidence,
      isHealthy,
      thumbnail,
      createdAt: new Date().toISOString()
    };
    data.scans.unshift(newScan);
    saveLocalData(data);
    return newScan;
  },

  async getUserScans(userId, limit = 50) {
    if (isMongoConnected()) {
      const { Scan } = await import('../models/Scan.js');
      return await Scan.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
    }
    const data = loadLocalData();
    return data.scans
      .filter(s => String(s.user) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  async deleteUserScan(scanId, userId) {
    if (isMongoConnected()) {
      const { Scan } = await import('../models/Scan.js');
      const scan = await Scan.findOne({ _id: scanId, user: userId });
      if (!scan) return false;
      await scan.deleteOne();
      return true;
    }
    const data = loadLocalData();
    const idx = data.scans.findIndex(s => s._id === scanId && String(s.user) === String(userId));
    if (idx === -1) return false;
    data.scans.splice(idx, 1);
    saveLocalData(data);
    return true;
  },

  async getUserStats(userId) {
    if (isMongoConnected()) {
      const { Scan } = await import('../models/Scan.js');
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const [totals, diseaseCounts] = await Promise.all([
        Scan.aggregate([
          { $match: { user: userObjectId } },
          {
            $group: {
              _id: null,
              totalScans: { $sum: 1 },
              healthyCount: { $sum: { $cond: [{ $eq: ['$isHealthy', true] }, 1, 0] } },
              diseasedCount: { $sum: { $cond: [{ $eq: ['$isHealthy', false] }, 1, 0] } },
            },
          },
        ]),
        Scan.aggregate([
          { $match: { user: userObjectId } },
          { $group: { _id: '$disease', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);
      const stats = totals[0] || { totalScans: 0, healthyCount: 0, diseasedCount: 0 };
      return {
        totalScans: stats.totalScans,
        healthyCount: stats.healthyCount,
        diseasedCount: stats.diseasedCount,
        diseaseBreakdown: diseaseCounts.map(d => ({ name: d._id, count: d.count })),
      };
    }

    const data = loadLocalData();
    const userScans = data.scans.filter(s => String(s.user) === String(userId));
    const diseaseMap = {};
    let healthyCount = 0;
    let diseasedCount = 0;

    userScans.forEach(s => {
      if (s.isHealthy) healthyCount++;
      else diseasedCount++;
      diseaseMap[s.disease] = (diseaseMap[s.disease] || 0) + 1;
    });

    return {
      totalScans: userScans.length,
      healthyCount,
      diseasedCount,
      diseaseBreakdown: Object.entries(diseaseMap).map(([name, count]) => ({ name, count }))
    };
  }
};
