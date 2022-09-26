import { sequelize } from '../instances/mysql'


export const LoginAuthentication = async (id: string, passwd:string ) => {
    
    //verificando se está na tabela de gestores
    {
        const [results, metadata] = await sequelize.query(
        `select *
        from gestor
        where cpf_gestor = ${id} and password = ${passwd};`
        );
        
        if (results.length > 0){
            return {result: results[0], type: "gestor"};
        }
    }

    //verificando se está na tabela de enfermeiro
    {
        const [results, metadata] = await sequelize.query(
        `select *
        from enfermeiro
        where cpf_enfermeiro = ${id} and password = ${passwd};`
        );
        
        if (results.length > 0){
            return {result: results[0], type: "enfermeiro"};
        }
    }

    //verificando se está na tabela de farmaceutico
    {
        const [results, metadata] = await sequelize.query(
        `select *
        from farmaceutico
        where cpf_farmaceutico = ${id} and password = ${passwd};`
        );
        
        if (results.length > 0){
            return {result: results[0], type: "farmaceutico"};
        }
    }

    //verificando se está na tabela medico
    {
        const [results, metadata] = await sequelize.query(
        `select *
        from medico
        where cpf_medico = ${id} and password = ${passwd};`
        );
        
        if (results.length > 0){
            return {result: results[0], type: "medico"};
        }
    }

    //verificando se está na tabela recepcionista
    {
        const [results, metadata] = await sequelize.query(
        `select *
        from recepcionista
        where cpf_recepcionista = ${id} and password = ${passwd};`
        );
        
        if (results.length > 0){
            return {result: results[0], type: "recepcionista"};
        }
    }

    return null;
} 

export const CreateUserModel = async (employee: any) => {
    try {
        
        if (employee.especialidade){
            await sequelize.query(
                `INSERT INTO ${employee.cargo}  
                (cpf_${employee.cargo}, nome, sobrenome, sexo, numero_telefone, data_nascimento, especialidade, password)
                VALUES
                ('${employee.cpf}', '${employee.nome}', '${employee.sobrenome}', '${employee.sexo}', 
                '${employee.numero_telefone}', '${employee.data_nascimento}', '${employee.especialidade}', '${employee.password}')
                ;
                `
            );
        }else if (employee.cargo === 'paciente'){
            await sequelize.query(
                `INSERT INTO ${employee.cargo}  
                    (cpf_${employee.cargo}, nome, sobrenome, sexo, numero_telefone, data_nascimento)
                    VALUES
                    ('${employee.cpf}', '${employee.nome}', '${employee.sobrenome}', '${employee.sexo}', 
                    '${employee.numero_telefone}', '${employee.data_nascimento}');
                `
            );
        }else {
            await sequelize.query(
                `INSERT INTO ${employee.cargo}  
                (cpf_${employee.cargo}, nome, sobrenome, sexo, numero_telefone, data_nascimento, password)
                VALUES
                ('${employee.cpf}', '${employee.nome}', '${employee.sobrenome}', '${employee.sexo}', 
                '${employee.numero_telefone}', '${employee.data_nascimento}', '${employee.password}')
                ;
                `
            );
        }
    }catch(error){
        console.log("NAO CONSEGUIU ADD NO BANCO!!!", error);
    }
}

//Cria a primeira etapa do atendimento
export const CreateAttendModel = async (patient: any) => {
    try {
        await sequelize.query(
            `INSERT INTO atendimento 
            (data, cpf_recepcionista, cpf_paciente)
            VALUES
            ('${patient.date}', '${patient.cpf_recepcionista}', '${patient.cpf_paciente}');
            `
        );
    }catch(Error) {
        console.log("Problem with attend creation!!");
    }
}

//Retorna os atendimentos
export const AllAttendsModel = async (flag: string) => {
    if (flag === "enfermeiro"){
        const [results, metadata] = await sequelize.query(
            "SELECT id_atendimento, p.nome, p.sobrenome FROM atendimento a, paciente p where cpf_enfermeiro is NULL and a.cpf_paciente = p.cpf_paciente ;"
        );

        return results;
    }

    if (flag === "medico"){
        const [results, metadata] = await sequelize.query(
            "SELECT id_atendimento, p.nome, p.sobrenome, score_triagem  FROM atendimento a, paciente p where cpf_medico is NULL and a.cpf_paciente = p.cpf_paciente and score_triagem is not NULL;"
        );

        return results;
    }
    
    if (flag === "farmaceutico"){
        const [results, metadata] = await sequelize.query(
            `
            SELECT a.id_atendimento, p2.nome, p2.sobrenome, m.nome as mnome, cp.qtd, m.id_medicamento    
            FROM prescricao p, controle_prescricao cp, medicamento m, atendimento a, paciente p2 
            where status is NULL
            and p.id_atendimento = cp.prescricao_id_atendimento 
            and m.id_medicamento = medicamento_id_medicamento
            and a.id_atendimento = p.id_atendimento 
            and p2.cpf_paciente  = a.cpf_paciente 
            ;
            `
        );

        return results;
    }

    return;
} 

//Retorna os atendimentos
export const AllMedicamentsModel = async () => {
    
    const [results, metadata] = await sequelize.query(
        "SELECT * FROM medicamento;"
    );

    return results;
} 



export const SetScoreModel = async (atendimento: any) => {

    try{
        if (atendimento.cpf_enfermeiro){
            await sequelize.query(
                `UPDATE atendimento 
                set score_triagem = ${parseInt(atendimento.score)}, cpf_enfermeiro='${atendimento.cpf_enfermeiro}'
                where id_atendimento = ${atendimento.id_atendimento};
                `
            );
        }

        if (atendimento.cpf_medico){
            await sequelize.query(
                `UPDATE atendimento 
                set cpf_medico = '${atendimento.cpf_medico}'
                where id_atendimento = ${atendimento.id_atendimento};
                `
            );
        }

    }catch(Error){
        console.log("Não foi possivel atualizar o atendimento", Error);
    }

} 

export const createPrescription = async (data: any) => {
    

    try {
        
        //>>> VERIFICANDO SE JÁ EXISTE UMA PRESCRIÇÃO
        const [results, metadata] = await sequelize.query(
            `select *
            from prescricao
            where id_atendimento = ${parseInt(data.id_atendimento)};`
        );
        
        //>>> CRIANDO PRESCRIÇÃO CASO NÃO EXISTA
        if (results.length == 0){
             await sequelize.query(
                `INSERT INTO prescricao (id_atendimento)
                VALUES ( ${parseInt(data.id_atendimento)});
                `
            );  
        } 

        // >>> ADICIONANDO MEDICAMENTO NA PRESCRIÇÃO
        await sequelize.query(
            `INSERT INTO controle_prescricao (prescricao_id_atendimento, medicamento_id_medicamento, qtd)
            VALUES ( ${parseInt(data.id_atendimento)}, ${parseInt(data.medicamento)}, ${parseInt(data.qtdPrescrita)} );
            `
        );

    }catch(Error){
        console.log("Não foi possivel criar a prescrição", Error);
    }

    // >>> DANDO BAIXA DO ESTOQUE DE MEDICAMENTOS
    baixaEstoque(parseInt(data.medicamento), parseInt(data.qtdPrescrita));
}

async function baixaEstoque(idMedicamento: any, quantidade: any){
    
    try {
        await sequelize.query(
            `UPDATE medicamento
                SET qtd = qtd - ${quantidade}
                WHERE id_medicamento = ${idMedicamento};
            `
        );
    }catch(Error){
        console.log("Não foi possivel atualizar o estoque", Error);
    }
} 

export const checkMedicine = async (data: any) => {
    const [results, metadata]:any = await sequelize.query(
        `select *
        from prescricao
        where id_atendimento = ${parseInt(data.id_atendimento)};`
    );

    if (results[0].cpf_farmaceutico = 'null'){
       try{
           await sequelize.query(
               `update prescricao
               SET cpf_farmaceutico = ${data.cpf_farmaceutico}
               where id_atendimento = ${data.id_atendimento}
               ;
               `
           );
       }catch(Error){
           console.log("Não conseguiu atualizar o farmaceutico", Error);
       }
    }

    try {
        await sequelize.query(
            `update controle_prescricao
            SET status = 1
            where prescricao_id_atendimento = ${data.id_atendimento}
            and medicamento_id_medicamento = ${data.id_medicamento}
            ;
            `
        );
    }catch(Error){
           console.log("Não conseguiu mudar status do controle de medicamentos", Error);
    }

    

} 