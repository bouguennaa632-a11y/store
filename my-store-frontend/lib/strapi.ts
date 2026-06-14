import axios from 'axios';

const strapi = axios.create({
  baseURL: 'http://localhost:1337/api',
});

export default strapi;