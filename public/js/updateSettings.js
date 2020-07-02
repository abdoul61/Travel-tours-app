/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// TYPE IS EITHER 'PASSWORD' OR 'DATA' 
export const updatSettings = async (data , type) =>{
    try{
        const url =
        type === 'password'
          ? 'http://127.0.0.1:3000/api/v1/users/updateMypassword'
          :'http://127.0.0.1:3000/api/v1/users/updateMe'  ;  
          
         const res = await axios({
             method: 'PATCH',
             url,
             data
        });
         if(res.data.status === 'success'){
             showAlert('success',`${type.toUpperCase()} updated successfully!`)
         }
    } catch(err){
        showAlert('error',err.response.data.message);
    }
};