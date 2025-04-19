const TaskRequest = require('../models/TaskRequest');
const { parseUserRequestToPlan } = require('../utils/requestParser');

const createTask = async (req, res) => {
  const { inputText, priority, type } = req.body;

  try {
    let taskDetails = {};
    if (type === 'ticket') {
      taskDetails = parseUserRequestToPlan(inputText);
    }

    const task = new TaskRequest({
      userId: req.user.id,
      inputText,
      priority,
      type,
      details: taskDetails, // Save parsed details
    });

    await task.save();

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await TaskRequest.findById(req.params.id);
    if (!task || task.userId.toString() !== req.user.id)
      return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskRequest.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await TaskRequest.findById(req.params.id);
    if (!task || task.userId.toString() !== req.user.id)
      return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await task.save();

    res.json({ message: 'Task status updated successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createTask, getTaskById, getAllTasks, updateTaskStatus };
