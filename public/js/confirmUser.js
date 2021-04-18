import axios from "axios";
import { showAlert } from "./alerts";

export const confirmUser = async string => {
    try{
        const res = await axios({
            method: "PATCH",
            url: `/api/v1/users/confirm/${string}`
        })

        if(res.data.status === "success"){
            showAlert("success", "Well done, you confirmed your identity")
            window.setTimeout(() => {
                location.assign("/")
            }, 3500)
        }
    } catch(err){
        showAlert("error", "Couldnt log out, try again")
    }
}