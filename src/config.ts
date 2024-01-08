import * as dotenv from 'dotenv';

dotenv.config();
if (process.env.NODE_ENV === 'development') {
    dotenv.config({path: '.env.development'});
} else {
    dotenv.config({path: '.env.production'});
}
export default {
    port: parseInt(process.env.PORT || '4000', 10),
    mongoUr: process.env.MONGO_URL || '',
}