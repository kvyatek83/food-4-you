const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

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

// Function to create a new category
async function addCategory(category) {
  await Category.create(category);
}

// Function to create a new item
async function addItem(item, categoryId) {
  item.categoryId = categoryId;
  await Item.create(item);
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
  return categories.map((cat) => cat.get({ plain: true }));
}

module.exports = {
  syncModels,
  User,
  Category,
  Item,
  readUsersFromDatabase,
  addUser,
  addCategory,
  addItem,
  getCategoriesWithItems,
};
