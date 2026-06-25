import React, { useState, useEffect } from 'react';
import './Contatos.css';
import Modal from '../Modal/Modal';
import { getContacts, createContact } from '../Services/Api';

const Contatos = () => {
  const [listaContatos, setListaContatos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [modalErro, setModalErro] = useState({ open: false, msg: '' });

    const carregarContatos = async () => {
    setCarregando(true);
    try {
      const idLogado = localStorage.getItem('usuario_id'); // Pega o seu ID
      const dados = await getContacts(idLogado); // Envia para a API
      setListaContatos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarContatos();
  }, []);

  const handleAdicionarContato = async (e) => {
    e.preventDefault();
    if (!nome || !telefone) {
      setModalErro({ open: true, msg: 'Por favor, preencha pelo menos o Nome e o Telefone.' });
      return;
    }
 try {
      const idLogado = localStorage.getItem('usuario_id'); // Pega o seu ID
      
      // Envia o id_usuario junto no pacote
      await createContact({ 
        nome, 
        telefone, 
        parentesco, 
        id_usuario: Number(idLogado) 
      });
      
      setNome(''); setTelefone(''); setParentesco('');
      carregarContatos();
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao salvar contato. Tente novamente.';
      setModalErro({ open: true, msg });
    }
  };

  return (
    <div className="contatos-container">
      <div className="contatos-card">
        <h2 className="contatos-titulo">Contatos de Apoio</h2>
        <p className="contatos-subtitulo">Cadastre pessoas de confiança para emergências</p>

        <form onSubmit={handleAdicionarContato} className="contatos-form">
          <div className="contatos-input-group">
            <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="contatos-input" />
            <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="contatos-input" />
            <input type="text" placeholder="Parentesco" value={parentesco} onChange={(e) => setParentesco(e.target.value)} className="contatos-input" />
            <button type="submit" className="contatos-botao">Adicionar</button>
          </div>
        </form>

        <hr className="contatos-linha-divisoria" />

        <div className="contatos-lista-container">
          {carregando ? (
            <p className="contatos-texto-vazio">Carregando...</p>
          ) : listaContatos.length === 0 ? (
            <p className="contatos-texto-vazio">Nenhum contato cadastrado ainda.</p>
          ) : (
            <ul className="contatos-lista">
              {listaContatos.map((contato) => (
                <li key={contato.id} className="contatos-item-lista">
                  <div className="contatos-info-principal">
                    <strong className="contatos-nome-contato">{contato.nome}</strong>
                    {contato.parentesco && <span className="contatos-badge">{contato.parentesco}</span>}
                  </div>
                  <span className="contatos-telefone-contato">{contato.telefone}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalErro.open}
        onClose={() => setModalErro({ open: false, msg: '' })}
        title="Atenção"
        footer={<button className="modal-btn-confirmar" onClick={() => setModalErro({ open: false, msg: '' })}>Entendi</button>}
      >
        <p>{modalErro.msg}</p>
      </Modal>
    </div>
  );
};

export default Contatos;
