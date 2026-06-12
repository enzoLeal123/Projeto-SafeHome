import React, { useState, useEffect } from 'react';
import './Contatos.css'; 

const Contatos = () => {
  const [listaContatos, setListaContatos] = useState([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    const buscarContatos = async () => {
      try {

        setListaContatos([
          { id: 2, nome: 'Natália', telefone: '(32) 98888-8888', parentesco: 'Tia' },
          { id: 3, nome: 'João', telefone: '(32) 97777-7777', parentesco: 'Primo' }
        ]);
      } catch (error) {
        console.error("Erro ao conectar com a API:", error);
        setMensagemErro("Não foi possível carregar os contatos.");
      }
    };

    buscarContatos();
  }, []);

  const handleAdicionarContato = async (e) => {
    e.preventDefault();
    setMensagemErro('');

    if (!nome || !telefone) {
      setMensagemErro("Por favor, preencha pelo menos o Nome e o Telefone.");
      return;
    }

    const novoContato = { nome, telefone, parentesco };

    try {
      
      const response = await fetch('http://localhost:3000/api/contatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoContato)
      });
      const contatoSalvoDoBanco = await response.json();
      setListaContatos([...listaContatos, contatoSalvoDoBanco]);
      

      const contatoSimulado = { ...novoContato, id: Date.now() };
      setListaContatos([...listaContatos, contatoSimulado]);

      setNome('');
      setTelefone('');
      setParentesco('');
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
      setMensagemErro("Erro ao salvar o contato no banco de dados.");
    }
  };

  return (
    <div className="contatos-container">
      <div className="contatos-card">
        <h2 className="contatos-titulo">Contatos de Apoio</h2>
        <p className="contatos-subtitulo">Cadastre pessoas de confiança para emergências</p>

        {mensagemErro && <div className="contatos-erro">{mensagemErro}</div>}

        <form onSubmit={handleAdicionarContato} className="contatos-form">
          <div className="contatos-input-group">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="contatos-input"
            />
            <input
              type="text"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="contatos-input"
            />
            <input
              type="text"
              placeholder="Parentesco"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              className="contatos-input"
            />
            <button type="submit" className="contatos-botao">Adicionar</button>
          </div>
        </form>

        <hr className="contatos-linha-divisoria" />

        <div className="contatos-lista-container">
          {listaContatos.length === 0 ? (
            <p className="contatos-texto-vazio">Nenhum contato cadastrado ainda.</p>
          ) : (
            <ul className="contatos-lista">
              {listaContatos.map((contato) => (
                <li key={contato.id} className="contatos-item-lista">
                  <div className="contatos-info-principal">
                    <strong className="contatos-nome-contato">{contato.nome}</strong>
                    {contato.parentesco && (
                      <span className="contatos-badge">{contato.parentesco}</span>
                    )}
                  </div>
                  <span className="contatos-telefone-contato">{contato.telefone}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contatos;