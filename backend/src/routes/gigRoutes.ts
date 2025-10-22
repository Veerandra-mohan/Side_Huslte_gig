
import { Router } from 'express';
import { createGig, getGigs } from '../controllers/gigController';
import auth from '../middleware/auth';

const router = Router();

router.post('/', auth, createGig);
router.get('/', getGigs);

export default router;
