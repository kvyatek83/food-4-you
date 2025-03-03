require("dotenv").config();
const db = require("./server/database-utils");
const CATEGORIES = require("./mock-items").CATEGORIES;
const ADD_ONS = require("./mock-items").ADD_ONS;

(async () => {
  if (process.env.RESET_DB === "true") {
    try {
      // Ensure the database table is synchronized
      await db.syncModels();
      await db.clearDatabase(); // Clear existing data
      await db.syncModels();

      // Insert AddOns into the database
      for (const addOn of ADD_ONS) {
        await db.addAddOn({
          uuid: addOn.uuid,
          enName: addOn.enName,
          heName: addOn.heName,
          esName: addOn.esName,
        });
      }

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
              addOnPrice: item.addOnPrice,
              freeAvailableAddOns: item.freeAvailableAddOns,
              kitchenOrders: item.kitchenOrders,
              availableAddOnUuids: item.availableAddOnUuids
                ? JSON.stringify(item.availableAddOnUuids)
                : null,
            },
            category.uuid
          );
        }
      }

      console.log("Mock data inserted successfully!");
    } catch (error) {
      console.error("Error inserting mock data:", error);
    }
  } else {
    console.log("Skip DB task!");
  }
})();
