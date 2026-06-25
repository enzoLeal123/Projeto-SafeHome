import React, { useState, useEffect } from 'react';
import './Contatos.css';
import Modal from '../Modal/Modal';
import { getContacts, createContact, deleteContact } from '../Services/Api';

const Contatos = () => {
  const [listaContatos, setListaContatos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [modalErro, setModalErro] = useState({ open: false, msg: '' });
  const [modalExcluir, setModalExcluir] = useState({ open: false, contato: null });
  const [excluindo, setExcluindo] = useState(false);

  const carregarContatos = async () => {
    setCarregando(true);
    try {
      // getContacts() sem parâmetro — igual ao seu Api.js
      const dados = await getContacts();
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
      const idLogado = localStorage.getItem('usuario_id');
      await createContact({ nome, telefone, parentesco, id_usuario: Number(idLogado) });
      setNome(''); setTelefone(''); setParentesco('');
      carregarContatos();
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao salvar contato. Tente novamente.';
      setModalErro({ open: true, msg });
    }
  };

  const pedirConfirmacaoExclusao = (contato) => {
    setModalExcluir({ open: true, contato });
  };

  const confirmarExclusao = async () => {
    setExcluindo(true);
    try {
      await deleteContact(modalExcluir.contato.id);
      setModalExcluir({ open: false, contato: null });
      carregarContatos();
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao excluir contato. Tente novamente.';
      setModalExcluir({ open: false, contato: null });
      setModalErro({ open: true, msg });
    } finally {
      setExcluindo(false);
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
                  <div className="contatos-lado-direito">
                    <span className="contatos-telefone-contato">{contato.telefone}</span>
                    <button
                      className="contatos-btn-excluir"
                      type="button"
                      title="Remover contato"
                      onClick={() => pedirConfirmacaoExclusao(contato)}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal: confirmação de exclusão */}
      <Modal
        isOpen={modalExcluir.open}
        onClose={() => setModalExcluir({ open: false, contato: null })}
        title="Remover contato"
        footer={
          <>
            <button className="modal-btn-cancelar" onClick={() => setModalExcluir({ open: false, contato: null })}>
              Cancelar
            </button>
            <button className="modal-btn-perigo" onClick={confirmarExclusao} disabled={excluindo}>
              {excluindo ? 'Removendo...' : 'Remover'}
            </button>
          </>
        }
      >
        <p>
          Tem certeza que deseja remover <strong>{modalExcluir.contato?.nome}</strong> da sua rede de apoio?
          Esta ação não pode ser desfeita.
        </p>
      </Modal>

      {/* Modal: erro */}
      <Modal
        isOpen={modalErro.open}
        onClose={() => setModalErro({ open: false, msg: '' })}
        title="Atenção"
        footer={
          <button className="modal-btn-confirmar" onClick={() => setModalErro({ open: false, msg: '' })}>
            Entendi
          </button>
        }
      >
        <p>{modalErro.msg}</p>
      </Modal>
    </div>
  );
};

export default Contatos;
