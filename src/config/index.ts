import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
  cloudinary: {
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  },
  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    access_token_expires: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refresh_token_expires: process.env.JWT_REFRESH_TOKEN_EXPIRES,
    forgot_password_token_secret: process.env.FORGOT_PASS_TOKEN_SECRET,
    forgot_password_token_expires: process.env.FORGOT_PASS_TOKEN_EXPIRES,
  },
  open_router_api_key: process.env.OPEN_ROUTER_API_KEY,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  client_url: process.env.CLIENT_URL,
  web_hook_secret: process.env.WEBHOOK_SECRET,
};
