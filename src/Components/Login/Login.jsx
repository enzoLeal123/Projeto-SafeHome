import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Modal from '../Modal/Modal';
import { loginUser, registerUser, getUserProfile } from '../Services/Api';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [modalErro, setModalErro] = useState({ open: false, msg: '' });
  const [modalSucesso, setModalSucesso] = useState(false);

  const mostrarErro = (msg) => setModalErro({ open: false, msg: '' }, setTimeout(() => setModalErro({ open: true, msg }), 0));

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!isLogin) {
      if (!email || !senha || !nome) {
        setModalErro({ open: true, msg: 'Por favor, preencha todos os campos obrigatórios.' });
        return;
      }
      try {
        const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;
        await registerUser({ email, password: senha, name: nomeCompleto });
        setModalSucesso(true);
        setIsLogin(true);
        setSenha(''); setNome(''); setSobrenome('');
      } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        if (status === 409) {
          setModalErro({ open: true, msg: 'Este e-mail já está cadastrado. Tente fazer login.' });
        } else if (status === 400 && data?.details?.body?.length > 0) {
          setModalErro({ open: true, msg: data.details.body[0] });
        } else if (data?.error) {
          setModalErro({ open: true, msg: data.error });
        } else {
          setModalErro({ open: true, msg: 'Erro ao criar conta. Tente novamente.' });
        }
      }
      return;
    }

    if (!email || !senha) {
      setModalErro({ open: true, msg: 'Preencha e-mail e senha.' });
      return;
    }
    try {
      const dadosLogin = await loginUser({ email, password: senha });
      if (dadosLogin && dadosLogin.token) {
        const dadosPerfil = await getUserProfile();
        const idEncontrado = dadosPerfil.id_usuario || dadosPerfil.id;
        if (idEncontrado) {
          localStorage.setItem('usuario_id', idEncontrado);
          navigate('/home');
        } else {
          setModalErro({ open: true, msg: 'Não foi possível recuperar seu ID de usuário.' });
        }
      }
    } catch (error) {
      setModalErro({ open: true, msg: 'E-mail ou senha incorretos!' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-area">
          <div className="logo-circle"><span>💙</span></div>
          <h1>SafeHome</h1>
          <p>Seu aplicativo de saúde mental</p>
        </div>

        <div className="tabs">
          <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)} type="button">ENTRAR</button>
          <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)} type="button">CRIAR CONTA</button>
        </div>

        <form onSubmit={handleLogin}>
          {!isLogin && (
            <>
              <div className="input-group">
                <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Sobrenome (opcional)" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
              </div>
            </>
          )}
          <div className="input-group">
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          <button type="submit" className="btn-entrar">{isLogin ? 'ENTRAR' : 'CRIAR CONTA'}</button>
        </form>
      </div>

      {/* ── Modais ── */}
      <Modal
        isOpen={modalErro.open}
        onClose={() => setModalErro({ open: false, msg: '' })}
        title="Atenção"
        footer={
          <button className="modal-btn-confirmar" onClick={() => setModalErro({ open: false, msg: '' })}>Entendi</button>
        }
      >
        <p>{modalErro.msg}</p>
      </Modal>

      <Modal
        isOpen={modalSucesso}
        onClose={() => setModalSucesso(false)}
        title="Conta criada! 🎉"
        footer={
          <button className="modal-btn-confirmar" onClick={() => setModalSucesso(false)}>Fazer login</button>
        }
      >
        <p>Sua conta foi criada com sucesso! Faça login para acessar o SafeHome.</p>
      </Modal>
    </div>
  );
};

export default Login;
