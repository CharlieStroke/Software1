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
    username: Yup.string().required('Usuario requerido'),
    password: Yup.string().required('Contraseña requerida')
});

const onSubmit = async (data, { setSubmitting }) => {
    try {
        if (data.username === 'admin' && data.password === 'admin') {
            navigate('/dashboard');
        } else {
            alert('Usuario o Contraseña Invalida');
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
                {({ isSubmitting }) => (
                    <Form className="login-form">
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">Usuario</label>
                            <Field type="text" id="username" name="username" className="form-input" />
                            <ErrorMessage name="username" component="div" className="form-error" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <Field type="password" id="password" name="password" className="form-input" />
                            <ErrorMessage name="password" component="div" className="form-error" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="login-button">
                            Iniciar Sesión
                        </button>
                    </Form>
                )}

            </Formik>
        </div>
    </div>
)
};
export default LoginPage;