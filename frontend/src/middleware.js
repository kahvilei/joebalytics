import axios from 'axios';

 const userAuthenticated = async () => {
    let res = await axios.get("http://localhost:8082/api/user/isLoggedIn", {
         headers: {
             "x-access-token": localStorage.getItem("token"),
         },
     });
    return res.data.isLoggedIn;
}
    
export default userAuthenticated;