import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import '../pagesCss/LoginPage.css';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

const initialValues = {
    email: '',
    password: ''
}

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Email requerido')
        .email('Email inválido'),
    password: Yup.string()
        .required('Contraseña requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(50, 'La contraseña no puede exceder 50 caracteres')
});

const onSubmit = async (data, { setSubmitting }) => {
    setSubmitting(true);
    try {
        const result = await login({ email: data.email, password: data.password });
        if (result.success) {
            navigate('/dashboard');
        } else {
            const message = result.error?.message || 'Usuario o contraseña inválida';
            alert(message);
        }
    } catch (error) {
        console.error('Error de inicio de sesión:', error);
        alert('Error al iniciar sesión');
    } finally {
        setSubmitting(false);
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
                            <label htmlFor="email" className="form-label">Email</label>
                            <Field 
                                type="email" 
                                id="email" 
                                name="email" 
                                className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                                placeholder="Ingrese su email"
                            />
                            <ErrorMessage name="email" component="div" className="form-error" />
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