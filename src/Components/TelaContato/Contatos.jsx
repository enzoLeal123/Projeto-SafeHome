import React, { useState, useEffect } from "react";
import "./Contatos.css";

const Contatos = () => {
  const [listaContatos, setListaContatos] = useState(() => {
    const contatosSalvos = localStorage.getItem("contatos");

    if (contatosSalvos) {
      return JSON.parse(contatosSalvos);
    }

    return [
      {
        id: "ficticio-1",
        nome: "Natália",
        telefone: "(32) 98888-8888",
        parentesco: "Tia",
      },
      {
        id: "ficticio-2",
        nome: "João",
        telefone: "(32) 97777-7777",
        parentesco: "Primo",
      },
    ];
  });

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // Salva automaticamente no navegador
  useEffect(() => {
    localStorage.setItem("contatos", JSON.stringify(listaContatos));
  }, [listaContatos]);

  const handleAdicionarContato = (e) => {
    e.preventDefault();
    setMensagemErro("");

    if (!nome || !telefone) {
      setMensagemErro(
        "Por favor, preencha pelo menos o Nome e o Telefone."
      );
      return;
    }

    const novoContato = {
      id: Date.now(),
      nome,
      telefone,
      parentesco,
    };

    setListaContatos((contatosAtuais) => [
      ...contatosAtuais,
      novoContato,
    ]);

    setNome("");
    setTelefone("");
    setParentesco("");
  };

  return (
    <div className="contatos-container">
      <div className="contatos-card">
        <h2 className="contatos-titulo">Contatos de Apoio</h2>
        <p className="contatos-subtitulo">
          Cadastre pessoas de confiança para emergências
        </p>

        {mensagemErro && (
          <div className="contatos-erro">{mensagemErro}</div>
        )}

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

            <button type="submit" className="contatos-botao">
              Adicionar
            </button>
          </div>
        </form>

        <hr className="contatos-linha-divisoria" />

        <div className="contatos-lista-container">
          {listaContatos.length === 0 ? (
            <p className="contatos-texto-vazio">
              Nenhum contato cadastrado ainda.
            </p>
          ) : (
            <ul className="contatos-lista">
              {listaContatos.map((contato) => (
                <li key={contato.id} className="contatos-item-lista">
                  <div className="contatos-info-principal">
                    <strong className="contatos-nome-contato">
                      {contato.nome}
                    </strong>

                    {contato.parentesco && (
                      <span className="contatos-badge">
                        {contato.parentesco}
                      </span>
                    )}
                  </div>

                  <span className="contatos-telefone-contato">
                    {contato.telefone}
                  </span>
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