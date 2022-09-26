import { Request, Response } from 'express';
import { LoginAuthentication, CreateUserModel, CreateAttendModel, AllAttendsModel, SetScoreModel, AllMedicamentsModel, createPrescription, checkMedicine } from '../models/User';
import _, {indexBy} from 'underscore';

export const login = async (req: Request, res: Response) => {
    let id:string = req.body.id;
    let passwd:string = req.body.passwd;
    
    let user: any = await LoginAuthentication(id, passwd);

    // console.log(user.result);

    if (user.type === "gestor"){
        res.render('pages/gestor', {
            user
        });
    } else if (user.type === "medico") {
        let pattientList = await AllAttendsModel("medico");
        let medicamentsList = await AllMedicamentsModel();
        // console.log(pattientList);
        // console.log(medicamentsList);

        res.render('pages/medico', {
            user,
            pattientList,
            medicamentsList
        });
    }else if (user.type === "enfermeiro") {
        
        let pattientList = await AllAttendsModel("enfermeiro");
        
        res.render('pages/enfermeiro', {
            user,
            pattientList
        });
    }else if (user.type === "farmaceutico") {

        let pattientList = await AllAttendsModel("farmaceutico");

        //console.log(user);

        res.render('pages/farmaceutico', {
            user,
            pattientList
        });

    }else if (user.type === "recepcionista") {
        res.render('pages/recepcionista', {
            user
        });
    } else {
        res.render('pages/app', {
            id,
            passwd
        });
    }    
};

export const createUser = async (req: Request, res: Response) => {
    
    const employee: any = {
        cpf: req.body.id,
        nome: req.body.nome,
        sobrenome: req.body.sobrenome,
        sexo: req.body.sexo,
        numero_telefone: req.body.numero_telefone,
        data_nascimento: req.body.data_nascimento,
        password: req.body.password,
        cargo: req.body.cargo,
    }

    if (employee.cargo == 'medico'){
        employee.especialidade = 'Clinico Geral';
    }

    // console.log(employee)

    await CreateUserModel(employee);

    res.status(204).send();

}


export const createAtendimento = async (req: Request, res: Response) => {
    
    const patient:any = {cpf_paciente: req.body.cpf_paciente};
    
    const date = new Date();
    patient.date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; 
    patient.cpf_recepcionista = req.body.cpf_recepcionista;

    // console.log(patient);
    
    //CRIAR MODEL CREATEATENDIMENTO
    await CreateAttendModel(patient);
    
    
    res.status(204).send();
}

export const addScore = async (req: Request, res: Response) => {
    
    let atendimento = {
        score: req.query.score,
        cpf_enfermeiro: req.query.cpf_enfermeiro,
        id_atendimento: req.query.id_atendimento
    }

    // console.log(atendimento);

    await SetScoreModel(atendimento);


    res.status(204).send();

}

export const addAtendimentoMedico = async (req: Request, res: Response) => {
    
    let atendimento = {
        cpf_medico: req.params.cpf_medico,
        id_atendimento: req.params.id_atendimento
    }


    await SetScoreModel(atendimento);


    res.status(204).send();

}

export const prescritionController = async (req: Request, res: Response) => {
    
    let data = {
        medicamento: req.query.medicamento,
        id_atendimento: req.query.id_atendimento,
        qtdPrescrita: req.query.qtdPrescrita 
    }
    await createPrescription(data);


    res.status(204).send();

}

export const changeStatusPrescription = async (req: Request, res: Response) => {
    
    let data = {
        id_atendimento: req.query.id_atendimento,
        id_medicamento: req.query.id_medicamento, 
        cpf_farmaceutico: req.query.cpf_farmaceutico 
    }

    // console.log(data);

    await checkMedicine(data);


    res.status(204).send();

}

