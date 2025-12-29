import express from 'express';
import adminRoutes from './v1';

const indexRoute = express.Router();

indexRoute.use('/v1/api', adminRoutes);

export default indexRoute;
