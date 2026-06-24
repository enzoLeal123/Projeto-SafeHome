import React, { useState, useEffect } from 'react';
import './TelaPrincipal.css';
import SinaisVitais from '../SinaisVitais/SinaisVitais.jsx';
import Contatos from '../TelaContato/Contatos';
import {
  getUserProfile,
  getAgendaOcorrenciasPorData,
  createAgendaTemplate,
  updateAgendaOccurrenceStatus,
  deleteAgendaTemplate,
} from '../Services/Api';
import API from '../Services/Api';

const TelaPrincipal = () => {
  const [tela, setTela] = useState('inicio');
  const [isHistorico, setIsHistorico] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
  const [sobrenomeUsuario, setSobrenomeUsuario] = useState('');
  const [listaTarefas, setListaTarefas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [novoTexto, setNovoTexto] = useState('');
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [textoEditando, setTextoEditando] = useState('');

  const idUsuario = localStorage.getItem('usuario_id');

  // ── Gera dias da semana ──────────────────────────────────────
  const gerarDiasDoCalendario = (modoHistorico) => {
    const dias = [];
    const inicio = modoHistorico ? -5 : 0;
    const fim = modoHistorico ? 0 : 5;
    for (let i = inicio; i < fim; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      dias.push(String(data.getDate()).padStart(2, '0'));
    }
    return dias;
  };

  const meusDias = gerarDiasDoCalendario(isHistorico);
  const [diaAtivo, setDiaAtivo] = useState(gerarDiasDoCalendario(false)[0]);

  // Converte "24" (dia) para "2026-06-24" (YYYY-MM-DD) com offset do modo
  const diaParaDataCompleta = (dia, modoHistorico) => {
    const hoje = new Date();
    const inicio = modoHistorico ? -5 : 0;
    const fim = modoHistorico ? 0 : 5;
    for (let i = inicio; i < fim; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() + i);
      if (String(data.getDate()).padStart(2, '0') === dia) {
        return data.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    }
    // fallback: monta com o mês/ano atual
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}-${dia}`;
  };

  // ── Carrega ocorrências do dia ativo ─────────────────────────
  const carregarAgendaDoBanco = async (dia = diaAtivo, modoHistorico = isHistorico) => {
    if (!idUsuario) return;
    setCarregando(true);
    try {
      const dataCompleta = diaParaDataCompleta(dia, modoHistorico);

      const [ocorrencias, templates] = await Promise.all([
        getAgendaOcorrenciasPorData(idUsuario, dataCompleta),
        API.get(`/agenda/template/paciente/${idUsuario}`).then(r => r.data),
      ]);

      const mapaTemplates = {};
      if (Array.isArray(templates)) {
        templates.forEach(t => { mapaTemplates[t.id_evento] = t; });
      }

      const tarefasNormalizadas = (Array.isArray(ocorrencias) ? ocorrencias : []).map(oc => {
        const template = mapaTemplates[oc.id_evento] || {};
        const dataOc = new Date(oc.data_ocorrencia);
        const diaDaOc = String(dataOc.getUTCDate()).padStart(2, '0');
        return {
          id: oc.id_ocorrencia,
          id_evento: oc.id_evento,
          texto: template.titulo || `Evento #${oc.id_evento}`,
          tipo: template.tipo || 'GERAL',
          dia: diaDaOc,
          status: oc.status_concluido ? 'CONCLUIDA' : 'PENDENTE',
        };
      });

      setListaTarefas(tarefasNormalizadas);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setCarregando(false);
    }
  };

  // ── Carrega perfil e agenda ao montar ────────────────────────
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const dadosPerfil = await getUserProfile();
        setNomeUsuario(dadosPerfil.nome);
        setSobrenomeUsuario(dadosPerfil.sobrenome || '');
      } catch (error) {
        if (error.response?.status === 401) window.location.href = '/';
      }
    };
    carregarPerfil();
    carregarAgendaDoBanco(diaAtivo, isHistorico);
  }, []);

  // ── Recarrega quando muda o dia ativo ────────────────────────
  const mudarDiaAtivo = (dia) => {
    setDiaAtivo(dia);
    setEditandoIndex(null);
    carregarAgendaDoBanco(dia, isHistorico);
  };

  const alternarModoAgenda = () => {
    const novoModo = !isHistorico;
    const novosDias = gerarDiasDoCalendario(novoModo);
    const novoDia = novosDias[0];
    setIsHistorico(novoModo);
    setDiaAtivo(novoDia);
    carregarAgendaDoBanco(novoDia, novoModo);
  };

  // ── Adicionar tarefa ─────────────────────────────────────────
  const adicionarNovaTarefa = async (evento) => {
    evento.preventDefault();
    try {
      const dataCompleta = diaParaDataCompleta(diaAtivo, isHistorico);
      await createAgendaTemplate({
        id_paciente: Number(idUsuario),
        titulo: novoTexto,
        tipo: 'GERAL',
        data_hora: '08:00',
        data_inicio: dataCompleta,
        data_fim: dataCompleta, // mesmo dia = só 1 ocorrência
        descricao: null,
      });
      setNovoTexto('');
      carregarAgendaDoBanco(diaAtivo, isHistorico);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error.response?.data);
      alert('Erro ao salvar. Verifique o console (F12).');
    }
  };

  // ── Excluir tarefa (deleta o template = deleta as ocorrências) ──
  const removerTarefa = async (idEvento, idx) => {
    if (!window.confirm('Deseja excluir esta tarefa?')) return;
    try {
      await deleteAgendaTemplate(idEvento);
      carregarAgendaDoBanco(diaAtivo, isHistorico);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error.response?.data);
      alert('Erro ao excluir. Verifique o console (F12).');
    }
  };

  // ── Alternar status ───────────────────────────────────────────
  const alternarStatusTarefa = async (idOcorrencia, statusAtual) => {
    if (!idOcorrencia) return;
    try {
      await updateAgendaOccurrenceStatus(idOcorrencia, statusAtual);
      carregarAgendaDoBanco(diaAtivo, isHistorico);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // ── Edição local ──────────────────────────────────────────────
  const iniciarEdicao = (idx, textoAtual) => {
    setEditandoIndex(idx);
    setTextoEditando(textoAtual);
  };

  const salvarEdicao = (idx) => {
    if (!textoEditando.trim()) return;
    setListaTarefas(listaTarefas.map((t, i) =>
      i === idx ? { ...t, texto: textoEditando.trim() } : t
    ));
    setEditandoIndex(null);
    setTextoEditando('');
  };

  const cancelarEdicao = () => {
    setEditandoIndex(null);
    setTextoEditando('');
  };

  // ── Outros ───────────────────────────────────────────────────
  const dispararEmergencia = () => {
    alert('ALERTA DE EMERGÊNCIA ACIONADO\n\n1. Notificação enviada para seus contatos de confiança cadastrados.\n2. Abrindo o discador para ligar para a Emergência 192/193');
    window.location.href = 'tel:192';
  };

  const deslogar = () => {
    localStorage.removeItem('safehome_token');
    localStorage.removeItem('usuario_id');
    window.location.href = '/';
  };

  // ── Render ────────────────────────────────────────────────────
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
              <h2>Bem-vindo, {nomeUsuario} {sobrenomeUsuario}</h2>
              <button onClick={alternarModoAgenda} className={`btn-historico ${isHistorico ? 'ativo' : ''}`}>
                {isHistorico ? '📅 Voltar para Hoje' : '🕒 Ver Histórico'}
              </button>
            </div>

            <div className="abas-semana">
              {meusDias.map((dia) => (
                <button key={dia} className={diaAtivo === dia ? 'aba-ativa' : ''} onClick={() => mudarDiaAtivo(dia)}>
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

              {carregando ? (
                <p className="msg-lista-vazia">Carregando...</p>
              ) : (
                <div className="lista-itens-agenda">
                  {listaTarefas.map((tarefa, index) => {
                    const estaEditando = editandoIndex === index;
                    return (
                      <div key={tarefa.id || index} className={`item-agenda ${estaEditando ? 'item-editando' : ''}`}>
                        {estaEditando ? (
                          <div className="edicao-inline">
                            <input
                              className="input-edicao"
                              type="text"
                              value={textoEditando}
                              onChange={(e) => setTextoEditando(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') salvarEdicao(index);
                                if (e.key === 'Escape') cancelarEdicao();
                              }}
                              autoFocus
                            />
                            <div className="edicao-acoes">
                              <button className="btn-salvar-edicao" type="button" onClick={() => salvarEdicao(index)}>✓ Salvar</button>
                              <button className="btn-cancelar-edicao" type="button" onClick={cancelarEdicao}>✕ Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="item-conteudo">
                              <input
                                type="checkbox"
                                checked={tarefa.status === 'CONCLUIDA'}
                                onChange={() => alternarStatusTarefa(tarefa.id, tarefa.status)}
                                disabled={isHistorico}
                              />
                              <span className={`tarefa-texto ${isHistorico || tarefa.status === 'CONCLUIDA' ? 'historico' : ''}`}>
                                {tarefa.texto}
                              </span>
                              {tarefa.tipo && tarefa.tipo !== 'GERAL' && (
                                <span className="tag-tipo">{tarefa.tipo}</span>
                              )}
                              <span className="tag-dia">Dia {tarefa.dia}</span>
                            </div>

                            {!isHistorico && (
                              <div className="item-acoes">
                                <button className="btn-editar" type="button" onClick={() => iniciarEdicao(index, tarefa.texto)} title="Editar">✏️</button>
                                <button className="btn-deletar" type="button" onClick={() => removerTarefa(tarefa.id_evento, index)} title="Excluir">🗑️</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}

                  {listaTarefas.length === 0 && (
                    <p className="msg-lista-vazia">Nenhum registro encontrado para este dia.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tela === 'sinais' && <SinaisVitais />}
        {tela === 'contatos' && <Contatos />}
      </div>
    </div>
  );
};

export default TelaPrincipal;
