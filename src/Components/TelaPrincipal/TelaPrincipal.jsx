import React, { useState } from 'react';
import './TelaPrincipal.css';
import SinaisVitais from '../SinaisVitais/SinaisVitais.jsx';
import Contatos from '../TelaContato/Contatos';

const TelaPrincipal = () => {

  const [tela, setTela] = useState('inicio');
  const [isHistorico, setIsHistorico] = useState(false);

  const gerarDiasDoCalendario = (modoHistorico) => {
    const dias = [];
    const inicio = modoHistorico ? -5 : 0;
    const fim = modoHistorico ? 0 : 5;

    for (let i = inicio; i < fim; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      const numeroDia = String(data.getDate()).padStart(2, '0');
      dias.push(numeroDia);
    }
    return dias;
  };

  const meusDias = gerarDiasDoCalendario(isHistorico);
  const [diaAtivo, setDiaAtivo] = useState(gerarDiasDoCalendario(false)[0]); 
  
  const [novoTexto, setNovoTexto] = useState('');       
  const [listaTarefas, setListaTarefas] = useState([]); 

  const nomeSalvo = localStorage.getItem('usuario_nome') || 'Usuário';
  const sobrenomeSalvo = localStorage.getItem('usuario_sobrenome') || '';

  const alternarModoAgenda = () => {
    const novoModo = !isHistorico;
    setIsHistorico(novoModo);
    setDiaAtivo(gerarDiasDoCalendario(novoModo)[0]);
  };

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
              
              <button 
                onClick={alternarModoAgenda}
                className={`btn-historico ${isHistorico ? 'ativo' : ''}`}
              >
                {isHistorico ? '📅 Voltar para Hoje' : '🕒 Ver Histórico'}
              </button>
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
              <h3>{isHistorico ? `Histórico do Dia ${diaAtivo}` : `Agenda do Dia ${diaAtivo}`}</h3>
              <hr />
              
              {!isHistorico ? (
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
              ) : (
                <p className="msg-modo-leitura">
                  Modo leitura: Não é possível adicionar novas tarefas em dias passados.
                </p>
              )}

              <div className="lista-itens-agenda">
                {listaTarefas.map((tarefa, index) => {
                  if (tarefa.dia === diaAtivo) {
                    return (
                      <div key={index} className="item-agenda">
                        <div className="item-conteudo">
                          <input type="checkbox" defaultChecked={isHistorico} disabled={isHistorico} />
                          <span className={`tarefa-texto ${isHistorico ? 'historico' : ''}`}>
                            {tarefa.texto}
                          </span>
                          <span className="tag-dia">Dia {tarefa.dia}</span>
                        </div>
                        
                        {!isHistorico && (
                          <button 
                            className="btn-deletar" 
                            type="button" 
                            onClick={() => removerTarefa(index)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
                
                {listaTarefas.filter(t => t.dia === diaAtivo).length === 0 && (
                  <p className="msg-lista-vazia">
                    Nenhum registro encontrado para este dia.
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

        {tela === 'sinais' && (
          <SinaisVitais />
        )}

        {tela === 'contatos' && (
          <Contatos />
        )}

      </div>
    </div>
  );
}

export default TelaPrincipal;