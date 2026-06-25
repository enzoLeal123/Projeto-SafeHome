import React, { useState, useEffect } from 'react';
import { getPanicLogs } from '../Services/Api';
import './HistoricodePanico.css';

const origemLabel = {
  MANUAL:      { texto: 'Botão Manual',     emoji: '🆘', classe: 'manual'   },
  SENSOR_GAS:  { texto: 'Sensor de Gás',    emoji: '🔥', classe: 'gas'      },
  QUEDA_WATCH: { texto: 'Queda Detectada',  emoji: '⚠️', classe: 'queda'    },
  BPM_ALTO:    { texto: 'Alerta Cardíaco',  emoji: '💓', classe: 'bpm'      },
};

const formatarDataHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const HistoricoPanico = () => {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('usuario_id');
    if (!userId) { setCarregando(false); return; }

    getPanicLogs(userId)
      .then((dados) => setLogs(Array.isArray(dados) ? dados : []))
      .catch((err) => setErro('Não foi possível carregar o histórico: ' + err.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="panico-container">
      <h2 className="panico-titulo">Histórico de Emergências</h2>
      <p className="panico-subtitulo">Registro de todos os alertas acionados</p>

      {carregando && <p className="panico-estado">Carregando...</p>}
      {erro      && <p className="panico-estado panico-erro">{erro}</p>}

      {!carregando && !erro && logs.length === 0 && (
        <div className="panico-vazio">
          <span className="panico-vazio-icone">✅</span>
          <p>Nenhum alerta registrado.</p>
          <small>Ótima notícia! Esperamos que continue assim.</small>
        </div>
      )}

      {!carregando && logs.length > 0 && (
        <ul className="panico-lista">
          {logs.map((log) => {
            const origem = origemLabel[log.origem] || { texto: log.origem, emoji: '🚨', classe: 'manual' };
            return (
              <li key={log.id_panico} className="panico-item">
                <div className={`panico-icone-origem ${origem.classe}`}>
                  {origem.emoji}
                </div>

                <div className="panico-info">
                  <strong className="panico-origem-label">{origem.texto}</strong>
                  <span className="panico-data">{formatarDataHora(log.timestamp)}</span>
                  {(log.latitude && log.longitude) && (
                    <a
                      className="panico-mapa-link"
                      href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📍 Ver localização
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default HistoricoPanico;
