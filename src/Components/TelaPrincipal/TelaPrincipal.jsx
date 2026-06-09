import React, { useState } from 'react';
import './TelaPrincipal.css';
import SinaisVitais from '../SinaisVitais/SinaisVitais.jsx';

const TelaPrincipal = () => {

  const [tela, setTela] = useState('inicio');
  const gerarDiasDoCalendario = () => {
    
    const dias = [];
    for (let i = 0; i < 5; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      
      const numeroDia = String(data.getDate()).padStart(2, '0');
      dias.push(numeroDia);
    }
    return dias;
  };

  const meusDias = gerarDiasDoCalendario();
  const [diaAtivo, setDiaAtivo] = useState(meusDias[0]); 
  const [novoTexto, setNovoTexto] = useState('');       
  const [listaTarefas, setListaTarefas] = useState([]); 

  const nomeSalvo = localStorage.getItem('usuario_nome') || 'Usuário';
  const sobrenomeSalvo = localStorage.getItem('usuario_sobrenome') || '';

  const adicionarNovaTarefa = (evento) => {
    evento.preventDefault(); 

    const tarefa = {
      texto: novoTexto,
      dia: diaAtivo
    };

    setListaTarefas([...listaTarefas, tarefa]);
    setNovoTexto('');
  };

  const removerTarefa = (posicaoParaRemover) => {
    const listaAtualizada = listaTarefas.filter((_, index) => index !== posicaoParaRemover);
    setListaTarefas(listaAtualizada);
  };

  const dispararEmergencia = () => {
    alert(" ALERTA DE EMERGÊNCIA ACIONADO\n\n1. Notificação enviada para seus contatos de confiança cadastrados.\n2. Abrindo o discador para ligar para a Emergência 192/193");
    window.location.href = 'tel:192';
  };

  const deslogar = () => {
    window.location.href = '/';
  };

  return (
    <div className="pagina-principal">
      
      <div className="menu-topo">
        <div className="titulo-logo">💙 MindCare</div>
        
        <div className="botoes-menu">
          <button className={tela === 'inicio' ? 'active' : ''} onClick={() => setTela('inicio')}>Início</button>
          <button className={tela === 'sinais' ? 'active' : ''} onClick={() => setTela('sinais')}>Sinais Vitais</button>
          <button className={tela === 'contatos' ? 'active' : ''} onClick={() => setTela('contatos')}>Contatos</button>
          <button className="btn-emergencia" onClick={dispararEmergencia}>Emergência</button>
        </div>

        <button className="btn-sair" onClick={deslogar}>Sair</button>
      </div>

      <div className="conteudo-principal">

        {tela === 'inicio' && (
          <div>
            <div className="cabecalho-boas-vindas">
              <h2>Bem-vindo, {nomeSalvo} {sobrenomeSalvo}</h2>
            </div>

            <div className="abas-semana">
              {meusDias.map((dia) => (
                <button 
                  key={dia}
                  className={diaAtivo === dia ? 'aba-ativa' : ''} 
                  onClick={() => setDiaAtivo(dia)}
                >
                  Dia {dia}
                </button>
              ))}
            </div>

            <div className="caixa-agenda">
              <h3>Agenda do Dia {diaAtivo}</h3>
              <hr />
              
              <form onSubmit={adicionarNovaTarefa} className="form-adicionar">
                <input 
                  type="text" 
                  placeholder="Ex: Tomar medicação (08:00)" 
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  required
                />
                <button type="submit">Adicionar</button>
              </form>

              <div className="lista-itens-agenda">
                {listaTarefas.map((tarefa, index) => {
                  if (tarefa.dia === diaAtivo) {
                    return (
                      <div key={index} className="item-agenda">
                        <div className="item-conteudo">
                          <input type="checkbox" />
                          <span>{tarefa.texto}</span>
                          <span className="tag-dia">Dia {tarefa.dia}</span>
                        </div>
                        
                        <button 
                          className="btn-deletar" 
                          type="button" 
                          onClick={() => removerTarefa(index)}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

            </div>
          </div>
        )}

        {tela === 'sinais' && (
  <SinaisVitais />
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