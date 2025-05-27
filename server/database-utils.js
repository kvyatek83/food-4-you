const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Initialize Sequelize with SQLite database
let sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, process.env.DB_PATH || "app.db"),
});

async function clearDatabase() {
  await sequelize.drop();
}

let sequelizeInstance = sequelize; // Store the current instance

// Close all database connections
const closeConnections = async () => {
  try {
    await sequelizeInstance.close();
    console.log("Database connections closed successfully");
    return true;
  } catch (error) {
    console.error("Error closing database connections:", error);
    throw error;
  }
};

// Initialize/reinitialize database connection
const initializeDatabase = async () => {
  try {
    // Create a new Sequelize instance
    sequelizeInstance = new Sequelize({
      dialect: "sqlite",
      storage: path.join(__dirname, process.env.DB_PATH || "app.db"),
    });

    // Re-define models with the new connection
    // This is a simplified version - you might need to redefine all models
    // with their associations if this doesn't work
    await sequelizeInstance.authenticate();
    console.log("Database connection re-established successfully");

    // Update the globally exposed sequelize variable to use the new instance
    sequelize = sequelizeInstance;

    // Re-sync models
    await syncModels();

    return true;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    throw error;
  }
};

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

Category.hasMany(Item, { foreignKey: "categoryId", as: "items" });
Item.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

const Order = sequelize.define("Order", {
  uuid: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  orderNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  printed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

const OrderItem = sequelize.define("OrderItem", {
  uuid: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  itemUuid: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true,
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  selectedAddOns: {
    type: DataTypes.TEXT, // JSON string of selected add-on UUIDs
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("selectedAddOns");
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue("selectedAddOns", JSON.stringify(value || []));
    },
  },
  itemTotalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

const Configuration = sequelize.define("Configuration", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  printerIp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  printerEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  // Add more configuration fields as needed
}, {
  // Ensure only one configuration record exists
  tableName: 'configurations'
});

Order.hasMany(OrderItem, { foreignKey: "orderUuid", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderUuid", as: "order" });

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

async function getNextOrderNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find highest order number for today
  const latestOrder = await Order.findOne({
    where: {
      orderDate: {
        [Sequelize.Op.between]: [today, tomorrow],
      },
    },
    order: [["orderNumber", "DESC"]],
  });

  return latestOrder ? latestOrder.orderNumber + 1 : 1;
}

// Functions for orders
async function createOrder(orderData) {
  const transaction = await sequelize.transaction();

  try {
    const { items, ...orderDetails } = orderData;

    // Generate sequential order number for today
    orderDetails.orderNumber = await getNextOrderNumber();

    // Create the order
    const order = await Order.create(orderDetails, { transaction });

    // Process all items
    const orderItems = items.map((item) => ({
      ...item,
      orderUuid: order.uuid,
    }));

    // Create all order items
    await OrderItem.bulkCreate(orderItems, { transaction });

    await transaction.commit();
    return getOrderById(order.uuid);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getOrderById(orderId) {
  return Order.findOne({
    where: { uuid: orderId },
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
  });
}

async function getAllOrders(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const { count, rows } = await Order.findAndCountAll({
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
    order: [["orderDate", "DESC"]],
    limit,
    offset,
  });

  return {
    orders: rows,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
}

async function getOrdersByDateRange(startDate, endDate, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const { count, rows } = await Order.findAndCountAll({
    where: {
      orderDate: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
    order: [["orderDate", "DESC"]],
    limit,
    offset,
  });

  return {
    orders: rows,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
}

async function getOrderStats(startDate, endDate) {
  // Count of orders
  const orderCount = await Order.count({
    where: {
      orderDate: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
  });

  // Sum of all items across orders
  const itemCount = await OrderItem.sum("quantity", {
    include: [
      {
        model: Order,
        as: "order",
        attributes: [],
        where: {
          orderDate: {
            [Sequelize.Op.between]: [startDate, endDate],
          },
        },
      },
    ],
  });

  // Total revenue
  const revenue = await Order.sum("totalAmount", {
    where: {
      orderDate: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    },
  });

  // Most popular items
  const popularItems = await sequelize.query(
    `
    SELECT oi.itemUuid, oi.itemName, SUM(oi.quantity) as totalOrdered
    FROM OrderItems oi
    JOIN Orders o ON o.uuid = oi.orderUuid
    WHERE o.orderDate BETWEEN :startDate AND :endDate
    GROUP BY oi.itemUuid, oi.itemName
    ORDER BY totalOrdered DESC
    LIMIT 10
  `,
    {
      replacements: { startDate, endDate },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  return {
    orderCount: orderCount || 0,
    itemCount: itemCount || 0,
    revenue: revenue || 0,
    popularItems,
  };
}

async function updateOrderPrintStatus(orderId, printed) {
  await Order.update({ printed }, { where: { uuid: orderId } });
}

// Configuration functions
async function getConfiguration() {
  let config = await Configuration.findOne();
  if (!config) {
    // Create default configuration if none exists
    config = await Configuration.create({
      printerIp: process.env.PRINTER_IP || null,
      printerEnabled: true,
    });
  } else if(!config.printerIp) {
    config.printerIp = process.env.PRINTER_IP;
  }
  return config.get({ plain: true });
}

async function updateConfiguration(configData) {
  let config = await Configuration.findOne();
  if (!config) {
    // Create new configuration if none exists
    config = await Configuration.create(configData);
  } else {
    // Update existing configuration
    await config.update(configData);
  }
  return config.get({ plain: true });
}

module.exports = {
  syncModels,
  User,
  Category,
  Item,
  AddOn,
  Order,
  OrderItem,
  Configuration,
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
  createOrder,
  getOrderById,
  getAllOrders,
  getOrdersByDateRange,
  getOrderStats,
  updateOrderPrintStatus,
  clearDatabase,
  closeConnections,
  initializeDatabase,
  getConfiguration,
  updateConfiguration,
};
