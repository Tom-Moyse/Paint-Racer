import React, { useState } from "react";
import axInstance from "../../utils/AxiosInstance";
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted: ', formData);
        if (formData.password != formData.confirmPassword){
            setErrorMsg('Passwords must match');
            return;
        }

        const axPost = async () => {
            try{
                const resp = await axInstance.post("users/register/", formData);
                
                if (resp.status === 201){
                    navigate('/login');
                }
            }
            catch (err){
                if (err instanceof AxiosError && err.response?.data){
                    const errMessages: string[] = [];
                    for (const [_, message] of Object.entries(err.response.data)) {
                        if (Array.isArray(message)) {
                          // Concatenate all messages for the specific field
                          errMessages.push(message[0]);
                        }
                    }
                    // Currently doesn't place on newlines
                    setErrorMsg(errMessages.join('\n'));
                    return;
                }

                console.error(err);
            }
        }
        axPost();
    }

    return ( 
        <>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="usernameInput">Username: </label>
                    <input id="usernameInput" name="username" onChange={handleChange}></input>
                </div>
                <div>
                    <label htmlFor="emailInput">Email: </label>
                    <input id="emailInput" name="email" onChange={handleChange}></input>
                </div>
                <div>
                    <label htmlFor="passwordInput">Password: </label>
                    <input id="passwordInput" name="password" type="password" onChange={handleChange}></input>
                </div>
                <div>
                    <label htmlFor="confirmPasswordInput">Confirm Password: </label>
                    <input id="confirmPasswordInput" name="confirmPassword" type="password" onChange={handleChange}></input>
                </div>
                <input type="submit" value="Submit" />
            </form>
            <div>{errorMsg}</div>
        </>
    );
}

export default RegisterPage;