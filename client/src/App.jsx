import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import './Mobile.css'
import Dashboard from '/src/Dashboard';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(`Email: ${email}, Password: ${password}`);
        const response = await fetch('http://localhost:3032/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) { const employeeId = data.employeeId; navigate(`/dashboard/${employeeId}`);
        } else { alert(data.message); }
    }
    
    return (
        <>
            <img src={viteLogo} className="logo" alt="Rex Logo" />
            <form className='loginForm' onSubmit={handleLogin}>
                <h1>Admin Login</h1>
                <label htmlFor="email">Email</label>
                <input type="text" id='email' value={email} onChange={(e) => setEmail(e.target.value)} autoComplete='email' />
                <label htmlFor="password">Password</label>
                <input type="password" id='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='password' />
                <button type='submit'>login</button>
            </form>
        </>
    )
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard/:employeeId" element={<Dashboard />} />
            </Routes>
        </Router>
    )
}

export default App
