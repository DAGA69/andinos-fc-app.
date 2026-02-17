import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Goal, Star, UserPlus, Users, 
  RotateCcw, Check, X, Calendar, Download, FileText, 
  History, Save, ChevronDown, ChevronUp 
} from 'lucide-react';

/**
 * ANDINOS FC 2026 - Stats App
 * Esta versión está lista para ser copiada a un entorno de React (Vite, Create React App, etc.)
 * Utiliza Tailwind CSS para el diseño y Lucide para los iconos.
 */

const App = () => {
  // Persistencia con localStorage para que no se borre al cerrar el navegador
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('andinos_fc_players');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('andinos_fc_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [gameDate, setGameDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState(0);
  const [editAssists, setEditAssists] = useState(0);
  const [scorerId, setScorerId] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [expandedHistory, setExpandedHistory] = useState(null);

  // Guardado automático cada vez que cambian los jugadores o el historial
  useEffect(() => {
    localStorage.setItem('andinos_fc_players', JSON.stringify(players));
    localStorage.setItem('andinos_fc_history', JSON.stringify(history));
  }, [players, history]);

  const addPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      goals: 0,
      assists: 0
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const deletePlayer = (id) => {
    if (window.confirm("¿Eliminar este jugador? Sus goles actuales se perderán.")) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const startEdit = (player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditGoals(player.goals);
    setEditAssists(player.assists);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setPlayers(players.map(p => 
      p.id === editingId 
        ? { ...p, name: editName.trim(), goals: parseInt(editGoals) || 0, assists: parseInt(editAssists) || 0 } 
        : p
    ));
    setEditingId(null);
  };

  const recordGoal = () => {
    if (!scorerId) return;
    setPlayers(players.map(p => {
      let updatedPlayer = { ...p };
      if (p.id === scorerId) updatedPlayer.goals += 1;
      if (assistantId && p.id === assistantId) updatedPlayer.assists += 1;
      return updatedPlayer;
    }));
    setScorerId('');
    setAssistantId('');
  };

  const saveToHistory = () => {
    const statsThisGame = players.filter(p => p.goals > 0 || p.assists > 0);
    if (statsThisGame.length === 0) {
      alert("No hay actividad para guardar en esta jornada.");
      return;
    }

    if (window.confirm(`¿Finalizar jornada del ${gameDate}? Los marcadores volverán a cero.`)) {
      const newHistoryEntry = {
        id: Date.now().toString(),
        date: gameDate,
        stats: statsThisGame.map(p => ({ name: p.name, goals: p.goals, assists: p.assists })),
        totalGoals: statsThisGame.reduce((sum, p) => sum + p.goals, 0)
      };

      setHistory([newHistoryEntry, ...history]);
      setPlayers(players.map(p => ({ ...p, goals: 0, assists: 0 })));
    }
  };

  const deleteHistoryItem = (id) => {
    if (window.confirm("¿Eliminar este registro del historial?")) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return b.assists - a.assists;
  });

  const exportToExcel = () => {
    const headers = ["Jugador", "Goles", "Asistencias", "Fecha"];
    const rows = sortedPlayers.map(p => [p.name, p.goals, p.assists, gameDate]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AndinosFC_Stats_${gameDate}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12 print:bg-white overflow-x-hidden">
      {/* Header Estilo Deportivo */}
      <header className="bg-blue-900 text-white p-6 shadow-xl sticky top-0 z-20 print:relative print:bg-white print:text-black print:shadow-none print:p-2">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={24} /> ANDINOS FC 2026
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-blue-800/50 p-2 rounded-lg print:bg-slate-100">
            <Calendar size={16} className="text-blue-300" />
            <input 
              type="date" 
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none w-full cursor-pointer text-white print:text-black"
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Registro Rápido (Solo visible en la app, no en impresión) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 print:hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Goal className="text-blue-600" size={16} /> Registro de Juego
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gol de</label>
                <select 
                  value={scorerId}
                  onChange={(e) => setScorerId(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Jugador...</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Asistencia de</label>
                <select 
                  value={assistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Nadie</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === scorerId}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={recordGoal}
              disabled={!scorerId}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                scorerId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              REGISTRAR ACCIÓN
            </button>
          </div>
        </section>

        {/* Tabla Actual de Goleadores */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-slate-800">
            <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
              <Users size={16} /> Marcador de Hoy
            </h2>
            <div className="flex gap-6 text-[10px] font-black uppercase mr-2">
              <span>Goles</span>
              <span>Asist.</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedPlayers.length === 0 ? (
              <div className="p-10 text-center text-slate-300 text-sm italic">Sin jugadores aún</div>
            ) : (
              sortedPlayers.map((player, index) => (
                <div key={player.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-xs font-black ${index === 0 && player.goals > 0 ? 'text-yellow-500' : 'text-slate-300'}`}>
                      {index + 1}
                    </span>
                    <span className="font-bold text-slate-800">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-8 pr-2 font-black">
                    <span className="w-8 text-center text-lg text-blue-700">{player.goals}</span>
                    <span className="w-8 text-center text-lg text-emerald-600">{player.assists}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 print:hidden">
            <button 
              onClick={saveToHistory}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
            >
              <Save size={18} /> FINALIZAR JORNADA
            </button>
          </div>
        </section>

        {/* Historial Acumulado */}
        {history.length > 0 && (
          <section className="space-y-3 print:hidden">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <History size={16} /> Jornadas Anteriores
            </h2>
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-700">{item.date}</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                      {item.totalGoals} Goles Registrados
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                      className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedHistory === item.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>
                
                {expandedHistory === item.id && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                    {item.stats.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">{s.name}</span>
                        <span className="font-black text-slate-400">{s.goals} Goles • {s.assists} Asist.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Botones de Exportación */}
        <div className="grid grid-cols-2 gap-3 print:hidden">
          <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-slate-800 text-white p-4 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
            <Download size={18} /> Excel (CSV)
          </button>
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-800 text-white p-4 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
            <FileText size={18} /> Reporte PDF
          </button>
        </div>

        {/* Panel de Administración de Jugadores */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 print:hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <UserPlus size={16} /> Administrar Nómina
          </h2>

          <form onSubmit={addPlayer} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nombre del jugador..."
              className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="bg-blue-900 text-white p-3 rounded-xl shadow-md">
              <Plus size={24} />
            </button>
          </form>

          <div className="space-y-3">
            {players.map(player => (
              <div key={player.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                {editingId === player.id ? (
                  <div className="space-y-3">
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 border border-blue-200 rounded-lg text-sm font-bold"
                      placeholder="Nombre del jugador"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-slate-400 block ml-1">GOLES</span>
                        <input type="number" value={editGoals} onChange={(e) => setEditGoals(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-center font-bold text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-slate-400 block ml-1">ASISTENCIAS</span>
                        <input type="number" value={editAssists} onChange={(e) => setEditAssists(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-center font-bold text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                      <button onClick={() => setEditingId(null)} className="text-slate-400 font-bold text-xs uppercase">Cancelar</button>
                      <button onClick={saveEdit} className="text-blue-600 font-bold text-xs uppercase">Guardar Cambios</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{player.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                        {player.goals}G • {player.assists}A
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(player)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deletePlayer(player.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="max-w-md mx-auto px-4 text-center print:mt-10">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
          Andinos FC 2026 - Control de Estadísticas
        </p>
      </footer>
    </div>
  );
};

export default App;

