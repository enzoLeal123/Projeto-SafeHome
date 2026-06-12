import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Contatos from './Components/TelaContato/Contatos';
import Login from './Components/Login/Login';
import TelaPrincipal from './Components/TelaPrincipal/TelaPrincipal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<TelaPrincipal />} />
        <Route path="/contatos" element={<Contatos />} />
      </Routes>
    </Router>
  );
}

export default App;