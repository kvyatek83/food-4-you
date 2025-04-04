const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
require("dotenv").config();

async function clearDatabase() {
  await sequelize.drop();
}

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, process.env.DB_PATH || "app.db"),
});

// Define User model
const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define AddOn model
const AddOn = sequelize.define("AddOn", {
  uuid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  enName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  heName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  esName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

// Define Category model
const Category = sequelize.define("Category", {
  uuid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  enName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  heName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  esName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
});

// Define Item model with availability fields
const Item = sequelize.define("Item", {
  uuid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  enName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  heName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  esName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  enDetails: {
    type: DataTypes.TEXT,
  },
  heDetails: {
    type: DataTypes.TEXT,
  },
  esDetails: {
    type: DataTypes.TEXT,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  addOnPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  freeAvailableAddOns: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  kitchenOrders: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  availableAddOnUuids: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Availability fields - one for each day of the week
  availableMonday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableTuesday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableWednesday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableThursday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableFriday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableSaturday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availableSunday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

// Setting up associations
Category.hasMany(Item, { foreignKey: "categoryId", as: "items" });
Item.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// Sync all models with the database
async function syncModels() {
  await sequelize.sync();
}

// Function to read users from the database
async function readUsersFromDatabase() {
  await sequelize.sync();
  const users = await User.findAll();
  return users.map((user) => user.get({ plain: true }));
}

async function findUser(username) {
  await sequelize.sync();
  return await User.findOne({ where: { username } });
}

// Function to add a user
async function addUser(username, password, role) {
  await sequelize.sync();
  const user = await User.create({
    username,
    password,
    role,
  });
  return user;
}

// Functions for add-on
async function addAddOn(addOn) {
  await AddOn.create(addOn);
}

async function updateAddOn(addOn) {
  await AddOn.upsert(addOn);
}

async function findAddOn(addOnId) {
  return await AddOn.findOne({ where: { uuid: addOnId } });
}

async function deleteAddOn(addOnId) {
  const allItems = await Item.findAll();

  for (const item of allItems) {
    if (item.availableAddOnUuids) {
      let addOnUuids = JSON.parse(item.availableAddOnUuids);

      if (addOnUuids.includes(addOnId)) {
        addOnUuids = addOnUuids.filter((uuid) => uuid !== addOnId);
        await item.update({
          availableAddOnUuids: JSON.stringify(addOnUuids),
        });
      }
    }
  }

  await AddOn.destroy({ where: { uuid: addOnId } });
}

// Functions for category
async function addCategory(category) {
  await Category.create(category);
}

async function updateCategory(category) {
  await Category.upsert(category);
}

async function deleteCategory(categoryId) {
  await Category.destroy({
    where: {
      uuid: categoryId,
    },
  });
}

async function findCategory(categoryId) {
  await sequelize.sync();
  return await Category.findOne({ where: { uuid: categoryId } });
}

// Functions for item
async function addItem(item, categoryId) {
  item.categoryId = categoryId;
  await Item.create(item);
}

async function updateItem(item) {
  await Item.upsert(item);
}

async function findItem(itemId) {
  return await Item.findOne({ where: { uuid: itemId } });
}

async function deleteItem(itemId) {
  await Item.destroy({ where: { uuid: itemId } });
}

async function deleteItemsByCategoryId(categoryId) {
  await Item.destroy({ where: { categoryId } });
}

async function getAddOns() {
  // Fetch all add-ons from the database
  const addOns = await AddOn.findAll();

  // Convert the result to plain JSON
  return addOns.map((addOn) => addOn.get({ plain: true }));
}

// Function to get all categories with their items
async function getCategoriesWithItems() {
  const categories = await Category.findAll({
    include: [
      {
        model: Item,
        as: "items",
      },
    ],
  });

  return categories.map((cat) => {
    const items = cat.get({ plain: true }).items.map((item) => {
      // Parse availableAddOnUuids as an array
      item.availableAddOnUuids = item.availableAddOnUuids
        ? JSON.parse(item.availableAddOnUuids)
        : [];

      // Format availability as an object for frontend convenience
      item.availability = {
        monday: item.availableMonday,
        tuesday: item.availableTuesday,
        wednesday: item.availableWednesday,
        thursday: item.availableThursday,
        friday: item.availableFriday,
        saturday: item.availableSaturday,
        sunday: item.availableSunday,
      };

      return item;
    });

    return {
      ...cat.get({ plain: true }),
      items,
    };
  });
}

// Get categories with items available on a specific day
async function getCategoriesWithAvailableItems(day) {
  if (!day) {
    // Default to current day of the week
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    day = days[new Date().getDay()].toLowerCase();
  }

  day = day.toLowerCase();
  const availabilityField = `available${
    day.charAt(0).toUpperCase() + day.slice(1)
  }`;

  const categories = await Category.findAll({
    include: [
      {
        model: Item,
        as: "items",
        where: {
          [availabilityField]: true,
        },
      },
    ],
  });

  return categories.map((cat) => {
    const items = cat.get({ plain: true }).items.map((item) => {
      // Parse availableAddOnUuids as an array
      item.availableAddOnUuids = item.availableAddOnUuids
        ? JSON.parse(item.availableAddOnUuids)
        : [];

      // Format availability as an object for frontend convenience
      item.availability = {
        monday: item.availableMonday,
        tuesday: item.availableTuesday,
        wednesday: item.availableWednesday,
        thursday: item.availableThursday,
        friday: item.availableFriday,
        saturday: item.availableSaturday,
        sunday: item.availableSunday,
      };

      return item;
    });

    return {
      ...cat.get({ plain: true }),
      items,
    };
  });
}

module.exports = {
  syncModels,
  User,
  Category,
  Item,
  AddOn,
  readUsersFromDatabase,
  findUser,
  addUser,
  addAddOn,
  updateAddOn,
  findAddOn,
  deleteAddOn,
  addCategory,
  updateCategory,
  deleteCategory,
  findCategory,
  addItem,
  updateItem,
  findItem,
  deleteItem,
  deleteItemsByCategoryId,
  getAddOns,
  getCategoriesWithItems,
  getCategoriesWithAvailableItems,
  clearDatabase,
};
