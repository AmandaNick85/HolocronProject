import axios from 'axios';

const baseURL =
  process.env.EXPO_PUBLIC_DATABANK_URL ?? 'https://starwars-databank-server.onrender.com/api/v1';

export const starWarsApi = axios.create({
  baseURL,
  timeout: 20000,
});

export const swapi = axios.create({
  baseURL: 'https://swapi.py4e.com/api',
  timeout: 12000,
});
