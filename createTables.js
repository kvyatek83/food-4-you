const db = require("./server/database-utils");
const CATEGORIES = require("./mock-items").CATEGORIES;

(async () => {
  try {
    // Ensure the database table is synchronized
    await db.syncModels();

    for (const category of CATEGORIES) {
      await db.addCategory({
        uuid: category.uuid,
        type: category.type,
        enName: category.enName,
        heName: category.heName,
        esName: category.esName,
        imageUrl: category.imageUrl,
      });

      for (const item of category.items) {
        await db.addItem(
          {
            uuid: item.uuid,
            enName: item.enName,
            heName: item.heName,
            esName: item.esName,
            enDetails: item.enDetails,
            heDetails: item.heDetails,
            esDetails: item.esDetails,
            imageUrl: item.imageUrl,
            price: item.price,
          },
          category.uuid
        );
      }
    }

    console.log("Mock data inserted successfully!");
  } catch (error) {
    console.error("Error inserting mock data:", error);
  }
})();
