import { showAlert } from "./alerts";
import axios from "axios";

export const updateTourInfo = async data => {
    try{
        const url = "http://127.0.0.1:3000/api/v1/tours/5c88fa8cf4afda39709c296c";
        const res = await axios({
            method: "PATCH",
            url,
            data
        });

        if(res.data.status === "success"){
            showAlert("success", `Well done, you updated the tour`)
            window.setTimeout(() => {
                location.assign("/me/manageTours")
            }, 1500)
        }

    } catch(err){
        showAlert("error", err.response.data.message)
    }
}