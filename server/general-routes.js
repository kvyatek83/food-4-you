const express = require("express");
const router = express.Router();
const db = require("./database-utils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  const users = await db.readUsersFromDatabase();
  const user = users.find((user) => user.username === req.body.username);

  if (!user) {
    console.log(`No user ${req.body.username} found`);
    return res
      .status(404)
      .send({ message: `userNotFound`, params: req.body.username });
  }

  const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
  if (!passwordIsValid) {
    console.log(`User ${req.body.username} is not authorized!`);
    return res
      .status(401)
      .send({ message: `userUnauthorized`, params: req.body.username });
  }

  const role = user.role.toUpperCase();
  const expiresInKey = `${role}_EXPIRES_IN`;

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env[expiresInKey] || "24h",
    }
  );

  res.status(200).send({ auth: true, token: token });
});

module.exports = router;
