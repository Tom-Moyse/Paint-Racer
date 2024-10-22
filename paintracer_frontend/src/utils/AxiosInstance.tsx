import axios from 'axios';

const axInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/"
})

export default axInstance