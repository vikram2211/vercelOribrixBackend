import express from 'express';
import { getUnits } from './unit.controller.js';
const router = express.Router();
router.get('/', getUnits);
export default router;