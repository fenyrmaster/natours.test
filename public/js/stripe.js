import { showAlert } from "./alerts";
import axios from "axios";

export const bookTours = async tourId => {
    const stripe = Stripe("pk_test_51IdPJkJuRD4PH3yd7CQiXyEUG0uy0eK4okaVji28WW4Zrp5WnQA0wla1Xaor6qBDRsSmqM2EQivOYtfPi5lynRke00WIC91pZX");

    try{
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch(err) {
        console.log(err)
        showAlert("error", err)
    }
}