import { Router } from 'express';
import { signup, login } from './auth.controller.js';
import { validateSignup, validateLogin } from '../../middleware/validate.middleware.js';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

export const authRouter = router;