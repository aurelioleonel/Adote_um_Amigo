import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RoundedImage from '../../layout/RoundedImage';
import api from '../../../utils/api';
import styles from './Dashboard.module.css'

/* hooks */
import useFlashMessage from '../../../hooks/useFlashMessage'



function MyPets() {
    const [pets, setPets] = useState({});
    const [token] = useState(localStorage.getItem('token') || '');
    const { setFlashMessage } = useFlashMessage();

    useEffect(() => {
        api.get('pets/mypets', {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`
            }
        }).then((response) => {
            setPets(response.data.pets)
        })
    }, [token])

    async function removePet(id) {
        let msgType = 'success';

        const data = await api.delete(`/pets/${id}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            const updatePets = pets.filter((pet) => pet._id !== id);
            setPets(updatePets);
            return response.data
        }).catch((err) => {
            msgType = 'error'
            return err.response.data
        })

        setFlashMessage(data.message, msgType);
    }

    async function concludeAdoption(id) {
        let msgType = 'success'
        const data = await api.patch(`/pets/conclude/${id}`, null, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data'
            },
        }).then((response) => {
            return response.data
        }).catch((err) => {
            msgType = 'error';
            return err.response.data
        })
        setFlashMessage(data.message, msgType);
    }


    return (
        <section >
            <div className={styles.petlist_header}>
                <h1>MyPets</h1>
                <Link to="/pet/add">Cadastrar Pet</Link>
            </div>
            <div className={styles.petlist_container}>
                {pets.length > 0 &&
                    pets.map((pet) => (
                        <div className={styles.petlist_row} key={pet._id}>
                            <RoundedImage
                                src={`${process.env.REACT_APP_API}/images/pets/${pet.images[0]}`}
                                alt={pet.name}
                                width="px75"
                            />
                            <span className='bold'>{pet.name}</span>
                            <div className={styles.actions} >
                                {pet.available ? (
                                    <>
                                        {pet.adopter && <button className={styles.conclude_btn} onClick={() => {
                                            concludeAdoption(pet._id)
                                        }} >Concluir ado????o</button>}
                                        <Link to={`/pet/edit/${pet._id}`}>Editar</Link>
                                        <button onClick={() => {
                                            removePet(pet._id)
                                        }} >Excluir</button>
                                    </>

                                ) :
                                    (
                                        <p>Pet j?? adotado</p>
                                    )}
                            </div>
                        </div>
                    ))
                }
                {pets.length === 0 && <p> N??o h?? Pets cadastrados</p>}


            </div>
        </section>
    )

}

export default MyPets;