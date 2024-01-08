const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

//
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

function dishesIsArray() {
  return function (req, res, next) {
    const { data: { dishes } = {} } = req.body;
    const isArray = Array.isArray(dishes);
    if (isArray && isArray.length > 0) {
      res.locals.dishes = dishes;
      return next();
    }
    next({
      status: 400,
      message: "Order must include at least one dish.",
    });
  };
}

function quantityIsValidNumber(req, res, next) {
  const dishes = res.locals.dishes;
  dishes.forEach((dish) => {
    if (dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
      return next({
        status: 400,
        message: `Quantity requires a valid number`,
      });
    }
  });
  next();
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({ status: 404, message: `Order does not exist: ${orderId}.` });
  }
}

function bodyIdMatchesRouteId(req, res, next) {
  const { data: { id } = {} } = req.body;
  const orderId = res.locals.order.id;
  if (id) {
    const matchesRouteId = id === orderId;
    return matchesRouteId
      ? next()
      : next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${id}, Route: ${orderId}`,
        });
  } else next();
}

function statusPropertyIsNotDelivered(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: `Value of the 'status' property must be one of ${validStatus}. Received: ${status}`,
  });
}

function statusPropertyIsNotPending(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: `Value of the 'status' property must be one of ${validStatus}. Received: ${status}`,
  });
}

//
//Route handlers

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status } = {} } = req.body;
  const dishes = res.locals.dishes;
  const newOrderId = nextId();
  const newOrder = {
    id: newOrderId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const { data: { deliverTo, mobileNumber, status } = {} } = req.body;
  const dishes = res.locals.dishes;
  const id = res.locals.order.id;
  const index = orders.findIndex((order) => order.id === id);
  const updatedOrder = {
    id: id,
    deliverTo,
    mobileNumber,
    status,
    dishes: dishes,
  };
  orders.splice(index, 1, updatedOrder);
  res.json({ data: updatedOrder });
}

function destroy(req, res) {
  const id = res.locals.order.id;
  const index = orders.findIndex((order) => order.id === id);
  orders.splice(index, 1);
  res.sendStatus(204);
}

function list(req, res) {
  res.json({ data: orders });
}

//
//Exports

module.exports = {
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesIsArray,
    quantityIsValidNumber,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    bodyIdMatchesRouteId,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    bodyDataHas("status"),
    dishesIsArray,
    quantityIsValidNumber,
    statusPropertyIsNotDelivered,
    update,
  ],
  delete: [orderExists, statusPropertyIsNotPending, destroy],
  list,
};
