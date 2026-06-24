import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { loginUser, registerUser, saveFcmToken, setApiToken } from "../Services/Api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setMensagemErro("");

    if (!isLogin) {
      if (!email || !senha || !nome || !sobrenome) {
        setMensagemErro("Por favor, preencha todos os campos.");
        return;
      }

      try {
        await registerUser({ email, senha, nome, sobrenome });
        alert("Conta criada com sucesso! Faça Login para acessar o SafeHome");
        setIsLogin(true);
        setSenha("");
        setNome("");
        setSobrenome("");
      } catch (error) {
        setMensagemErro(error.message || "Erro ao criar conta. Verifique os dados.");
      }
      return;
    }

    if (isLogin) {
      if (!email || !senha) {
        setMensagemErro("Preencha e-mail e senha.");
        return;
      }

      try {
        const dadosLogin = await loginUser({ email, password: senha });
        
      
        if (dadosLogin && dadosLogin.token) {
          
          
          setApiToken(dadosLogin.token);
          

          if (dadosLogin.user && dadosLogin.user.id) {
            localStorage.setItem('usuario_id', dadosLogin.user.id);
          }

        
          const tokenNavegadorMock = "fcm_web_" + Math.random().toString(36).substring(2, 15);
          saveFcmToken(tokenNavegadorMock).catch(e => console.warn("FCM ignorado no protótipo:", e.message));

          navigate('/home');
        } else {
          setMensagemErro("Erro inesperado: O servidor não retornou o token de acesso.");
        }
      } catch (error) {
        setMensagemErro(error.message || "E-mail ou senha incorretos!");
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