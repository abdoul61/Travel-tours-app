/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51GxPPoBgNRnAnFPl2f5BPxOlSyIppK0RHe71jIrm2hBbYVHsTYeNqeJyLiHepxN6Lhrw8UgHOZL4Vqxv3ShHoRt4009fvmJKr5'
);

export const bookTour = async tourId => {
    try{
  //1 get chechouk session from the API
  const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
  console.log(session);
   // 2 ) Create checkout form + charte  credit card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
    }catch(err){
        console.log(err);
        showAlert('error',err);

    }
  
}