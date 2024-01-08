const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

//Middleware

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

function priceIsValidNumber(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Price must be a number greater than 0.",
    });
  }
  next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({ status: 404, message: `Dish does not exist: ${dishId}.` });
  }
}

function bodyIdMatchesRouteId(req, res, next) {
  const { data: { id } = {} } = req.body;
  const dishId = res.locals.dish.id;
  if (id) {
    const matchesRouteId = id === dishId;
    return matchesRouteId
      ? next()
      : next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
  } else next();
}

//
//Route handlers

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = nextId();
  const newDish = {
    id: newId,
    name: name,
    description: description,
    price: Number(price),
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const dishId = res.locals.dish.id;
  const updatedDish = {
    id: dishId,
    name: name,
    description: description,
    price: Number(price),
    image_url: image_url,
  };
  const index = dishes.findIndex((dish) => dish.id === dishId);
  dishes.splice(index, 1, updatedDish);
  res.json({ data: updatedDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

//
//Exports

module.exports = {
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceIsValidNumber,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    bodyIdMatchesRouteId,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceIsValidNumber,
    update,
  ],
  list,
};
