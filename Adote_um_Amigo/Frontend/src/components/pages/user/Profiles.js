import formStyles from '../../form/Form.module.css';
import styles from './Profile.module.css';
import Input from '../../form/Input';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import useFlashMessage from '../../../hooks/useFlashMessage';
import RoundedImage from '../../layout/RoundedImage';

function Profile() {
    const [user, setUser] = useState({});
    const [token] = useState(localStorage.getItem('token') || '');
    const { setFlashMessage } = useFlashMessage();
    const [preview, setPreview] = useState({});

    useEffect(() => {

        api.get('/users/checkuser', {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            setUser(response.data)
        })

    }, [token])


    function onFileChange(e) {
        setPreview(e.target.files[0]);
        setUser({ ...user, [e.target.name]: e.target.files[0] });
    }
    function handleChange(e) {
        setUser({ ...user, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        let msgType = 'success';

        const formData = new FormData();

        Object.keys(user).forEach((key) =>
            formData.append(key, user[key])
        )

        const data = await api.patch(`/users/edit/${user._id}`, formData, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            return response.data
        }).catch((err) => {
            msgType = 'error'
            return err.response.data
        })
        setFlashMessage(data.message, msgType);
    }

    return (
        <section>
            <div className={styles.profile_header}>
                <h1>Profile</h1>
                {(user.image || preview.length > 0) && (
                    <RoundedImage

                        //     // src={preview
                        //     //     //? URL.createObjectURL(preview)
                        //     //     //: `${process.env.REACT_APP_API}/images/users/${user.image}`
                        //     // }
                        //     // alt={`Foto de ${user.name}`}

                        src={preview ? `${process.env.REACT_APP_API}/images/users/${user.image}` : URL.createObjectURL(preview)}
                        alt={`Foto de ${user.name}`}









                    />

                )}
            </div>
            <form onSubmit={handleSubmit} className={formStyles.form_container}>
                <Input
                    text="imagem"
                    type="file"
                    name="image"
                    handleOnChange={onFileChange}
                />
                <Input
                    text="E-mail"
                    type="email"
                    name="email"
                    placeholder="Digite o seu e-mail"
                    handleOnChange={handleChange}
                    value={user.email || ''}
                />
                <Input
                    text="Nome"
                    type="text"
                    name="name"
                    placeholder="Digite o seu nome"
                    handleOnChange={handleChange}
                    value={user.name || ''}
                />
                <Input
                    text="Telefone"
                    type="text"
                    name="phone"
                    placeholder="Digite o seu telefone"
                    handleOnChange={handleChange}
                    value={user.phone || ''}
                />
                <Input
                    text="Senha"
                    type="password"
                    name="password"
                    placeholder="Digite a sua senha"
                    handleOnChange={handleChange}
                    value={user.password || ''}
                />
                <Input
                    text="Confirme a senha"
                    type="password"
                    name="confirmepassword"
                    placeholder="Confirme a sua senha"
                    handleOnChange={handleChange}
                    value={user.confirmepassword || ''}
                />

                <Input
                    type='submit'
                    value='Editar'
                />


            </form>
        </section>
    )

}

export default Profile;