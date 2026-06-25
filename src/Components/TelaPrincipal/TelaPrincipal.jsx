import React, { useState, useEffect } from 'react';
import './TelaPrincipal.css';
import SinaisVitais from '../SinaisVitais/SinaisVitais.jsx';
import Contatos from "../TelaContato/Contatos.jsx";
import HistoricoPanico from "../HistoricodePanico/HistoricodePanico.jsx";
import Modal from '../Modal/Modal';
import {
  getUserProfile,
  getContacts,
  getAgendaOcorrenciasPorData,
  createAgendaTemplate,
  updateAgendaOccurrenceStatus,
  deleteAgendaTemplate,
  triggerPanic,
  saveFcmToken,
} from '../Services/Api';
import API from '../Services/Api';

const formatarParaWhatsApp = (telefone) => {
  const apenasDigitos = telefone.replace(/\D/g, '');
  return apenasDigitos.startsWith('55') ? apenasDigitos : `55${apenasDigitos}`;
};

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
  const [contatosEmergencia, setContatosEmergencia] = useState([]);
  const [acionandoPanico, setAcionandoPanico] = useState(false);

  const [modalConfirmacao, setModalConfirmacao] = useState({ open: false, idEvento: null });
  const [modalEmergencia, setModalEmergencia] = useState(false);
  const [modalErro, setModalErro] = useState({ open: false, msg: '' });

  const idUsuario = localStorage.getItem('usuario_id');

  // ── Solicita permissão de notificação e salva FCM token ──
  useEffect(() => {
    const registrarFcmToken = async () => {
      try {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Se estiver usando Firebase no projeto, descomente e adapte:
        // const token = await getMessagingToken();
        // if (token) await saveFcmToken(token);
      } catch (err) {
        console.warn('Erro ao registrar FCM token:', err);
      }
    };
    registrarFcmToken();
  }, []);

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

  const diaParaDataCompleta = (dia, modoHistorico) => {
    const hoje = new Date();
    const inicio = modoHistorico ? -5 : 0;
    const fim = modoHistorico ? 0 : 5;
    for (let i = inicio; i < fim; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() + i);
      if (String(data.getDate()).padStart(2, '0') === dia) {
        return data.toISOString().split('T')[0];
      }
    }
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${dia}`;
  };

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
      if (Array.isArray(templates)) templates.forEach(t => { mapaTemplates[t.id_evento] = t; });

      const tarefasNormalizadas = (Array.isArray(ocorrencias) ? ocorrencias : []).map(oc => {
        const template = mapaTemplates[oc.id_evento] || {};
        const dataOc = new Date(oc.data_ocorrencia);
        const diaDaOc = String(dataOc.getUTCDate()).padStart(2, '00');
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

    const carregarContatosEmergencia = async () => {
      try {
        const dados = await getContacts();
        setContatosEmergencia(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error('Erro ao carregar contatos de emergência:', error);
      }
    };

    carregarPerfil();
    carregarContatosEmergencia();
    carregarAgendaDoBanco(diaAtivo, isHistorico);
  }, []);

  const mudarDiaAtivo = (dia) => { setDiaAtivo(dia); setEditandoIndex(null); carregarAgendaDoBanco(dia, isHistorico); };
  const alternarModoAgenda = () => {
    const novoModo = !isHistorico;
    const novosDias = gerarDiasDoCalendario(novoModo);
    const novoDia = novosDias[0];
    setIsHistorico(novoModo); setDiaAtivo(novoDia);
    carregarAgendaDoBanco(novoDia, novoModo);
  };

  const adicionarNovaTarefa = async (evento) => {
    evento.preventDefault();
    try {
      const dataCompleta = diaParaDataCompleta(diaAtivo, isHistorico);
      await createAgendaTemplate({
        id_paciente: Number(idUsuario), titulo: novoTexto, tipo: 'GERAL',
        data_hora: '08:00', data_inicio: dataCompleta, data_fim: dataCompleta, descricao: null,
      });
      setNovoTexto('');
      carregarAgendaDoBanco(diaAtivo, isHistorico);
    } catch (error) {
      setModalErro({ open: true, msg: 'Não foi possível salvar a tarefa. Tente novamente.' });
    }
  };

  const removerTarefa = (idEvento) => setModalConfirmacao({ open: true, idEvento });
  const confirmarExclusao = async () => {
    try {
      await deleteAgendaTemplate(modalConfirmacao.idEvento);
      setModalConfirmacao({ open: false, idEvento: null });
      carregarAgendaDoBanco(diaAtivo, isHistorico);
    } catch (error) {
      setModalConfirmacao({ open: false, idEvento: null });
      setModalErro({ open: true, msg: 'Não foi possível excluir a tarefa. Tente novamente.' });
    }
  };

  const alternarStatusTarefa = async (idOcorrencia, statusAtual) => {
    if (!idOcorrencia) return;
    try { await updateAgendaOccurrenceStatus(idOcorrencia, statusAtual); carregarAgendaDoBanco(diaAtivo, isHistorico); }
    catch (error) { console.error('Erro ao atualizar status:', error); }
  };

  const iniciarEdicao = (idx, textoAtual) => { setEditandoIndex(idx); setTextoEditando(textoAtual); };
  const salvarEdicao = (idx) => {
    if (!textoEditando.trim()) return;
    setListaTarefas(listaTarefas.map((t, i) => i === idx ? { ...t, texto: textoEditando.trim() } : t));
    setEditandoIndex(null); setTextoEditando('');
  };
  const cancelarEdicao = () => { setEditandoIndex(null); setTextoEditando(''); };

  // Abre WhatsApp com mensagem pré-escrita
  const abrirWhatsApp = (contato) => {
    const numero = formatarParaWhatsApp(contato.telefone);
    const msg = encodeURIComponent(
      `🚨 ALERTA DE EMERGÊNCIA — SafeHome\n\nOlá, ${contato.nome}! ${nomeUsuario} ${sobrenomeUsuario} acionou o botão de emergência e pode precisar de ajuda imediata.\n\nPor favor, entre em contato o quanto antes.`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  // Aciona pânico real na API + abre discador
  const ligar192 = async () => {
    setAcionandoPanico(true);
    try {
      // Tenta pegar localização do usuário
      let latitude, longitude;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => { latitude = pos.coords.latitude; longitude = pos.coords.longitude; resolve(); },
            () => resolve() // falha silenciosa, envia sem coords
          );
        });
      }
      await triggerPanic(latitude, longitude);
    } catch (err) {
      console.error('Erro ao registrar pânico na API:', err);
    } finally {
      setAcionandoPanico(false);
      setModalEmergencia(false);
      window.location.href = 'tel:192';
    }
  };

  const deslogar = () => {
    localStorage.removeItem('safehome_token');
    localStorage.removeItem('usuario_id');
    window.location.href = '/';
  };

  return (
    <div className="pagina-principal">
      <div className="menu-topo">
        <div className="titulo-logo">💙 MindCare</div>
        <div className="botoes-menu">
          <button className={tela === 'inicio'   ? 'active' : ''} onClick={() => setTela('inicio')}>Início</button>
          <button className={tela === 'sinais'   ? 'active' : ''} onClick={() => setTela('sinais')}>Sinais Vitais</button>
          <button className={tela === 'contatos' ? 'active' : ''} onClick={() => setTela('contatos')}>Contatos</button>
          <button className={tela === 'panico'   ? 'active' : ''} onClick={() => setTela('panico')}>Histórico</button>
          <button className="btn-emergencia" onClick={() => setModalEmergencia(true)}>Emergência</button>
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
                  <input type="text" placeholder="Ex: Tomar medicação (08:00)" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} required />
                  <button type="submit">Adicionar</button>
                </form>
              ) : (
                <p className="msg-modo-leitura">Modo leitura: Não é possível adicionar novas tarefas em dias passados.</p>
              )}

              {carregando ? <p className="msg-lista-vazia">Carregando...</p> : (
                <div className="lista-itens-agenda">
                  {listaTarefas.map((tarefa, index) => {
                    const estaEditando = editandoIndex === index;
                    return (
                      <div key={tarefa.id || index} className={`item-agenda ${estaEditando ? 'item-editando' : ''}`}>
                        {estaEditando ? (
                          <div className="edicao-inline">
                            <input className="input-edicao" type="text" value={textoEditando}
                              onChange={(e) => setTextoEditando(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') salvarEdicao(index); if (e.key === 'Escape') cancelarEdicao(); }}
                              autoFocus />
                            <div className="edicao-acoes">
                              <button className="btn-salvar-edicao" type="button" onClick={() => salvarEdicao(index)}>✓ Salvar</button>
                              <button className="btn-cancelar-edicao" type="button" onClick={cancelarEdicao}>✕ Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="item-conteudo">
                              <input type="checkbox" checked={tarefa.status === 'CONCLUIDA'} onChange={() => alternarStatusTarefa(tarefa.id, tarefa.status)} disabled={isHistorico} />
                              <span className={`tarefa-texto ${isHistorico || tarefa.status === 'CONCLUIDA' ? 'historico' : ''}`}>{tarefa.texto}</span>
                              {tarefa.tipo && tarefa.tipo !== 'GERAL' && <span className="tag-tipo">{tarefa.tipo}</span>}
                              <span className="tag-dia">Dia {tarefa.dia}</span>
                            </div>
                            {!isHistorico && (
                              <div className="item-acoes">
                                <button className="btn-editar" type="button" onClick={() => iniciarEdicao(index, tarefa.texto)} title="Editar">✏️</button>
                                <button className="btn-deletar" type="button" onClick={() => removerTarefa(tarefa.id_evento)} title="Excluir">🗑️</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {listaTarefas.length === 0 && <p className="msg-lista-vazia">Nenhum registro encontrado para este dia.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {tela === 'sinais'   && <SinaisVitais />}
        {tela === 'contatos' && <Contatos />}
        {tela === 'panico'   && <HistoricoPanico />}
      </div>

      {/* ── Modal: Excluir tarefa ── */}
      <Modal isOpen={modalConfirmacao.open} onClose={() => setModalConfirmacao({ open: false, idEvento: null })}
        title="Excluir tarefa"
        footer={<>
          <button className="modal-btn-cancelar" onClick={() => setModalConfirmacao({ open: false, idEvento: null })}>Cancelar</button>
          <button className="modal-btn-perigo" onClick={confirmarExclusao}>Excluir</button>
        </>}>
        <p>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* ── Modal: Emergência com WhatsApp ── */}
      <Modal isOpen={modalEmergencia} onClose={() => setModalEmergencia(false)}
        title="🚨 Alerta de Emergência"
        footer={<>
          <button className="modal-btn-cancelar" onClick={() => setModalEmergencia(false)}>Cancelar</button>
          <button className="modal-btn-perigo" onClick={ligar192} disabled={acionandoPanico}>
            {acionandoPanico ? 'Registrando...' : '📞 Ligar 192'}
          </button>
        </>}>
        <p>Acione rapidamente um contato de confiança ou ligue para o SAMU.</p>
        <p style={{ fontSize: 12, color: '#a89dc0', marginTop: 4 }}>
          Ao ligar 192, o alerta também será registrado no sistema e seus contatos serão notificados.
        </p>

        {contatosEmergencia.length > 0 ? (
          <div className="emergencia-contatos">
            <p className="emergencia-label">Seus contatos de apoio:</p>
            {contatosEmergencia.map((contato) => (
              <button key={contato.id} className="emergencia-btn-whatsapp" type="button" onClick={() => abrirWhatsApp(contato)}>
                <span className="emergencia-whatsapp-icone">💬</span>
                <span className="emergencia-whatsapp-info">
                  <strong>{contato.nome}</strong>
                  {contato.parentesco && <small>{contato.parentesco}</small>}
                </span>
                <span className="emergencia-whatsapp-label">WhatsApp</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="emergencia-sem-contatos">
            Você ainda não tem contatos cadastrados.{' '}
            <span style={{ color: '#7c5cbf', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => { setModalEmergencia(false); setTela('contatos'); }}>
              Adicionar agora
            </span>
          </p>
        )}
      </Modal>

      {/* ── Modal: Erro genérico ── */}
      <Modal isOpen={modalErro.open} onClose={() => setModalErro({ open: false, msg: '' })}
        title="Ops, algo deu errado"
        footer={<button className="modal-btn-confirmar" onClick={() => setModalErro({ open: false, msg: '' })}>Entendi</button>}>
        <p>{modalErro.msg}</p>
      </Modal>
    </div>
  );
};

export default TelaPrincipal;
