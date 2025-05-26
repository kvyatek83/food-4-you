require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./server/database-utils");

async function createUser(name, password, role) {
  await db.syncModels();
  const username = name;

  const user = await db.findUser(username);

  if (user === null) {
    const hashedPassword = bcrypt.hashSync(password, 8);

    await db.addUser(username, hashedPassword, role);
    console.log(`User ${name} added successfully!`);
  }
}

(async () => {
  if (process.env.RESET_DB === "true") {
    // Admin
    const adminUsername = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminRole = process.env.ADMIN_ROLE;
    await createUser(adminUsername, adminPassword, adminRole);

    // Traveler
    const travelerUsername = process.env.TRAVELER_NAME;
    const travelerPassword = process.env.TRAVELER_PASSWORD;
    const travelerRole = process.env.TRAVELER_ROLE;

    await createUser(travelerUsername, travelerPassword, travelerRole);
  } else {
    console.log("Skip user DB task!");
  }
})();
