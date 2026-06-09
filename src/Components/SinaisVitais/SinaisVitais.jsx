import React, { useState } from 'react';
import './SinaisVitais.css';

const SinaisVitais = () => {
 
  const [bpm, setBpm] = useState('75');
  const [sono, setSono] = useState('7.5');
  const [estresse, setEstresse] = useState('Moderado');

 
  const [novoBpm, setNovoBpm] = useState('');
  const [novoSono, setNovoSono] = useState('');
  const [novoEstresse, setNovoEstresse] = useState('');

 
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
    if (valor.includes('Alto')) {
      return { texto: 'Perigo', classe: 'perigo' };
    }
    if (valor.includes('Moderado')) {
      return { texto: 'Atenção', classe: 'alerta' };
    }
    return { texto: 'Normal', classe: 'bom' };
  };

  const salvarMedicoes = (evento) => {
    evento.preventDefault();

    if (novoBpm) setBpm(novoBpm);
    if (novoSono) setSono(novoSono);
    if (novoEstresse) setEstresse(novoEstresse);

    setNovoBpm('');
    setNovoSono('');
    setNovoEstresse('');
  };


  const statusBpm = obterStatusBpm(bpm);
  const statusSono = obterStatusSono(sono);
  const statusEstresse = obterStatusEstresse(estresse);

  return (
    <div className="painel-sinais">
      <h2 className="titulo-destacado"> Monitoramento de Sinais Vitais</h2>
      <p className="subtitulo-destacado">Acompanhe seus dados de saúde integrados ao MindCare</p>

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

        {/* Card Estresse */}
        <div className="card-sinal">
          <div className="icone-sinal">🧠</div>
          <h3>Nível de Estresse</h3>
          <p className="valor-sinal">{estresse}</p>
          <span className={`status-sinal ${statusEstresse.classe}`}>{statusEstresse.texto}</span>
        </div>
      </div>

      <div className="caixa-agenda" style={{ marginTop: '30px' }}>
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
      </div>
    </div>
  );
};

export default SinaisVitais;