/* eslint-disable */
import '@babel/polyfill';
import {
    displayMap
} from './mapbox';
import {
    login,
    logout
} from './login';

import { updatSettings } from './updateSettings';
import {bookTour} from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// VALUES 


//DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updatSettings(form, 'data');
    })

}


if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {

        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...'
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updatSettings({ passwordCurrent, password, passwordConfirm }, 'password');

        // AFTER UPDATING SETTINGS CLEAR FIELDS
        document.querySelector('.btn--save-password').textContent = 'Save Password'
        passwordCurrent = document.getElementById('password-current').value = '';
        password = document.getElementById('password').value = '';
        passwordConfirm = document.getElementById('password-confirm').value = '';
    });
};
if(bookBtn)
    bookBtn.addEventListener('click', e =>{
        e.target.textContent = 'Processing...'
        const {tourId} = e.target.dataset;
        bookTour(tourId)
    })