var express = require('express');
var router = express.Router();

let tasks = [
    {   
        taskId: 1, 
        title: "Buy nasi tomato", 
        desc: "Sedap gila nasi tomato ni, kena beli",
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        isCompleted: false,
        isDeleted: false,
        parentTaskId: null,
        priority: {
            low: false,
            medium: false,
            high: false
        },
        category: "Groceries",
        startDate: null,
        dueDate: null
    },
    {
        taskId: 2,
        title: "Learn Express.js", 
        desc: "Learn how to build web applications using Express.js",
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        isCompleted: false,
        isDeleted: false,
        parentTaskId: null,
        priority: {
            low: false,
            medium: false,
            high: false
        },
        category: "Growth",
        startDate: null,
        dueDate: null
    }
];
let nextId = 3;

// GET tasks listing.
router.get('/', function(req, res, next) {
  res.json(tasks);
});

// POST create new task
router.post('/', function(req, res, next) {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTask = { 
    taskId: nextId++, 
    title, 
    desc: req.body.desc || "",
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    isCompleted: false,
    isDeleted: false,
    parentTaskId: null,
    priority: 
      {
        low : false,
        medium : false,
        high : false
      },
    category: req.body.category || "",
    startDate: req.body.startDate ? new Date(req.body.startDate) : null,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

router.delete('/:id', function(req, res, next) {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.taskId === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json(deletedTask);
});

router.put('/:id', function(req, res, next) {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.taskId === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const updatedTask = { ...tasks[taskIndex], ...req.body, updatedAt: new Date() };
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

module.exports = router;