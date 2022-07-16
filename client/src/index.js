import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes,
  Route } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Safe from './views/Safe'
import Safes from './views/Safes'
import Landing from './views/Landing'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}/>
        <Route path="safes" element={<Safes />}>
          <Route path=":safeAddress" element={<Safe />} />
        </Route>
        <Route path="/home" element={<Landing />}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
