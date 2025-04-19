const User = require('../models/User');
const Ticket = require('../models/Ticket');
const TaskRequest = require('../models/TaskRequest');

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { phone, address } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.phone = phone || user.phone;
    user.address = address || user.address;
    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const uploadAvatar = async (req, res) => {
  const { avatarUrl } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = avatarUrl;
    await user.save();

    res.json({ message: 'Avatar updated successfully', avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { type, data } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profileIndex = user.profiles.findIndex((p) => p.type === type);
    if (profileIndex >= 0) {
      user.profiles[profileIndex].data = data;
    } else {
      user.profiles.push({ type, data });
    }
    await user.save();

    res.json({ message: 'Profile updated successfully', profiles: user.profiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStatistics = async (req, res) => {
  try {
    const ticketCount = await Ticket.countDocuments();
    const completedTasks = await TaskRequest.countDocuments({ status: 'completed' });
    const averageResponseTime = await TaskRequest.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } },
        },
      },
    ]);

    res.json({
      ticketCount,
      completedTasks,
      averageResponseTime: averageResponseTime[0]?.avgResponseTime || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUser, updateUser, uploadAvatar, updateProfile, getStatistics };
