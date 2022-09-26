import { Request, Response } from 'express';


export const home = async (req: Request, res: Response)=>{

    res.render('pages/home', {
        name: 'Bonieky',
        lastName: 'Lacerda',
    });

};

