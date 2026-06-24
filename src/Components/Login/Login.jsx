import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser, registerUser, getUserProfile } from "../Services/Api";

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
      if (!email || !senha || !nome) {
        setMensagemErro("Por favor, preencha todos os campos.");
        return;
      }
      try {
        // Back-end espera: email, password, name
        // sobrenome não existe no schema — concatenamos no name
        const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;
        await registerUser({ email, password: senha, name: nomeCompleto });
        alert("Conta criada com sucesso! Faça login para acessar o SafeHome.");
        setIsLogin(true);
        setSenha("");
        setNome("");
        setSobrenome("");
      } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 409) {
          setMensagemErro("Este e-mail já está cadastrado. Tente fazer login.");
        } else if (status === 400 && data?.details?.body?.length > 0) {
          // Zod retorna a mensagem específica em details.body[0]
          setMensagemErro(data.details.body[0]);
        } else if (data?.error) {
          setMensagemErro(data.error);
        } else {
          setMensagemErro("Erro ao criar conta. Tente novamente.");
        }
      }
      return;
    }

    // Login
    if (!email || !senha) {
      setMensagemErro("Preencha e-mail e senha.");
      return;
    }
    try {
      const dadosLogin = await loginUser({ email, password: senha });
      if (dadosLogin && dadosLogin.token) {
        const dadosPerfil = await getUserProfile();
        const idEncontrado = dadosPerfil.id_usuario || dadosPerfil.id;
        if (idEncontrado) {
          localStorage.setItem("usuario_id", idEncontrado);
          navigate("/home");
        } else {
          console.error("Perfil recebido:", dadosPerfil);
          setMensagemErro(
            "Erro: não foi possível recuperar seu ID de usuário.",
          );
        }
      }
    } catch (error) {
      setMensagemErro("E-mail ou senha incorretos!");
    }
  };

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
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setMensagemErro("");
            }}
            type="button"
          >
            ENTRAR
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setMensagemErro("");
            }}
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
                  placeholder="Sobrenome (opcional)"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
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
              placeholder="Senha (mínimo 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-entrar">
            {isLogin ? "ENTRAR" : "CRIAR CONTA"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
