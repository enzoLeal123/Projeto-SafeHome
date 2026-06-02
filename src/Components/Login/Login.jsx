import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setMensagemErro("");

  
    if (!isLogin) {
      if (!email || !senha || !nome || !sobrenome) {
        setMensagemErro("Por favor, preencha todos os campos.");
        return;
      }

      
      localStorage.setItem('usuario_email', email);
      localStorage.setItem('usuario_senha', senha);
      localStorage.setItem('usuario_nome', nome);
      localStorage.setItem('usuario_sobrenome', sobrenome);

      alert("Conta criada com sucesso! Faça Login para acessar o SafeHome");
      
      setIsLogin(true);
      setSenha("");
      setNome("");
      setSobrenome("");
      return;
    }

  
    if (isLogin) {

      const emailSalvo = localStorage.getItem('usuario_email');
      const senhaSalva = localStorage.getItem('usuario_senha');

   
      if (email === emailSalvo && senha === senhaSalva) {

        navigate('/home');
      } else {
        setMensagemErro("E-mail ou senha incorretos!");
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo-area">
          <div className="logo-circle">
            <span>💙</span> 
          </div>
          <h1>SafeHome</h1>
          <p>Seu aplicativo de saúde mental</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setMensagemErro(""); }}
            type="button"
          >
            ENTRAR
          </button>

          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setMensagemErro(""); }}
            type="button"
          >
            CRIAR CONTA
          </button>
        </div>

        {mensagemErro && <div className="erro-mensagem">{mensagemErro}</div>}

        <form onSubmit={handleLogin}>
          
        
          {!isLogin && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Sobrenome"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-entrar">
            {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;