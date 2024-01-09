const path = require("path")

const orders = require(path.resolve("src/data/orders-data"))
const nextId = require("../utils/nextId")

function bodyHasDeliverProp(req, res, next) {
  const { data: { deliverTo } = {} } = req.body
  
  if (deliverTo) {
    res.locals.deliverTo = deliverTo
    return next()
  }
  next({
    status: 400,
    message: `A 'deliverTo' property is required.`,
  })
}

function bodyHasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body
  if (mobileNumber) {
    res.locals.mobileNumber = mobileNumber
    return next()
  }
  next({
    status: 400,
    message: `A 'mobileNumber' property is required.`,
  })
}

function bodyHasStatus(req, res, next) {
  const { data: { status } = {} } = req.body
  if (status) {
    res.locals.status = status
    return next()
  }
  next({
    status: 400,
    message: `A 'status' property is required.`,
  })
}

// middleware for checking if the status is in the correct format
function dataStringIsValid(req, res, next) {
  const { data: { status } = {} } = req.body
  if (
    status.includes("pending") ||
    status.includes("preparing") ||
    status.includes("out-for-delivery") ||
    status.includes("delivered")

  ) {
    res.locals.status = status
    return next()
  }
  next({
    status: 400,
    message: `status property must be valid string: 'pending', 'preparing', 'out-for-delivery', or 'delivered'`,
  })
}

// middleware for checking if there is a dish(s) in the order
function bodyHasDishesProp(req, res, next) {
  const { data: { dishes } = {} } = req.body
  if (dishes) {
    res.locals.dishes = dishes
    return next()
  }
  next({
    status: 400,
    message: `A 'dishes' property is required.`,
  })
}

function dishesArrayIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body
  if (!Array.isArray(res.locals.dishes) || res.locals.dishes.length == 0) {
    next({
      status: 400,
      message: `invalid dishes property: dishes property must be non-empty array`,
    })
  }
  next()
}

function dishesArrayLengthIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body
  dishes.forEach((dish) => {
    const quantity = dish.quantity
    if (!quantity || quantity <= 0 || typeof quantity !== "number") {
      return next({
        status: 400,
        message: `dish ${dish.id} must have quantity property, quantity must be an integer, and it must not be equal to or less than 0`,
      })
    }
  })
  next()
}

function dataIdMatchesOrderId(req, res, next) {
  const { data: { id } = {} } = req.body
  const orderId = req.params.orderId
  if (id !== undefined && id !== null && id !== "" && id !== orderId) {
    next({
      status: 400,
      message: `id ${id} must match orderId provided in parameters`,
    })
  }
  return next()
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId
  const matchingOrder = orders.find((order) => order.id === orderId)
  if (matchingOrder) {
    res.locals.order = matchingOrder
    return next()
  }
  next({
    status: 404,
    message: `Order id not found: ${req.params.orderId}`,
  })
}

// handler for listing the all of the orders
function list(req, res) {
  res.json({ data: orders })
}

// handler for updating an order
function update(req, res) {
  const orderId = req.params.orderId
  const matchingOrder = orders.find((order) => order.id === orderId)
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
  matchingOrder.deliverTo = deliverTo
  matchingOrder.mobileNumber = mobileNumber
  matchingOrder.status = status
  matchingOrder.dishes = dishes
  res.json({ data: matchingOrder })
}

function read(req, res) {
  const orderId = req.params.orderId
  const matchingOrder = orders.find((order) => order.id === orderId)
  res.json({ data: matchingOrder })
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "out-for-delivery",
    dishes,
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}

function destroy(req, res, next) {
  const { orderId } = req.params
  const matchingOrder = orders.find((order) => order.id === orderId)
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body
  if (matchingOrder.status === "pending") {
    const index = orders.findIndex((order) => order.id === Number(orderId))
    orders.splice(index, 1)
    res.sendStatus(204)
  }
  return next({
    status: 400,
    message: `order cannot be deleted unless order status = 'pending'`,
  })
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    bodyHasDeliverProp,
    bodyHasMobileNumber,
    bodyHasDishesProp,
    dishesArrayIsValid,
    dishesArrayLengthIsValid,
    create,
  ],
  update: [
    orderExists,
    dataIdMatchesOrderId,
    bodyHasDeliverProp,
    bodyHasMobileNumber,
    bodyHasDishesProp,
    bodyHasStatus,
    dataStringIsValid,
    dishesArrayIsValid,
    dishesArrayLengthIsValid,
    update,
  ],
  delete: [orderExists, destroy],
}