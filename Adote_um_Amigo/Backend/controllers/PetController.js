const Pet = require("../models/Pet");

// helpers
const getToken = require("../helpers/get-token")
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {

    // create a pet
    static async create(req, res) {
        const { name, age, weight, color } = req.body;
        const available = true;
        const images = req.files;

        // images upload

        // validations

        if (!name) {
            res.status(422).json({ message: "O campo nome é obrigatório" });
            return;
        }
        if (!age) {
            res.status(422).json({ message: "O campo idade é obrigatório" });
            return;
        }
        if (!weight) {
            res.status(422).json({ message: "O campo peso é obrigatório" });
            return;
        }
        if (!color) {
            res.status(422).json({ message: "O campo cor é obrigatório" });
            return;
        }
        if (images.length === 0) {
            res.status(422).json({ message: "A imagem é obrigatório" });
            return;
        }

        // get pet owner
        const token = getToken(req);
        const user = await getUserByToken(token);

        // Writing to the database
        const pet = new Pet({
            name, age, weight, color, available, images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,

            },
        })

        images.map((image) => {
            pet.images.push(image.filename)
        });

        try {
            const newPet = await pet.save();
            res.status(201).json({
                message: "Pet cadastrado com sucesso",
                newPet
            })
        } catch (error) {
            res.status(500).json({ message: error });
        }


    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort("-createdAt")

        res.status(200).json({
            pets: pets,
        })

    }

    static async getAllUserPets(req, res) {

        // get user from token
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt")

        res.status(200).json({
            pets,
        })

    }

    static async getAllUserAdoptions(req, res) {

        // get user from token
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt")

        res.status(200).json({
            pets,
        })

    }

    static async getPetById(req, res) {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: "ID inválido!!" });
            return;
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })
        if (!pet) {
            res.status(404).json({ message: "Pet não encontrado!!!" })
        }

        res.status(200).json({
            pet: pet,
        })

    }

    static async removePetById(req, res) {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: "ID inválido!!" });
            return;
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id })
        if (!pet) {
            res.status(404).json({ message: "Pet não encontrado!!!" })
            return;
        }


        // check if logged in user registred the pet
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user.id.toString()) { //so exclui se o pet foi cadastrado pelo mesmo user que esta excluido
            res.status(404).json({ message: "Não foi possivel processar a sua solicitação de exclusão!!!" })
            return
        }

        await Pet.findByIdAndRemove(id);
        res.status(200).json({ message: "Pet removido com sucesso!!!" })


    }

    static async updatePet(req, res) {

        const id = req.params.id
        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: "ID inválido!!" });
            return;
        }

        const { name, age, weight, color, available } = req.body;
        const images = req.files;
        const updateData = {};

        // check if pet exists
        const pet = await Pet.findOne({ _id: id });
        if (!pet) {
            res.status(404).json({ message: "Pet não encontrado!!" });
            return;
        }

        // check if logged in user registred the pet
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user.id.toString()) { //so exclui se o pet foi cadastrado pelo mesmo user que esta excluido
            res.status(404).json({ message: "Não foi possivel processar a sua solicitação de alteração!!!" })
            return
        }

        if (!name) {
            res.status(422).json({ message: "O campo nome é obrigatório" });
            return;
        } else {
            updateData.name = name;
        }
        if (!age) {
            res.status(422).json({ message: "O campo idade é obrigatório" });
            return;
        } else {
            updateData.age = age;
        }
        if (!weight) {
            res.status(422).json({ message: "O campo peso é obrigatório" });
            return;
        } else {
            updateData.weight = weight;
        }
        if (!color) {
            res.status(422).json({ message: "O campo cor é obrigatório" });
            return;
        } else {
            updateData.color = color;
        }
        if (images.length > 0) {
            updateData.images = [];
            images.map((image) => {
                updateData.images.push(image.filename);
            })
        }    
       // } else {
         //  res.status(422).json({ message: "A imagem é obrigatória" });
         //  return
       // }   

        await Pet.findByIdAndUpdate(id, updateData);
        res.status(200).json({ message: "Pet atualizado com sucesso!!" })

    }

    static async schedule(req, res) {

        const id = req.params.id
        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: "ID inválido!!" });
            return;
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id });
        if (!pet) {
            res.status(404).json({ message: "Pet não encontrado!!" });
            return;
        }

        // check if user registered the pet
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.equals(user.id)) {
            res.status(404).json({ message: "Não é possivel agendar para o seu próprio Pet!!!" })
            return
        }

        // check if user has already scheduled a visit
        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                res.status(422).json({ message: "Você já agendou uma visita para este Pet!!!" })
                return
            }
        }

        // add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image,
        }

        await Pet.findByIdAndUpdate(id, pet);
        res.status(200).json({
            message: `
              A visita foi agendada com sucesso,
              entre em contato com ${pet.user.name} 
              pelo telefone ${pet.user.phone}
            `
        })
    }

    static async concludeAdoption(req, res) {

        const id = req.params.id
        if (!ObjectId.isValid(id)) {
            res.status(422).json({ message: "ID inválido!!" });
            return;
        }

        // check if pet exists
        const pet = await Pet.findOne({ _id: id });
        if (!pet) {
            res.status(404).json({ message: "Pet não encontrado!!" });
            return;
        }

        // check if logged in user registred the pet
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user.id.toString()) {
            res.status(404).json({ message: "Houve um erro em processar sua solicitação!!" })
            return
        }

        pet.available = false;
        await Pet.findByIdAndUpdate(id, pet);
        res.status(200).json({
            message: "Parabens! O ciclo de adoção foi finalizado com sucesso!!"
        })

    }


}
