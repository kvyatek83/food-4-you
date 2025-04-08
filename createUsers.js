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

    // Travler
    const travlerUsername = process.env.TRAVLER_NAME;
    const travlerPassword = process.env.TRAVLER_PASSWORD;
    const travlerRole = process.env.TRAVLER_ROLE;

    await createUser(travlerUsername, travlerPassword, travlerRole);
  } else {
    console.log("Skip user DB task!");
  }
})();
