import React, { useState } from 'react';
import './TelaPrincipal.css';

const TelaPrincipal = () => {
 
  const [tela, setTela] = useState('inicio');

  const nomeSalvo = localStorage.getItem('usuario_nome') || 'Usuário';
  const sobrenomeSalvo = localStorage.getItem('usuario_sobrenome') || '';


  const deslogar = () => {

    window.location.href = '/';
  };

  return (
    <div className="pagina-principal">
      
   
      <div className="menu-topo">
        <div className="titulo-logo">💙 MindCare</div>
        
        <div className="botoes-menu">
          <button 
            className={tela === 'inicio' ? 'active' : ''} 
            onClick={() => setTela('inicio')}
          >
            Início
          </button>
          <button 
            className={tela === 'sinais' ? 'active' : ''} 
            onClick={() => setTela('sinais')}
          >
            Sinais Vitais
          </button>
          <button 
            className={tela === 'contatos' ? 'active' : ''} 
            onClick={() => setTela('contatos')}
          >
            Contatos
          </button>
        </div>

        <button className="btn-sair" onClick={deslogar}>Sair</button>
      </div>

      <div className="conteudo-principal">

       
        {tela === 'inicio' && (
          <div>
            <div className="cabecalho-boas-vindas">
            
              <h2>Bom dia, {nomeSalvo} {sobrenomeSalvo}</h2>
            </div>

            
            <div className="caixa-agenda">
              <h3>Agenda de Hoje</h3>
              <hr />
              <div className="item-agenda">
                <input type="checkbox" defaultChecked /> Tomar medicação (08:00)
              </div>
              <div className="item-agenda">
                <input type="checkbox" /> Sessão de terapia (14:00)
              </div>
              <div className="item-agenda">
                <input type="checkbox" /> Exercício de respiração (18:00)
              </div>
              <div className="item-agenda">
                <input type="checkbox" /> Diário de humor (21:00)
              </div>
            </div>
          </div>
          
        )}


        {tela === 'sinais' && (
          <div className="tela-vazia">
            <h2>Sinais Vitais</h2>
            <p> em desenvolvimento </p>
          </div>
        )}


        {tela === 'contatos' && (
          <div className="tela-vazia">
            <h2>Contatos de Apoio</h2>
            <p> em desenvolvimento </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default TelaPrincipal;