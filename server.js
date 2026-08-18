const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PACKS_PATH = path.join(__dirname, 'data', 'packs.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

function loadPacks() {
  return JSON.parse(fs.readFileSync(PACKS_PATH, 'utf8'));
}
function loadUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8')); }
  catch (e) { return {}; }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}

// POST /complete-level
// body: { userId, levelId }
// Marks level complete for user and awards any packs fully completed that haven't been claimed.
app.post('/complete-level', (req, res) => {
  const { userId, levelId } = req.body;
  if (!userId || !levelId) return res.status(400).json({ error: 'userId and levelId required' });

  const packs = loadPacks();
  const users = loadUsers();

  if (!users[userId]) {
    users[userId] = { id: userId, points: 0, completedLevels: [], claimedPacks: [] };
  }
  const user = users[userId];

  // idempotently add completed level
  if (!user.completedLevels.includes(levelId)) {
    user.completedLevels.push(levelId);
  }

  // scan packs to award points for any packs now fully completed
  const awarded = [];
  packs.forEach(pack => {
    const packLevelIds = (pack.levels || []).map(l => l.id);
    const hasAll = packLevelIds.length > 0 && packLevelIds.every(lid => user.completedLevels.includes(lid));
    if (hasAll && !user.claimedPacks.includes(pack.id)) {
      user.points += (pack.pointsReward || 0);
      user.claimedPacks.push(pack.id);
      awarded.push({ packId: pack.id, points: pack.pointsReward || 0 });
    }
  });

  saveUsers(users);
  return res.json({ userId, points: user.points, awarded, claimedPacks: user.claimedPacks });
});

app.get('/user/:userId', (req, res) => {
  const users = loadUsers();
  const u = users[req.params.userId];
  if (!u) return res.status(404).json({ error: 'user not found' });
  res.json(u);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
