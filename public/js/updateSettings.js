import { showAlert } from "./alerts";
import axios from "axios";

export const updateUserData = async (data,type) => {
    try{
        const url = type === "password" ? "http://127.0.0.1:3000/api/v1/users/updatePassword" : "http://127.0.0.1:3000/api/v1/users/updateData" 
        const res = await axios({
            method: "PATCH",
            url,
            data
        });

        if(res.data.status === "success"){
            showAlert("success", `Well done, you updated your ${type}`)
            window.setTimeout(() => {
                location.assign("/me/settings")
            }, 1500)
        }

    } catch(err){
        showAlert("error", err.response.data.message)
    }
}