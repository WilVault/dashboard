import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const apiUrl = import.meta.env.VITE_API_URL;
  const appName = import.meta.env.VITE_APP_NAME;

  useEffect(() => {
    if (count === 5 && apiUrl) {
      const login = async () => {
        try {
          const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "test@email.com",
              password: "secret123",
            }),
          });

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const data = await response.json();
          console.log("Login success:", data);
          // data usually contains access_token, user info, etc.
        } catch (error) {
          console.error((error as Error).message);
        }
      };

      login();
    }
  }, [count]);

  console.log("API:", apiUrl);           // "http://localhost:3000/api"
  console.log("App name:", appName);     // "My Awesome App"
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>TEST 123</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
