import axios from "axios";
import { showAlert } from "./alerts";

export const createReview = async (review, rating, ID) => {
    try{
        const res = await axios({
            method: "POST",
            url: `/api/v1/tours/${ID}/reviews`,
            data: {
                review,
                rating
            }
        });

        if(res.data.status === "success"){
            showAlert("success", "Well done, your review is posted")
            window.setTimeout(() => {
                location.assign("/me/reviews")
            }, 1500)
        }

    } catch(err){
        showAlert("error", err.response.data.message)
    }
}