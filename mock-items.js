const ADD_ONS = [
  {
    uuid: "3fe2d673-240f-4e5c-8d99-3a41445bda11",
    enName: "Olives",
    heName: "זיתים",
    esName: "Aceitunas",
  },
  {
    uuid: "58b8b826-e5b9-4614-994b-2ead7f81677d",
    enName: "Cheese",
    heName: "גבינה",
    esName: "Queso",
  },
  {
    uuid: "e70a681e-515a-4e0c-a035-b6a18282f909",
    enName: "Avocado",
    heName: "אבוקדו",
    esName: "Aguacate",
  },
  {
    uuid: "e2a45e05-ecc1-42cd-8f68-623097b86843",
    enName: "Chili Peppers",
    heName: "פלפל חריף",
    esName: "Pimientos picantes",
  },
  {
    uuid: "cc834b4e-0a1e-4645-81b3-899749488aa9",
    enName: "Tomatoes",
    heName: "עגבניות",
    esName: "Tomates",
  },
  {
    uuid: "8e19e3a4-fc1d-45ae-8d92-3a71bafc1869",
    enName: "Cucumbers",
    heName: "מלפפונים",
    esName: "Pepinos",
  },
  {
    uuid: "1ab4e4da-97fa-4b13-b7d2-7de917145576",
    enName: "Mozzarella",
    heName: "מוצרלה",
    esName: "Mozzarella",
  },
  {
    uuid: "96d9627e-1f82-4312-9d61-4826c5572215",
    enName: "Red Onion",
    heName: "בצל אדום",
    esName: "Cebolla roja",
  },
  {
    uuid: "fd8ee9e4-6ba5-4eee-a5e7-b15e5c1f899e",
    enName: "Lettuce",
    heName: "חסה",
    esName: "Lechuga",
  },
  {
    uuid: "101c6c35-ccdf-447f-9f02-e754f0b962c7",
    enName: "Chopped Carrots",
    heName: "גזר קצוץ",
    esName: "Zanahorias picadas",
  },
  {
    uuid: "cf7e3511-2b8c-4e39-8116-91cd80b36c6e",
    enName: "Onion",
    heName: "בצל",
    esName: "Cebolla",
  },
  {
    uuid: "7122469c-413b-41fe-91f8-83e06ecb26d6",
    enName: "Celery",
    heName: "סלרי",
    esName: "Apio",
  },
  {
    uuid: "d46ebf5e-3796-40b3-b2ae-16457b594681",
    enName: "Mushrooms",
    heName: "פטריות",
    esName: "Champiñones",
  },
  {
    uuid: "e158d08f-b91b-451c-a86b-ab9dcb3743ad",
    enName: "Broccoli",
    heName: "ברוקולי",
    esName: "Brócoli",
  },
  {
    uuid: "a19c8e5e-2bdb-4313-b7e7-8e670b642c03",
    enName: "Feta Cheese",
    heName: "גבינת פטה",
    esName: "Queso Feta",
  },
];

const CATEGORIES = [
  {
    uuid: "df18c3ee-01b4-4d9e-8e30-a7121f5b8ebc",
    type: "Breakfast",
    enName: "Breakfast",
    heName: "ארוחת בוקר",
    esName: "Desayuno",
    imageUrl: "/items/breakfast.jpg",
    items: [
      {
        uuid: "abf10e00-db83-4e24-a94a-37ec3d3a6b2c",
        enName: "Shakshuka",
        heName: "שקשוקה",
        esName: "Shakshuka",
        enDetails:
          "Includes homemade bread, hummus, tahini, and Israeli salad.",
        heDetails: "כולל לחם ביתי, חומוס, טחינה וסלט ישראלי.",
        esDetails: "Incluye pan casero, hummus, tahini y ensalada israelí.",
        imageUrl: "/items/shakshuka.jpg",
        price: 6.99,
        availableAddOnUuids: [
          "3fe2d673-240f-4e5c-8d99-3a41445bda11", // Olives
          "58b8b826-e5b9-4614-994b-2ead7f81677d", // Cheese
          "101c6c35-ccdf-447f-9f02-e754f0b962c7", // Chopped Carrots
          "cf7e3511-2b8c-4e39-8116-91cd80b36c6e", // Onions
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 1,
        kitchenOrders: "Incluir pan casero, hummus, tahini y ensalada israelí.",
      },
      {
        uuid: "547cb56d-7cfc-41f5-a1ba-dc3cbb186841",
        enName: "The Avocado Show",
        heName: "מופע האבוקדו",
        esName: "El Espectáculo del Aguacate",
        enDetails: "Bagel with avocado, hard-boiled egg, and Israeli salad.",
        heDetails: "באגט עם אבוקדו, ביצה קשה וסלט ישראלי.",
        esDetails: "Bagel con aguacate, huevo duro y ensalada israelí.",
        imageUrl: "/items/avocado-show.jpg",
        price: 7.99,
        availableAddOnUuids: [
          "58b8b826-e5b9-4614-994b-2ead7f81677d", // Cheese
          "e70a681e-515a-4e0c-a035-b6a18282f909", // Avocado
          "101c6c35-ccdf-447f-9f02-e754f0b962c7", // Chopped Carrots
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 1,
        kitchenOrders:
          "Bagel con aguacate y huevo duro, acompañado de ensalada israelí.",
      },
      {
        uuid: "f49699ab-6431-4d1c-8c86-1845dd304fb3",
        enName: "Omelet Baguette",
        heName: "באגט אומלט",
        esName: "Baguette de Tortilla",
        enDetails:
          "Our Omelet Baguette includes a tasty omelet, fresh vegetables, and Israeli salad.",
        heDetails: "הבאגט שלנו עם אומלט טעים, ירקות טריים וסלט ישראלי.",
        esDetails:
          "Nuestro baguette de tortilla incluye una deliciosa tortilla, verduras frescas y ensalada israelí.",
        imageUrl: "/items/omelet-baguette.jpg",
        price: 6.49,
        availableAddOnUuids: [
          "101c6c35-ccdf-447f-9f02-e754f0b962c7", // Chopped Carrots
          "cf7e3511-2b8c-4e39-8116-91cd80b36c6e", // Onions
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 2,
        kitchenOrders: "Incluir omelet, vegetales frescos y ensalada israelí.",
      },
      {
        uuid: "30c34017-f04f-4c3f-81cd-2a72ee1f0bb5",
        enName: "Oatmeal",
        heName: "קוואקר",
        esName: "Avena",
        enDetails: "Oatmeal with banana chunks, cranberries, and clover honey.",
        heDetails: "קוואקר עם חתיכות בננה, חמוציות ודבש טרי.",
        esDetails: "Avena con trozos de plátano, arándanos y miel de trébol.",
        imageUrl: "/items/oatmeal.jpg",
        price: 5.99,
        availableAddOnUuids: [
          "3fe2d673-240f-4e5c-8d99-3a41445bda11", // Olives
          "e70a681e-515a-4e0c-a035-b6a18282f909", // Avocado
          "101c6c35-ccdf-447f-9f02-e754f0b962c7", // Chopped Carrots
          "cf7e3511-2b8c-4e39-8116-91cd80b36c6e", // Onions
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 1,
        kitchenOrders: "Incluir avena con trozos de plátano y arándanos.",
      },
      {
        uuid: "602e365f-e568-4316-9684-1cf6d94d8834",
        enName: "Israeli Salad",
        heName: "סלט ישראלי",
        esName: "Ensalada Israelí",
        enDetails:
          "Finely chopped cucumber, tomatoes, red onion, and fresh lemon juice.",
        heDetails: "מלפפון קצוץ דק, עגבניות, בצל אדום ומיץ לימון טרי.",
        esDetails:
          "Pepino picado finamente, tomates, cebolla roja y jugo de limón fresco.",
        imageUrl: "/items/israeli-salad.jpg",
        price: 5.49,
        availableAddOnUuids: [
          "cc834b4e-0a1e-4645-81b3-899749488aa9", // Tomatoes
          "8e19e3a4-fc1d-45ae-8d92-3a71bafc1869", // Cucumbers
          "96d9627e-1f82-4312-9d61-4826c5572215", // Red Onion
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 1,
        kitchenOrders:
          "Incluir pepino, tomates y cebolla roja con jugo de limón fresco.",
      },
    ],
  },
  {
    uuid: "e7f3a2b1-ec43-4f2b-ad3e-5d2009cba14d",
    type: "Burgers",
    enName: "Burgers",
    heName: "המבורגר",
    esName: "Hamburguesa",
    imageUrl: "/items/burgers.jpg",
    items: [
      {
        uuid: "d89eae5e-9e4b-4f02-b6ea-c6e81185b986",
        enName: "Classic Burger",
        heName: "המבורגר קלאסי",
        esName: "Hamburguesa Clásica",
        enDetails: "Juicy beef patty with fresh toppings.",
        heDetails: "קציצת בשר עסיסית עם תוספות טריות.",
        esDetails: "Hamburguesa jugosa con coberturas frescas.",
        imageUrl: "/items/burger.jpg",
        price: 2.99,
        availableAddOnUuids: [
          "1ab4e4da-97fa-4b13-b7d2-7de917145576", // Mozzarella
          "fb2cc59e-509d-44ba-a178-45bc0ea0062a", // Feta Cheese
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 0,
        kitchenOrders:
          "Incluir una hamburguesa jugosa de carne con mozzarella y queso feta.",
      },
      {
        uuid: "c98c1a3a-5c8e-4130-bbca-fbb0191b8068",
        enName: "Asado Burger",
        heName: "המבורגר אסדו",
        esName: "Hamburguesa Asado",
        enDetails: "Delicious Asado-style burger.",
        heDetails: "המבורגר בסגנון אסדו.",
        esDetails: "Hamburguesa estilo Asado.",
        imageUrl: "/items/asado-burger.jpeg",
        price: 2.49,
        availableAddOnUuids: [
          "fd8ee9e4-6ba5-4eee-a5e7-b15e5c1f899e", // Lettuce
          "101c6c35-ccdf-447f-9f02-e754f0b962c7", // Chopped Carrots
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 0,
        kitchenOrders:
          "Incluir hamburguesa estilo asado con lechuga fresca y zanahorias.",
      },
      {
        uuid: "46c2ae3b-e7ed-4581-8d3e-db5c1ca4c29c",
        enName: "Double Burger",
        heName: "המבורגר כפול",
        esName: "Hamburguesa Doble",
        enDetails: "Double beef patty with extra cheese.",
        heDetails: "קציצת בשר כפולה עם גבינה נוספת.",
        esDetails: "Doble hamburguesa con queso extra.",
        imageUrl: "/items/burger.jpg",
        price: 4.49,
        availableAddOnUuids: [
          "1ab4e4da-97fa-4b13-b7d2-7de917145576", // Mozzarella
          "3fe2d673-240f-4e5c-8d99-3a41445bda11", // Olives
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 0,
        kitchenOrders:
          "Incluir doble hamburguesa con mozzarella, aceitunas y albahaca.",
      },
      {
        uuid: "cac28e8f-b1ee-4e13-9abe-1bc593c7e24e",
        enName: "Spicy Burger",
        heName: "המבורגר חריף",
        esName: "Hamburguesa Picante",
        enDetails: "Spicy beef patty with jalapeños.",
        heDetails: "קציצת בשר חריפה עם חלפיניו.",
        esDetails: "Hamburguesa de carne picante con jalapeños.",
        imageUrl: "/items/spicy-burger.jpg",
        price: 2.99,
        availableAddOnUuids: [
          "e2a45e05-ecc1-42cd-8f68-623097b86843", // Chili Peppers
          "e158d08f-b91b-451c-a86b-ab9dcb3743ad", // Feta
        ],
        addOnPrice: 0.5,
        freeAvailableAddOns: 0,
        kitchenOrders:
          "Incluir hamburguesa picante con jalapeños y queso feta.",
      },
    ],
  },
  {
    uuid: "a493c35a-8da6-4b5a-ab76-75a59ee99f7b", // Changed to a real UUID
    type: "Beverage",
    enName: "Beverages",
    heName: "שתייה",
    esName: "Bebidas",
    imageUrl: "/items/beverages.jpg",
    items: [
      {
        uuid: "0ea93b06-80e9-40b9-add3-49e8f7106b3b", // Changed to a real UUID
        enName: "Coffee",
        heName: "קפה",
        esName: "Café",
        enDetails: "Freshly brewed coffee",
        heDetails: "קפה טרי",
        esDetails: "Café recién hecho",
        imageUrl: "/items/coffee.jpeg",
        price: 2.99,
      },
      {
        uuid: "3573b45b-1381-4a48-967d-16352c0a4b97", // Changed to a real UUID
        enName: "Tea",
        heName: "תה",
        esName: "Té",
        enDetails: "Refreshing tea",
        heDetails: "תה מרענן",
        esDetails: "Té refrescante",
        imageUrl: "/items/tea.jpg",
        price: 2.49,
      },
      {
        uuid: "e50156d5-d82d-4de0-b05f-6bdf1cba2e3c", // Changed to a real UUID
        enName: "Lemonade",
        heName: "לימונדה",
        esName: "Limón",
        enDetails: "Freshly squeezed lemonade",
        heDetails: "לימונדה סחוטה טרייה",
        esDetails: "Limonada recién exprimida",
        imageUrl: "/items/lemonade.jpg",
        price: 3.29,
      },
      {
        uuid: "b1ab5483-16ff-469e-a4e1-79bc6e5e4756", // Changed to a real UUID
        enName: "Orange Juice",
        heName: "מיץ תפוזים",
        esName: "Jugo de Naranja",
        enDetails: "Freshly squeezed orange juice",
        heDetails: "מיץ תפוזים סחוט טהור",
        esDetails: "Jugo de naranja recién exprimido",
        imageUrl: "/items/orange-juice.jpg",
        price: 3.49,
      },
    ],
  },
  {
    uuid: "4c24e8b1-e8b5-4a80-9b92-d31efc2e8505",
    type: "Side Dish",
    enName: "Side Dishes",
    heName: "תוספות",
    esName: "Guarniciones",
    imageUrl: "/items/side-dishes.jpg",
    items: [
      {
        uuid: "1d89bac4-5d32-4c8d-9cb2-09bcfd9b6394",
        enName: "Baguette",
        heName: "באגט",
        esName: "Baguette",
        enDetails: "Freshly baked French baguette.",
        heDetails: "באגט צרפתי אפוי טרי.",
        esDetails: "Baguette francesa recién horneada.",
        imageUrl: "/items/baguette.jpg",
        price: 5.99,
      },
      {
        uuid: "a4c334c9-54c0-4151-b18e-df185b7be6da",
        enName: "Rice",
        heName: "אורז",
        esName: "Arroz",
        enDetails: "Steamed white rice.",
        heDetails: "אורז לבן מאודה.",
        esDetails: "Arroz blanco al vapor.",
        imageUrl: "/items/rice.jpg",
        price: 3.99,
      },
      {
        uuid: "87532813-2d3f-4b37-bc1b-b657fe5fa37f",
        enName: "French Fries",
        heName: "צ'יפס",
        esName: "Papas Fritas",
        enDetails: "Golden hand-cut fries (heart fry).",
        heDetails: "צ'יפס פריך ומזהיב (חיתוך ידני).",
        esDetails: "Papas fritas cortadas a mano (fritura crujiente).",
        imageUrl: "/items/french-fries.jpg",
        price: 4.99,
      },
      {
        uuid: "19e35b02-4f69-4190-b94d-313098715ce6",
        enName: "Pita",
        heName: "פיתה",
        esName: "Pita",
        enDetails: "Freshly baked pita bread.",
        heDetails: "לחם פיתה אפוי טרי.",
        esDetails: "Pan de pita recién horneado.",
        imageUrl: "/items/pita.jpg",
        price: 2.99,
      },
    ],
  },
  {
    uuid: "de3f5383-2c58-4c9d-b9e9-1413a0e80bcc", // Changed to a real UUID
    type: "Soups",
    enName: "Soups",
    heName: "מרקים",
    esName: "Sopas",
    imageUrl: "/items/soups.jpg",
    items: [
      {
        uuid: "7976d0e6-4f0a-4e39-a0b1-a0078b20b0ba", // Changed to a real UUID
        enName: "Tomato Soup",
        heName: "מרק עגבניות",
        esName: "Sopa de Tomate",
        enDetails: "Creamy tomato soup with fresh basil",
        heDetails: "מרק עגבניות עם בזיליקום טרי",
        esDetails: "Sopa de tomate cremosa con albahaca fresca",
        imageUrl: "/items/tomato-soup.jpg",
        price: 3.49,
      },
      {
        uuid: "fe6b5100-b635-4197-8770-1b58c92006c9", // Changed to a real UUID
        enName: "Chicken Noodle Soup",
        heName: "מרק עוף עם אטריות",
        esName: "Sopa de Pollo con Fideos",
        enDetails: "Hearty chicken noodle soup",
        heDetails: "מרק עוף עשיר עם אטריות",
        esDetails: "Sopa de pollo abundante con fideos",
        imageUrl: "/items/chicken-noodle-soup.jpg",
        price: 4.49,
      },
      {
        uuid: "b276c1e0-700f-414e-88c8-44897b387b1b", // Changed to a real UUID
        enName: "Mushroom Soup",
        heName: "מרק פטריות",
        esName: "Sopa de Champiñones",
        enDetails: "Rich mushroom soup with herbs",
        heDetails: "מרק פטריות עשיר עם עשבי תיבול",
        esDetails: "Sopa de champiñones rica con hierbas",
        imageUrl: "/items/mushroom-soup.jpg",
        price: 3.99,
      },
    ],
  },
  {
    uuid: "15e13de7-94a4-46fd-8779-a1de85673540", // Changed to a real UUID
    type: "Salads",
    enName: "Salads",
    heName: "סלטים",
    esName: "Ensaladas",
    imageUrl: "/items/salads.jpg",
    items: [
      {
        uuid: "44577e4b-8191-4c4f-943e-c11eb803d652", // Changed to a real UUID
        enName: "Caesar Salad",
        heName: "סלט קיסר",
        esName: "Ensalada César",
        enDetails: "Classic Caesar salad with croutons",
        heDetails: "סלט קיסר קלאסי עם קוביות לחם",
        esDetails: "Ensalada César clásica con picatostes",
        imageUrl: "/items/caesar-salad.jpg",
        price: 3.99,
      },
      {
        uuid: "dfe8f4fa-4374-4c72-98bd-5e1a869c72ca", // Changed to a real UUID
        enName: "Greek Salad",
        heName: "סלט יווני",
        esName: "Ensalada Griega",
        enDetails: "Refreshing Greek salad with feta cheese",
        heDetails: "סלט יווני מרענן עם גבינת פטה",
        esDetails: "Ensalada griega refrescante con queso feta",
        imageUrl: "/items/greek-salad.jpg",
        price: 4.49,
      },
      {
        uuid: "b08099b8-bf71-4bbc-b8d7-88adc9c70f9a", // Changed to a real UUID
        enName: "Garden Salad",
        heName: "סלט גן",
        esName: "Ensalada de Jardín",
        enDetails: "Mixed garden salad with a variety of veggies",
        heDetails: "סלט גן מעורב עם מגוון ירקות",
        esDetails: "Ensalada mixta de jardín con una variedad de verduras",
        imageUrl: "/items/garden-salad.jpg",
        price: 3.49,
      },
      {
        uuid: "c2380aab-b99e-4942-b7aa-0cbf7b6d1da8", // Quinoa Salad UUID
        enName: "Quinoa Salad",
        heName: "סלט קינואה",
        esName: "Ensalada de Quinoa",
        enDetails: "Nutritious quinoa salad with fresh vegetables",
        heDetails: "סלט קינואה מזין עם ירקות טריים",
        esDetails: "Ensalada de quinoa nutritiva con verduras frescas",
        imageUrl: "/items/quinoa-salad.jpg",
        price: 3.49,
      },
    ],
  },
  {
    uuid: "d9a736c1-8eb9-4638-a327-787cca6ee2d3", // Desserts category UUID
    type: "Desserts",
    enName: "Desserts",
    heName: "קינוחים",
    esName: "Postres",
    imageUrl: "/items/desserts.jpg",
    items: [
      {
        uuid: "f1d0c00f-17a9-4f10-8af2-8baf879cd6c9", // Chocolate Cake UUID
        enName: "Chocolate Cake",
        heName: "עוגת שוקולד",
        esName: "Pastel de Chocolate",
        enDetails: "Rich and moist chocolate cake",
        heDetails: "עוגת שוקולד עשירה ולחה",
        esDetails: "Pastel de chocolate rico y húmedo",
        imageUrl: "/items/chocolate-cake.jpg",
        price: 4.99,
      },
      {
        uuid: "1e2e56c4-e697-4b8d-9e88-d65c0d5dc5a0", // Fruit Salad moved to Desserts UUID
        enName: "Fruit Salad",
        heName: "סלט פירות",
        esName: "Ensalada de Frutas",
        enDetails: "Refreshing fruit salad mixed with yogurt",
        heDetails: "סלט פירות מרענן מעורב עם יוגורט",
        esDetails: "Ensalada de frutas refrescante mezclada con yogur",
        imageUrl: "/items/fruit-salad.jpg",
        price: 3.99,
      },
    ],
  },
];

module.exports = {
  CATEGORIES,
  ADD_ONS,
};
