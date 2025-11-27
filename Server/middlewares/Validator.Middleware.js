export const validateSchema = (schema) => (req, res, next) => {
  try {
    console.log('❌ Validando datos recibidos:', JSON.stringify(req.body, null, 2));
    schema.parse(req.body);
    console.log('✅ Validación exitosa');
    next();
  } catch (error) {
    // Verificar si es un error de Zod
    if (error.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      console.error('Error de validación Zod:', errors);
      
      return res.status(400).json({ 
        message: 'Error en la validación de datos',
        errors 
      });
    }
    
    // Error genérico
    console.error('Error en validación:', error);
    return res.status(400).json({ 
      message: 'Error en la validación de datos',
      error: error.message || 'Error desconocido'
    });
  }
};
