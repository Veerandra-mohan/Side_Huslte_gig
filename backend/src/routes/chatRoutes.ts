
import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/chatController';
import auth from '../middleware/auth';

const router = Router();

router.get('/:gigId/:receiverId', auth, getMessages);
router.post('/', auth, sendMessage);

export default router;
