const router = require("express").Router();

const UserController = require("../controllers/UserController");

//middleware
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload")



//create a new user
router.post("/register", UserController.register);

//login
router.post("/login", UserController.login);

//check a user whit validation
router.get("/checkuser", UserController.checkUser);

//Listando usuario pelo Id
router.get("/:id", UserController.getUserById);

//Atualizando o usuário
router.patch("/edit/:id", verifyToken, imageUpload.single("image"), UserController.editUser);



module.exports = router