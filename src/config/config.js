const DEV_API_URL = __DEV__ 
  ? Platform.select({
      android: 'http://192.168.1.10:5000/api', // Ganti dengan IP komputer Anda
      ios: 'http://localhost:5000/api',
    })
  : 'https://api-production.example.com'; // URL production

export default {
  API_URL: DEV_API_URL,
};