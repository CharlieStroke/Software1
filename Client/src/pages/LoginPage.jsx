import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import '../pagesCss/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
const initialValues = {
    username: '',
    password: ''
}
const validationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Usuario requerido')
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(20, 'El usuario no puede exceder 20 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
    password: Yup.string()
        .required('Contraseña requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(50, 'La contraseña no puede exceder 50 caracteres')
});

const onSubmit = async (data, { setSubmitting }) => {
    try {
        // Definir credenciales por rol
        const usuarios = {
            'mesero': { password: 'mesero123', rol: 'mesero' },
            'dueño': { password: 'dueño123', rol: 'dueño' },
            'admin': { password: 'admin123', rol: 'admin' }
        };

        const usuario = usuarios[data.username];
        
        if (usuario && data.password === usuario.password) {
            // Guardamos el usuario en localStorage para usar en el Dashboard
            localStorage.setItem('userRole', usuario.rol);
            navigate('/dashboard');
        } else {
            alert('Usuario o Contraseña Inválida');
        }
    } catch (error) {
        console.error('Error de inicio de sesión:', error);
    }
};

return (
    <div className="login-container">
        <div className="login-form-wrapper">
            <h1 className="main-title">Carrizos Bar</h1>
            <h1 className="login-title">Iniciar Sesión</h1>
            <Formik initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}>
                {({ isSubmitting, errors, touched }) => (
                    <Form className="login-form">
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Usuario</label>
                            <Field 
                                type="text" 
                                id="username" 
                                name="username" 
                                className={`form-input ${errors.username && touched.username ? 'error' : ''}`}
                                placeholder="Ingrese su usuario"
                            />
                            <ErrorMessage name="username" component="div" className="form-error" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <Field 
                                type="password" 
                                id="password" 
                                name="password" 
                                className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                                placeholder="Ingrese su contraseña"
                            />
                            <ErrorMessage name="password" component="div" className="form-error" />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || (Object.keys(errors).length > 0 && Object.keys(touched).length > 0)} 
                            className="login-button"
                        >
                            {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </Form>
                )}

            </Formik>
        </div>
    </div>
)
};
export default LoginPage;