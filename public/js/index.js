import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login } from "./login";
import { logout } from "./login";
import { updateUserData } from "./updateSettings";
import { showAlert } from "./alerts";
import { createReview } from "./createReview";
import { updateTourInfo } from "./handleToursView";
import { confirmUser } from "./confirmUser";
import { bookTours } from "./stripe";
import { signup } from "./login";

const mapBox = document.getElementById("map");
const logoutB = document.querySelector(".nav__el--logout");

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}



const form = document.querySelector(".form--login");
const formUp = document.querySelector(".form-user-data");
const formPass = document.querySelector(".form-user-settings");
const formRe = document.querySelector(".form-user-review");
const formUpIMG = document.getElementById("uploadPics");
const confirm = document.getElementById("confirm");
const bookTour = document.getElementById("book-tour");
const signForm = document.getElementById("signup")

if(signForm){
    signForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("password2").value;
        signup(name,email,password,confirmPassword);
    })
}

if(form){
    form.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email,password);
    })
}   



if(formUp) {
    formUp.addEventListener("submit", e=> {
        e.preventDefault();
        const form = new FormData();
        form.append("name", document.getElementById("name").value);
        form.append("email", document.getElementById("email").value);
        form.append("photo", document.getElementById("photo").files[0]);
        updateUserData(form, "data")
    })
}

if(formPass){
    formPass.addEventListener("submit", async e => {
        e.preventDefault();
        const password = document.getElementById("password-current").value;
        const newPassword = document.getElementById("password").value;
        const newPasswordConfirm = document.getElementById("password-confirm").value;
        await updateUserData({password,newPassword,newPasswordConfirm}, "password");
    })
}

if(formRe){
    formRe.addEventListener("submit", async e => {
        e.preventDefault();
        const review = document.getElementById("review").value;
        const rating = document.getElementById("rating").value;
        const select = document.getElementById("tour");
        const tourID = select.options[select.selectedIndex].id;
        if(tourID === "bad"){
            return showAlert("error", "You have to select a tour")
        }
        await createReview(review,rating,tourID);
    })
}

if(logoutB){
    logoutB.addEventListener("click", () => {
        logout();
    })
}

if(formUpIMG){
    formUpIMG.addEventListener("click", async e => {
        e.preventDefault();
        const form = new FormData();
        const image1 = document.getElementById("image1").files[0];
        const image2 = document.getElementById("image2").files[0];
        const image3 = document.getElementById("image3").files[0];
        const imageCover = document.getElementById("imageCover").files[0];
        form.append("imageCover", imageCover);
        form.append("images", image1);
        form.append("images", image2);
        form.append("images", image3);
        updateTourInfo(form)
    })
}

if(confirm){
    const lastPart = window.location.href.split("/").pop();
    confirmUser(lastPart);
}

if(bookTour){
    bookTour.addEventListener("click", e => {
        bookTour.textContent = "Processing..."
        const tourId = bookTour.dataset.tour;
        bookTours(tourId);
    })
}