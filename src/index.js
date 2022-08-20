const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  if (!username) return response.status(400).send();

  const user = users.find((user) => user.username === username);
  if (!user) return response.status(404).send();

  request["user"] = user;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username
  );
  if (usernameAlreadyExists) {
    return response.status(400).send({ error: "Username already exists!" });
  }

  const user = { id: uuidv4(), name, username, todos: [] };
  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todos } = user;

  return response.send(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: "Task does not exists!" });
  }

  const { title, deadline } = request.body;
  Object.assign(todo, { title, deadline });

  return response.status(200).send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: "Task does not exists!" });
  }

  todo.done = true;

  return response.status(200).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: "Task does not exists!" });
  }

  const { todos } = user;
  const indexTodo = todos.indexOf(todo);
  todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;
