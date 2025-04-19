const ActionHistory = require('../models/ActionHistory');
const { Parser } = require('json2csv');

const getHistory = async (req, res) => {
  try {
    const history = await ActionHistory.find({ userId: req.user.id });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addHistory = async (req, res) => {
  const { action } = req.body;
  try {
    const history = new ActionHistory({ userId: req.user.id, action });
    await history.save();

    res.status(201).json({ message: 'History added successfully', history });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const searchHistory = async (req, res) => {
  const { keyword, startDate, endDate, actionType } = req.query;
  try {
    const query = { userId: req.user.id };

    if (keyword) query.action = { $regex: keyword, $options: 'i' };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (actionType) query.action = actionType;

    const history = await ActionHistory.find(query);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const exportHistoryCSV = async (req, res) => {
  try {
    const history = await ActionHistory.find({ userId: req.user.id });
    const fields = ['action', 'timestamp'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(history);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=history.csv');
    res.status(200).end(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getHistory, addHistory, searchHistory, exportHistoryCSV };
