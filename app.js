/**
 * Name: Michael Harris
 * Date: August 11, 2021
 * Section: CSE 154 AD
 *
 * Server side API for cp4. Handles get and post requests for categories, stores,
 * and lists. Each of these are stored in their respective files: categories.txt,
 * stores.txt, and lists.json.
 *
 * Functionality missing but wanted to have wass to update lists if an item in
 * a list is checkmarked. Field property already exists.
 */

"use strict";

/*
 ****
 * MODULE GLOBAL CONSTANTS *
 ****
 */
const STATUS_400 = 400;
const STATUS_500 = 500;
const PORT_8000 = 8000;

/*
 ********************
 * REQUIRED MODULES *
 ********************
 */
const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const app = express();

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// for application/json
app.use(express.json());

// for multipart/form-data
app.use(multer().none());

/*
 *************
 * ENDPOINTS *
 *************
 */

app.get("/categories", async (req, res) => {
  try {
    let data = await fs.readFile("categories.txt", "utf8");
    res.type("text").send(data);
  } catch (err) {
    handleError(err, res);
  }
});

app.get("/stores", async (req, res) => {
  try {
    let data = await fs.readFile("stores.txt", "utf8");
    res.type("text").send(data);
  } catch (err) {
    handleError(err, res);
  }
});

app.get("/lists", async (req, res) => {
  try {
    let data = await fs.readFile("lists.json", "utf8");
    res.type("json").send(data);
  } catch (err) {
    handleError(err, res);
  }
});

app.post("/categories/new", async (req, res) => {
  res.type("text");
  let newCategory = req.body.category;
  if (newCategory) {
    try {
      let data = await fs.readFile("categories.txt", "utf8");
      let categories = data.split("\n");
      if (categories.indexOf(newCategory) === -1) {
        categories.push(newCategory);
        categories.sort();
        await fs.writeFile("categories.txt", categories.join("\n"));
        res.send("Updated categories");
      } else {
        res.send("Category already exists - nothing added");
      }
    } catch (err) {
      handleError(err, res);
    }
  }
});

app.post("/stores/new", async (req, res) => {
  res.type("text");
  let newStore = req.body.store;
  if (newStore) {
    try {
      let data = await fs.readFile("stores.txt", "utf8");
      let stores = data.split("\n");
      if (stores.indexOf(newStore) === -1) {
        stores.push(newStore);
        stores.sort();
        await fs.writeFile("stores.txt", stores.join("\n"));
        res.send("Updated stores");
      } else {
        res.send("Store already exists - nothing added");
      }
    } catch (err) {
      handleError(err, res);
    }
  }
});

app.post("/lists/new", async (req, res) => {
  res.type("json");
  let params = getPostReqData(req);
  if (params[0] && params[1] && params[5]) {
    try {
      let data = await fs.readFile("lists.json", "utf8");
      data = JSON.parse(data);
      let newData = buildNewData(params, data);
      data["posts"] = (data["posts"] + 1);
      await fs.writeFile("lists.json", JSON.stringify(newData));
    } catch (err) {
      handleError(err, res);
    }
  } else {
    res.status(STATUS_400).send("Missing Required Parameters");
  }
});

/*
 ********************
 * HELPER FUNCTIONS *
 ********************
 */

/**
 * Builds a new data object comprised with a newly posted list.
 * @param {Array} params the parameters from a request object
 * @param {object} data the information from lists.json fs.readFile
 * @returns {object} the updated data with the new list
 */
function buildNewData(params, data) {
  let newPostKey = "post" + (data["posts"] + 1);
  data[newPostKey] = {
    "title": params[0],
    "date": params[1],
    "category": params[2],
    "store": params[3],
    "website": params[4]
  };

  let items = params[5];
  items = items.split(",");
  for (let i = 0; i < items.length; i++) {
    let obj = data[newPostKey];
    let newItemProperty = "item" + (i + 1);
    let newCheckedProperty = "checked" + (i + 1);
    let newValue = items[i];
    obj[newItemProperty] = newValue;
    obj[newCheckedProperty] = false;
  }
  return data;
}

/**
 * Returns an array of req data needed for new lists.
 * @param {object} req the request object for a post API call
 * @returns {Array} the array of values from the request object
 */
function getPostReqData(req) {
  let title = req.body.title;
  let date = req.body.date;
  let category = req.body.category;
  let store = req.body.store;
  let website = req.body.website;
  let items = req.body.items;
  return [title, date, category, store, website, items];
}

/**
 * Evaluates error codes and returns the response with the proper status code.
 * @param {object} err the error object to be evaluated
 * @param {object} res the response object
 * @returns {object} the updated response object
 */
function handleError(err, res) {
  if (err.code === "ENOENT") {
    res.status(STATUS_500).send("File Not Found!");
  } else {
    res.status(STATUS_500).send("SERVER ERROR: CONTACT ADMIN");
  }
  return res;
}

/*
 ******************
 * PORT LISTENING *
 ******************
 */
const PORT = process.env.PORT || PORT_8000;
app.listen(PORT, () => {
  // console.log("Listening on port " + PORT + "..."); // uncomment for debugging
});

app.use(express.static("public"));