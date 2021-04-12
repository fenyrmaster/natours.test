import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
    try{
        const res = await axios({
            method: "POST",
            url: "http://127.0.0.1:3000/api/v1/users/login",
            data: {
                email,
                password
            }
        });

        if(res.data.status === "success"){
            showAlert("success", "Well done, you are logged in")
            window.setTimeout(() => {
                location.assign("/")
            }, 1500)
        }

    } catch(err){
        showAlert("error", err.response.data.message)
    }
}

export const signup = async (name, email, password, confirmPassword) => {
    try{
        const res = await axios({
            method: "POST",
            url: "http://127.0.0.1:3000/api/v1/users/signup",
            data: {
                name,
                email,
                password,
                confirmPassword
            }
        });

        if(res.data.status === "success"){
            showAlert("success", "Well done, you are registered, check your email to complete the registration")
            window.setTimeout(() => {
                location.assign("/")
            }, 3500)
        }

    } catch(err){
        showAlert("error", err.response.data.message)
    }
}

export const logout = async () => {
    try{
        const res = await axios({
            method: "GET",
            url: "http://127.0.0.1:3000/api/v1/users/logout"
        })

        if(res.data.status === "success"){
            showAlert("success", "Well done, you are logged out")
            window.setTimeout(() => {
                location.assign("/")
            }, 1500)
        }
    } catch(err){
        showAlert("error", "Couldnt log out, try again")
    }
}