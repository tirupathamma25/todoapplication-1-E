const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server is Running"));
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1

app.get("/todos/", async (request, response) => {
  const { priority = "HIGH", status = "TO%20DO" } = request.query;

  const getTodosQuery = `
    SELECT * FROM todo
    WHERE priority LIKE '%${priority}%' AND status LIKE '%${status}%';
    `;
  const todosArray = await database.all(getTodosQuery);
  response.send(todosArray);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT id, todo, priority, status
     FROM todo 
    WHERE id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

// API 3

app.post("/todos/", async (request, response) => {
  const { todoDetails } = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
     INSERT INTO 
     todo (id,todo,priority, status)
     VALUES 
     (${id},'${todo}', '${priority}', '${status}');`;
  const dbResponse = await database.run(addTodoQuery);
  const todoId = dbResponse.lastID;
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { todo, priority, status } = todoDetails;
  const updateTodoQuery = `
    UPDATE todo 
    SET 
    todo = '${todo}'
    priority = '${priority}',
    status = '${status}',

    WHERE id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Status Updated");
});

// API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM 
    todo
    WHERE id = ${todoId};`;
  await database.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
