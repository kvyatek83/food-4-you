require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./server/database-utils");

(async () => {
  if (process.env.RESET_DB === "true") {
    await db.syncModels();
    const username = process.env.ADMIN_NAME;

    const user = db.findUser(username);

    if (user === null) {
      const password = process.env.ADMIN_PASSWORD;
      const role = process.env.ADMIN_ROLE;
      const hashedPassword = bcrypt.hashSync(password, 8);

      await db.addUser(username, hashedPassword, role);
    }
    console.log("User added successfully!");
  } else {
    console.log("Skip user DB task!");
  }
})();
