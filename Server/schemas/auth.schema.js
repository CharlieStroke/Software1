import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'El email es requerido'
    })
    .email({
      message: 'Email inválido'
    }),
  
  password: z
    .string({
      required_error: 'La contraseña es requerida'
    })
    .min(4, {
      message: 'La contraseña debe tener al menos 4 caracteres'
    })
});

export const registerSchema = z.object({
  nombre: z
    .string({
      required_error: 'El nombre es requerido'
    })
    .min(3, {
      message: 'El nombre debe tener al menos 3 caracteres'
    }),
  
  telefono: z
    .string({
      required_error: 'El teléfono es requerido'
    })
    .min(10, {
      message: 'El teléfono debe tener al menos 10 caracteres'
    })
    .max(20, {
      message: 'El teléfono no puede tener más de 20 caracteres'
    }),
  
  email: z
    .string({
      required_error: 'El email es requerido'
    })
    .email({
      message: 'Email inválido'
    }),
  
  password: z
    .string({
      required_error: 'La contraseña es requerida'
    })
    .min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres'
    }),
  
  rol: z
    .enum(['admin', 'mesero', 'cocinero', 'dueño'], {
      required_error: 'El rol es requerido',
      invalid_type_error: 'Rol inválido'
    })
});
