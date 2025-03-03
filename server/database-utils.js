const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

async function clearDatabase() {
  await sequelize.drop();
}

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
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

// Define Item model
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
});

// Setting up associations
Category.hasMany(Item, { foreignKey: "categoryId", as: "items" }); // Use 'items' as alias fo the FE
Item.belongsTo(Category, { foreignKey: "categoryId", as: "category" }); // Use 'category' as alias fo the FE

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

// Functions for category
async function addCategory(category) {
  await Category.create(category);
}

async function updateCategory(category) {
  await Category.upsert(category);
}

// Functions for item
async function addItem(item, categoryId) {
  item.categoryId = categoryId;
  await Item.create(item);
}

async function updateItem(item) {
  await Item.upsert(item);
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
        as: "items", // -> Use the same alias as defined in the association
      },
    ],
  });

  return categories.map((cat) => {
    const items = cat.get({ plain: true }).items.map((item) => {
      // Parse availableAddOnUuids as an array
      item.availableAddOnUuids = item.availableAddOnUuids
        ? JSON.parse(item.availableAddOnUuids)
        : [];
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
  readUsersFromDatabase,
  findUser,
  addUser,
  addAddOn,
  addCategory,
  addItem,
  getAddOns,
  getCategoriesWithItems,
  clearDatabase,
};
