const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("JsonWebToken");
const mongoose = require("mongoose");

// helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");


module.exports = class UserController {

    static async register(req, res) {  //post
        // res.json("Olá Get a Pet");
        const { name, email, phone, password, confirmepassword } = req.body;
        let msg = '';
        //validations
        if (!name) {
            msg = "O campo nome é obrigatorio";
        } else if (!email) {
            msg = "O campo email é obrigatorio";
        } else if (!phone) {
            msg = "O campo telefone é obrigatorio";
        } else if (!password) {
            msg = "O campo senha é obrigatorio";
        } else if (!confirmepassword) {
            msg = "O campo comfirme a senha é obrigatorio";
        } else if (password !== confirmepassword) {
            msg = "A senha e Senha de confimação estão diferentes!!!"
        }
        if (msg !== '') {
            res.status(422).json({ message: msg });
            return
        }
        // check if user exists
        const userExists = await User.findOne({ email: email })
        if (userExists) {
            res.status(422).json({ message: "Por favor utilizar outro email!!!!" })
            return
        }

        // create a password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = bcrypt.hashSync(password, salt)

        // create a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,

        })

        try {

            const newUser = await user.save();

            await createUserToken(newUser, req, res);

            res.status(201).json({
                message: "usuário criado com sucesso!!!!",
                newUser
            })

        } catch (error) {
            res.status(500).json({ message: error })
        }

    }

    static async login(req, res) {
        const { email, password } = req.body;

        if (!email) {
            res.status(422).json({ message: "O campo email é obrigatorio" });
            return
        }
        if (!password) {
            res.status(422).json({ message: "O campo senha é obrigatorio" });
            return
        }

        // check if user exists
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(422).json({ message: "Não foi possivel localizar o usuário com este email!!!!" })
            return
        }

        // chec k if password match with db password
        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
            res.status(422).json({ message: "Senha inválida!!" })
            return
        }

        await createUserToken(user, req, res);
    }

    static async checkUser(req, res) {

        let currentUser

        if (req.headers.authorization) {

            const token = getToken(req);
            const decoded = jwt.verify(token, "nossosecret");
            currentUser = await User.findById(decoded.id);
            currentUser.password = undefined; //para não aparecer a senha no retorno

        } else {
            currentUser = null
        }


        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {
        try {
            if (!req.params.id || isNaN(parseInt(req.params.id))) {
                return res
                    .status(404)
                    .json({ message: "O código do usuário informado não é válido" });
            };

            const id = new mongoose.Types.ObjectId(req.params.id);
            const user = await User.findById(id).select("-password");
            if (!user) {
                res.status(422).json({
                    message: "Usuário não encontrado!!!"
                })
                return
            }

            res.status(200).json({ user });

        } catch (error) {
            return res
                .status(500)
                .json({ message: "O servidor informa.: Usuário não encontrado!!!" });
        }

    }

    static async editUser(req, res) {
        try {

            const id = req.params.id;

            //check if user exists
            const token = getToken(req);
            const user = await getUserByToken(token);

            const { name, email, phone, password, confirmpassword } = req.body;
            let image = "";
            if (req.file) {
                user.image = req.file.filename;
            }

            // validations
            if (!name) {
                res.status(422).json({ message: "O campo nome é obrigatório!!" });
                return
            }
            if (!email) {
                res.status(422).json({ message: "O campo email é obrigatório!!" });
                return
            }
            user.name = name;

            //check if email has already taken
            const userExist = await User.findOne({ email: email });

            if (user.email !== email && userExist) {
                res.status(422).json({ message: "Por favor usar o email cadastrado no sistema!!" });
                return
            }
            user.email = email;


            if (!phone) {
                res.status(422).json({ message: "O campo telefone é obrigatório!!" });
                return
            }
            user.phone = phone

            if (password != confirmpassword) {
                res.status(422).json({ message: "As senhas não conferem!!!" });
                return
            } else if (password === confirmpassword && password != null) {
                //creatig password
                const salt = await bcrypt.genSalt(12);
                const passwordHash = await bcrypt.hash(password, salt);

                user.password = passwordHash;

            }

            // returns user update date
            const updateUser = await User.findByIdAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true },
            )



            res.status(200)
                .json({ message: "Usuário atualizado com sucesso!!!" });

        } catch (error) {
            return res
                .status(500)
                .json({ message: "O servidor informa.: Usuário não encontrado!!!" });
        }


    }

}

// try {

//     const id = new mongoose.Types.ObjectId(req.params.id);

//     //check if user exists
//     const token = getToken(req)
//     const user = await getUserByToken(token)

//             const { name, email, phone, password, confirmepassword } = req.body;
// let image = "";
// let msg = '';

// //validations
// if (msg === "") {
//     if (!name) {
//         msg = "O campo nome é obrigatorio";
//     } else if (!email) {
//         msg = "O campo email é obrigatorio";
//     } else if (!phone) {
//         msg = "O campo telefone é obrigatorio";
//     } else if (!password) {
//         msg = "O campo senha é obrigatorio";
//     } else if (!confirmepassword) {
//         msg = "O campo comfirme a senha é obrigatorio";
//     } else if (password !== confirmepassword) {
//         msg = "A senha e Senha de confimação estão diferentes!!!"
//     }

//     if (msg !== '') {
//         res.status(422).json({ message: msg });
//         return
//     }

// }

// //check if email has already taken
// const userEmailExists = await User.findOne({ email: email });

// if (user.email !== email && userEmailExists) {
//     res.status(422).json({ message: "Não foi encontrado usuário com este email!!!" });
//     return
// };

// user.email = email;





//             // //check if use exists
//             // const user = await User.findById(id);
//             // if (!user) {
//             //     res.status(422).json({
//             //         message: "Usuário não encontrado!!!"
//             //     })
//             //     return
//             // }



//         } catch (error) {
//     return res
//         .status(500)
//         .json({ message: "O servidor informa.: Usuário não encontrado!!!" });
// }