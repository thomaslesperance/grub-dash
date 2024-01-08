# GrubDash

## Context
GrubDash is a simple CRUDL API created to showcase skill with the Express framework.

## How to Use

1. Fork and clone repo
2. npm install
3. npm run start:dev
4. Open browser to localhost:5000
5. Append browser URL with any of te valid application paths (e.g., /orders/:orderId)

## Features
Here is an image of what a frontend to the application might look like:
![image](https://github.com/thomaslesperance/GrubDash/assets/144936700/6f85c776-05e9-4170-a770-786ce0b452ed)

The application currently provides the following CRUDL features for the corresponding paths/HTTP method pairs:

////////////////////////////
//Dishes routes
//GET       /dishes            Provides list of existing dishes
//POST      /dishes            Creates a dish
//GET       /dishes/:dishId    Provides a single dish by dishId
//PUT       /dishes/:dishId    Updates a dish as determined by dishId
//
//Orders routes
//GET       /orders            Provides a list of existing orders
//POST      /orders            Creates an order
//GET       /orders/:orderId   Provides a single order by orderId
//PUT       /orders/:orderId   Updates a single order as determined by orderId
//DELETE    /orders/:orderId   Deletes a signle order as determined by orderId
/////////////////////////////

All data is loaded from the two data.js files and modified in memory only.

## Tools and Technology

--  JavaScript
--  Express

## Conclusion

At this time, there is no database management system to accompany this application. As such, future goals for this code could include establishing a means for storing and modifying data permanantly rather than in memory only. The route organizing schema and other code organization and Express concepts might also be taken from this project and incorporated into other more sophisticated projects.
