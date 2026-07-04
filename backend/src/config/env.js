import dotenv from "dotenv";

dotenv.config();

export const config = {
    db_host: process.env.DB_HOST,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_name: process.env.DB_NAME,
    jwt_secret: process.env.JWT_SECRET,
    aws_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    aws_region: process.env.AWS_REGION,
    s3_bucket_name: process.env.AWS_S3_BUCKET_NAME
};