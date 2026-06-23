import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './SinaisVitais.css';

const STORAGE_KEY = 'sinais_vitais_historico';

const dadosIniciais = [
  { data: '17/06', bpm: 72, sono: 7.0, estresse: 2 },
  { data: '18/06', bpm: 80, sono: 6.5, estresse: 3 },
  { data: '19/06', bpm: 68, sono: 8.0, estresse: 1 },
  { data: '20/06', bpm: 91, sono: 5.5, estresse: 3 },
  { data: '21/06', bpm: 75, sono: 7.5, estresse: 2 },
  { data: '22/06', bpm: 70, sono: 8.5, estresse: 1 },
];

const nivelEstresseParaNum = { Baixo: 1, Moderado: 2, Alto: 3 };
const numParaNivelEstresse = { 1: 'Baixo', 2: 'Moderado', 3: 'Alto' };

const obterStatusBpm = (valor) => {
  const num = Number(valor);
  if (num > 100) return { texto: 'Perigo', classe: 'perigo' };
  if (num < 60) return { texto: 'Atenção', classe: 'alerta' };
  return { texto: 'Normal', classe: 'bom' };
};

const obterStatusSono = (valor) => {
  const num = Number(valor);
  if (num < 7) return { texto: 'Atenção', classe: 'alerta' };
  if (num > 9) return { texto: 'Excesso', classe: 'alerta' };
  return { texto: 'Ideal', classe: 'bom' };
};

const obterStatusEstresse = (valor) => {
  if (valor === 'Alto') return { texto: 'Perigo', classe: 'perigo' };
  if (valor === 'Moderado') return { texto: 'Atenção', classe: 'alerta' };
  return { texto: 'Normal', classe: 'bom' };
};

const TooltipEstresse = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip-customizado">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name === 'estresse'
              ? `Estresse: ${numParaNivelEstresse[entry.value] || entry.value}`
              : `${entry.name === 'bpm' ? 'BPM' : 'Sono (h)'}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SinaisVitais = () => {
  const [historico, setHistorico] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : dadosIniciais;
  });

  const ultimo = historico[historico.length - 1] || {};
  const [bpm, setBpm] = useState(String(ultimo.bpm || 75));
  const [sono, setSono] = useState(String(ultimo.sono || 7.5));
  const [estresse, setEstresse] = useState(numParaNivelEstresse[ultimo.estresse] || 'Moderado');

  const [novoBpm, setNovoBpm] = useState('');
  const [novoSono, setNovoSono] = useState('');
  const [novoEstresse, setNovoEstresse] = useState('');
  const [graficoCampo, setGraficoCampo] = useState('bpm');
  const [salvouAgora, setSalvouAgora] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
  }, [historico]);

  const salvarMedicoes = (evento) => {
    evento.preventDefault();

    const bpmFinal = novoBpm || bpm;
    const sonoFinal = novoSono || sono;
    const estresseFinal = novoEstresse || estresse;

    if (novoBpm) setBpm(novoBpm);
    if (novoSono) setSono(novoSono);
    if (novoEstresse) setEstresse(novoEstresse);

    const agora = new Date();
    const dataFormatada = `${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}`;

    const novoRegistro = {
      data: dataFormatada,
      bpm: Number(bpmFinal),
      sono: Number(sonoFinal),
      estresse: nivelEstresseParaNum[estresseFinal] || 2,
    };

    setHistorico((h) => [...h.slice(-29), novoRegistro]);
    setNovoBpm('');
    setNovoSono('');
    setNovoEstresse('');
    setSalvouAgora(true);
    setTimeout(() => setSalvouAgora(false), 2500);
  };

  const statusBpm = obterStatusBpm(bpm);
  const statusSono = obterStatusSono(sono);
  const statusEstresse = obterStatusEstresse(estresse);

  const configGrafico = {
    bpm: { cor: '#e05c8a', label: 'Frequência Cardíaca (BPM)', dominio: [40, 130] },
    sono: { cor: '#6a8fd8', label: 'Sono (Horas)', dominio: [0, 12] },
    estresse: { cor: '#f0a04a', label: 'Estresse (1=Baixo, 2=Mod., 3=Alto)', dominio: [0, 4] },
  };

  const cfg = configGrafico[graficoCampo];

  return (
    <div className="painel-sinais">
      <h2 className="titulo-destacado">Monitoramento de Sinais Vitais</h2>
      <p className="subtitulo-destacado">Acompanhe seus dados de saúde integrados ao MindCare</p>

      {/* Cards de status atual */}
      <div className="cards-container">
        <div className="card-sinal">
          <div className="icone-sinal">❤️</div>
          <h3>Frequência Cardíaca</h3>
          <p className="valor-sinal">{bpm} <span>BPM</span></p>
          <span className={`status-sinal ${statusBpm.classe}`}>{statusBpm.texto}</span>
        </div>

        <div className="card-sinal">
          <div className="icone-sinal">🌙</div>
          <h3>Sono da Última Noite</h3>
          <p className="valor-sinal">{sono} <span>Horas</span></p>
          <span className={`status-sinal ${statusSono.classe}`}>{statusSono.texto}</span>
        </div>

        <div className="card-sinal">
          <div className="icone-sinal">🧠</div>
          <h3>Nível de Estresse</h3>
          <p className="valor-sinal">{estresse}</p>
          <span className={`status-sinal ${statusEstresse.classe}`}>{statusEstresse.texto}</span>
        </div>
      </div>

      {/* Gráfico de histórico */}
      <div className="caixa-agenda grafico-container" style={{ marginTop: '30px' }}>
        <div className="grafico-cabecalho">
          <h3>Histórico</h3>
          <div className="grafico-abas">
            {[
              { key: 'bpm', label: '❤️ BPM' },
              { key: 'sono', label: '🌙 Sono' },
              { key: 'estresse', label: '🧠 Estresse' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`aba-grafico ${graficoCampo === key ? 'ativa' : ''}`}
                onClick={() => setGraficoCampo(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <hr />

        <p className="grafico-legenda-label">{cfg.label}</p>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={historico} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" />
            <XAxis
              dataKey="data"
              tick={{ fontSize: 12, fill: '#888' }}
              tickLine={false}
            />
            <YAxis
              domain={cfg.dominio}
              tick={{ fontSize: 12, fill: '#888' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={graficoCampo === 'estresse'
                ? (v) => numParaNivelEstresse[v] || v
                : undefined}
            />
            <Tooltip content={<TooltipEstresse />} />
            <Line
              type="monotone"
              dataKey={graficoCampo}
              stroke={cfg.cor}
              strokeWidth={2.5}
              dot={{ r: 4, fill: cfg.cor, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name={graficoCampo}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Formulário de nova medição */}
      <div className="caixa-agenda" style={{ marginTop: '24px' }}>
        <h3>Registrar Novas Medições</h3>
        <hr />
        <form onSubmit={salvarMedicoes} className="form-adicionar">
          <input
            type="number"
            placeholder="Frequência (BPM)"
            value={novoBpm}
            onChange={(e) => setNovoBpm(e.target.value)}
          />
          <input
            type="number"
            placeholder="Horas de Sono"
            step="0.1"
            value={novoSono}
            onChange={(e) => setNovoSono(e.target.value)}
          />
          <select value={novoEstresse} onChange={(e) => setNovoEstresse(e.target.value)}>
            <option value="" disabled hidden>Nível de Estresse</option>
            <option value="Baixo">Baixo</option>
            <option value="Moderado">Moderado</option>
            <option value="Alto">Alto</option>
          </select>
          <button type="submit">Salvar</button>
        </form>
        {salvouAgora && (
          <p className="msg-sucesso">✅ Medição salva e adicionada ao gráfico!</p>
        )}
      </div>
    </div>
  );
};

export default SinaisVitais;
