let IS_PROD = process.env.NODE_ENV === 'production';
const server = IS_PROD ?
    process.env.REACT_APP_BACKEND_URL || "https://your-render-backend-url.onrender.com" :
    "http://localhost:8002"

export default server;