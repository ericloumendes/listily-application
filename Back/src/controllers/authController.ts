import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // store in .env in production

export const authController = {
    login: async (req: Request, res: Response) => {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user by email
            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValid = await bcrypt.compare(senha, usuario.senha);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT
            const token = jwt.sign(
                { pk: usuario.pk, email: usuario.email, nome: usuario.nome },
                JWT_SECRET,
                { expiresIn: '1h' } // token valid for 1 hour
            );

            return res.status(200).json({ token });
        } catch (error: any) {
            return res.status(500).json({ error: 'Login failed', detalhes: error.message });
        }
    }
};
