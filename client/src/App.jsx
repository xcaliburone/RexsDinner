import viteLogo from '/vite.svg'
import './App.css'
import { useState } from 'react'

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:3032/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            window.location.href = '/dashboard';
        } else {
            setMessage(data.message);
        }
    }

    return (
        <>
            <img src={viteLogo} className="logo" alt="Rex Logo" />
            <form onSubmit={handleLogin}>
                <h1>Admin Login</h1>
                <label htmlFor="email">Email</label>
                <input type="text" id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor="password">Password</label>
                <input type="text" id='password' value={password} onChange={(e) => setPassword(e.target.value)} />

                <button type='submit'>login</button>
                {message && <p>{message}</p>}
            </form>
        </>
    )
}

export default App
