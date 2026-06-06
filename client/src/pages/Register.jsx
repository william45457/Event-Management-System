import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="glass-panel p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">Create Account</h1>
                    <p className="text-gray-500 mt-2">Join EMS today</p>
                </div>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Full Name" className="input-field" onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email address" className="input-field" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
                    <select name="role" className="input-field" onChange={handleChange}>
                        <option value="User">Attendee (User)</option>
                        <option value="Organizer">Event Organizer</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button type="submit" className="btn-primary w-full py-3 mt-4">Sign Up</button>
                </form>
                <p className="text-center mt-6 text-gray-500">
                    Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
