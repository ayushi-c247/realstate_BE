import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';

const indexRoute = express.Router();

indexRoute.use('/auth', authRoute);
indexRoute.use('/user', userRoute);

export default indexRoute;
