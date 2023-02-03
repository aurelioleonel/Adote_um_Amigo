const express = require("express");
const cors = require("cors");

const app = express();

// Config JSON response
app.use(express.json())

// Solve CORS
//app.use(cors({ credentials: true, origin: "http://127.0.0.1:3000" }));
app.use(cors({ credentials: true, origin: "*" }));


// Public folder for images
app.use(express.static("public"))

// Routes
const UserRoutes = require("./routes/UserRoutes")
const PetRoutes = require("./routes/PetRoutes")



app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);

const port = 5000;
app.listen(port);

console.log(`Conectado ao servidor na porta ${port}`);