# LIST IT API Documentation
The List It API provides text based list of categories, text based list of store locations, and json stored user generated lists.

## GET a list of all currently stored categories in this service.
**Request Format:** /categories

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Returns a list of all of the categories to personalize a list.

**Example Request:** /categories

**Example Response:**
```
Animals
Art
Awards
Beverages
Birthdays
Books
Buildings
Classes
...
```

**Error Handling:**
- Possible 500 (internal server error) errors in plain text:
  - If the file cannot be found with message: `File Not Found!`
  - Other server errors with message: `SERVER ERROR: CONTACT ADMIN`

## GET a list of all currently stored store locations in this service.
**Request Format:** /stores

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Returns a list of all the store locations to personalize a list.

**Example Request:** /stores

**Example Response:**
```
AT&T
Amazon
American Eagle
Apple
Barnes & Noble
Bath & Body Works
Ben Bridge
Best Buy
...
```

**Error Handling:**
- Possible 500 (internal server error) errors in plain text:
  - If the file cannot be found with message: `File Not Found!`
  - Other server errors with message: `SERVER ERROR: CONTACT ADMIN`

## GET a list of all currently stored lists in this service.
**Request Format:** /lists

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a JSON of the number of posts on the server and all lists currently stored on the server.

**Example Request:** /lists

**Example Response:**
```json
{
  "posts":1,
  "Example1": {
    "title": "Example List1",
    "date": "2000-01-01",
    "category": "Other",
    "store": "Other",
    "website": "examples.com",
    "item1": "item 1",
    "checked1": false,
    "item2": "item 2",
    "checked2": true,
    "item3": "item",
    "checked3": true}}
```

**Error Handling:**
- Possible 500 (internal server error) errors in plain text:
  - If the file cannot be found with message: `File Not Found!`
  - Other server errors with message: `SERVER ERROR: CONTACT ADMIN`

## POST a new user generated category to the categories.txt file.
**Request Format:** /categories/new

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Returns a plain text message whether the request was successful or not.

**Example Request:** /categories/new

**Example Response:**
```
"Updated categories"
```
or
```
"Category already exists - nothing added"
```

**Error Handling:**
- Possible 500 (internal server error) errors in plain text:
  - If the file cannot be found with message: `File Not Found!`
  - Other server errors with message: `SERVER ERROR: CONTACT ADMIN`

## POST a new user generated store location to the stores.txt file.
**Request Format:** /stores/new

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Returns a plain text message whether the request was successful or not.

**Example Request:** /stores/new

**Example Response:**
```
"Updated stores"
```
or
```
"Store already exists - nothing added"
```

**Error Handling:**
- Possible 500 (internal server error) errors in plain text:
  - If the file cannot be found with message: `File Not Found!`
  - Other server errors with message: `SERVER ERROR: CONTACT ADMIN`

## POST a new user generated list to the lists.json file.
**Request Format:** /lists/new

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Given valid form parameters, requiring title, date, and at least one item, will update the lists.json file without response. No duplicate post keys possible as internal post names are programatically generated.

**Example Request:** /lists/new

**Example Response:**
- N/A

**Error Handling:**
- Possible 400 (invalid request) errors in plain text:
  - If a required parameter is missing with message: `Missing Required Parameters`
- Possible 500 (internal server error) errors in plain text:
  - If the file cannot be found with message: `File Not Found!`
  - Other server errors with message: `SERVER ERROR: CONTACT ADMIN`