import { Router } from 'express';

import * as HomeController from '../controllers/homeController';
import * as UserController from '../controllers/userController';

const router = Router();

router.get('/', HomeController.home);

router.post('/login', UserController.login);
router.post('/cadastro', UserController.createUser);
router.post('/addatendimento', UserController.createAtendimento);

router.get('/addscore', UserController.addScore);
router.get('/atender/:id_atendimento/:cpf_medico', UserController.addAtendimentoMedico);
router.get('/medicar', UserController.changeStatusPrescription);

router.get('/prescrition', UserController.prescritionController);



export default router;