require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./server/database-utils");

const generalRoutes = require("./server/general-routes");
const adminRoutes = require("./server/admin-routes");
const travlerRoutes = require("./server/travler-routes");

const app = express();
app.use(express.static(__dirname + "/dist/food-4-you/browser"));
app.use(bodyParser.json());

app.use("/api", generalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/travler", travlerRoutes);

app.get("/*", (req, res) =>
  res.sendFile(path.join(__dirname + "/dist/food-4-you/browser/index.html"))
);

(async () => {
  await db.syncModels(); // Ensure models are created and synced

  const port = process.env.PORT || 3311;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
