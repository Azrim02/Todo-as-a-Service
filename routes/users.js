var express = require('express');
var router = express.Router();

// In-memory users array and id counter
let users = [
  { id: 1, name: "Mirza" },
  { id: 2, name: "Noah" },
  { id: 3, name: "Wilma" }
];
let nextId = 4;

/* GET users listing. */
// GET all users
router.get('/', function(req, res, next) {
  res.json(users);
});

// POST create new user
router.post('/', function(req, res, next) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const newUser = { id: nextId++, name };
  users.push(newUser);
  res.status(201).json(newUser);
});

router.delete('/:id', function(req, res, next) {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  const deletedUser = users.splice(userIndex, 1)[0];
  res.send("User deleted successfully");
});

module.exports = router;
