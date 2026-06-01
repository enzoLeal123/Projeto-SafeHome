import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  
  const handleLogin = async (event) => {
    event.preventDefault();
    setMensagemErro("");

    try {
      const endpoint = isLogin ? '/v1/auth/login' : '/v1/auth/register';
      const resposta = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, senha: senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        if (isLogin) {
          console.log("Login feito com sucesso!", dados);
          localStorage.setItem('token_safehome', dados.token);
          alert("Bem vindo ao SafeHome!");
          
        } else {
          alert("Conta criada com sucesso! Faça Login para acessar o SafeHome");
          setIsLogin(true);
          setSenha("");
        }
      } else {
        setMensagemErro(dados.message || "Ocorreu um erro, tente novamente");
      }

    } catch (erro) {
      console.error("Erro na requisição:", erro);
      setMensagemErro("Erro ao conectar com o servidor");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="logo-area">
          <div className="logo-circle">
            <span>🤍</span>
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