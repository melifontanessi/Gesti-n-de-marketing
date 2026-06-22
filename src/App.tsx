/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, ChecklistItem, Designer, Analyst } from './types';
import { INITIAL_TASKS, DESIGNERS, ANALYSTS } from './initialData';
import { loadFromLocalStorage, saveToLocalStorage } from './utils';
import ManagerDashboard from './components/ManagerDashboard';
import DesignerDashboard from './components/DesignerDashboard';
import { BookOpen, CheckSquare, Clock, ShieldCheck, Heart, Info, RefreshCw, Briefcase, User, Users, UserCog } from 'lucide-react';

export default function App() {
  // Load tasks from localStorage or use initial pre-loaded ones
  const [tasks, setTasks] = useState<Task[]>(() => {
    return loadFromLocalStorage<Task[]>('gestor_disenadores_tasks', INITIAL_TASKS);
  });

  // Load designers from localStorage or use initial pre-loaded ones
  const [designers, setDesigners] = useState<Designer[]>(() => {
    return loadFromLocalStorage<Designer[]>('gestor_disenadores_designers', DESIGNERS);
  });

  // Load analysts from localStorage or use initial pre-loaded ones
  const [analysts, setAnalysts] = useState<Analyst[]>(() => {
    return loadFromLocalStorage<Analyst[]>('gestor_disenadores_analysts', ANALYSTS);
  });

  // Active simulated user, defaults to manager so the user sees the admin system on boot
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return loadFromLocalStorage<string>('gestor_disenadores_currentUser', 'manager');
  });

  // Track if we showed the initial process guide
  const [showHowToUse, setShowHowToUse] = useState(true);

  // Sync tasks state to localStorage
  useEffect(() => {
    saveToLocalStorage('gestor_disenadores_tasks', tasks);
  }, [tasks]);

  // Sync designers state to localStorage
  useEffect(() => {
    saveToLocalStorage('gestor_disenadores_designers', designers);
  }, [designers]);

  // Sync analysts state to localStorage
  useEffect(() => {
    saveToLocalStorage('gestor_disenadores_analysts', analysts);
  }, [analysts]);

  // Sync currentUser state to localStorage
  useEffect(() => {
    saveToLocalStorage('gestor_disenadores_currentUser', currentUser);
  }, [currentUser]);

  // Action: Update designer details
  const handleUpdateDesigner = (id: string, updatedFields: Partial<Designer>) => {
    setDesigners(prev => prev.map(d => 
      d.id === id ? { ...d, ...updatedFields } : d
    ));
  };

  // Action: Update analyst details
  const handleUpdateAnalyst = (id: string, updatedFields: Partial<Analyst>) => {
    setAnalysts(prev => prev.map(a => 
      a.id === id ? { ...a, ...updatedFields } : a
    ));
  };

  // Action: Add new task (Analyst/Manager flow)
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      status: 'Pendiente',
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Action: Edit task parameters
  const handleEditTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updatedFields } : task
    ));
  };

  // Action: Delete task assignment
  const handleDeleteTask = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea del gestor?')) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  // Action: Designer starts executing task
  const handleStartTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: 'En Progreso',
          startTime: Date.now() // Absolute timestamp
        };
      }
      return task;
    }));
  };

  // Action: Designer reports task as completed and submits notes & checklist
  const handleCompleteTask = (taskId: string, notes: string, checklist: ChecklistItem[]) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const endTime = Date.now();
        const startTime = task.startTime || Date.now() - 60000; // fallback if started earlier
        const durationMs = endTime - startTime;

        return {
          ...task,
          status: 'Completada',
          endTime,
          durationMs,
          notes: notes.trim(),
          checklist // Saves the checked list indicating process compliance
        };
      }
      return task;
    }));
  };

  // Action: Cancel task running timer and send back to Pending queue
  const handleCancelTaskTimer = (taskId: string) => {
    if (confirm('¿ deseas pausar/cancelar el cronómetro activo de esta tarea? Volverá al listado de "Pendientes" sin guardar el tiempo.')) {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: 'Pendiente',
            startTime: undefined
          };
        }
        return task;
      }));
    }
  };

  // Action: Clear local database to factory initial state
  const handleResetDatabase = () => {
    if (confirm('⚠️ ¿Estás seguro de restablecer el simulador? Se borrarán tus cambios locales y volverán los analistas, diseñadores y tareas de ejemplo iniciales.')) {
      localStorage.removeItem('gestor_disenadores_tasks');
      localStorage.removeItem('gestor_disenadores_designers');
      localStorage.removeItem('gestor_disenadores_analysts');
      setTasks(INITIAL_TASKS);
      setDesigners(DESIGNERS);
      setAnalysts(ANALYSTS);
    }
  };

  const getActiveAnalyst = () => {
    if (currentUser === 'manager' || currentUser === 'ana_meli') {
      return analysts.find(a => a.id === 'ana_meli') || analysts[0];
    }
    return analysts.find(a => a.id === currentUser) || null;
  };

  const activeAnalyst = getActiveAnalyst();
  const isManagerOrAnalyst = activeAnalyst !== null;

  const activeDesigner = !isManagerOrAnalyst
    ? designers.find(d => d.id === currentUser)
    : null;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800 font-sans">
      
      {/* 1. Sidebar - Sleek Interface style (Visible on Desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-900 text-white shrink-0 h-screen border-r border-slate-850 select-none">
        
        {/* Top brand header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
            M
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none uppercase">MktOps</h1>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Gestión de Marketing</span>
          </div>
        </div>

        {/* Roles / Navigation Switchers */}
        <nav className="flex-grow p-4.5 space-y-6 overflow-y-auto">
          
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3.5 mb-2.5">
              Responsables y Analistas
            </div>
            
            <div className="space-y-1.5">
              {analysts.map((analyst) => {
                const isActive = currentUser === analyst.id || (analyst.id === 'ana_meli' && currentUser === 'manager');
                return (
                  <button
                    key={analyst.id}
                    type="button"
                    onClick={() => setCurrentUser(analyst.id)}
                    className={`w-full flex items-center px-3.5 py-2.5 rounded-xl space-x-3 transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                    <div className="min-w-0 ml-0.5">
                      <span className="text-xs font-bold block leading-tight">{analyst.name}</span>
                      <span className={`text-[9px] block mt-0.5 font-light ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {analyst.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3.5 mb-2.5">
              Equipo de Diseño
            </div>
            
            <div className="space-y-1">
              {designers.map((designer) => {
                const isActive = currentUser === designer.id;
                // Check if designer has an active task running "En Progreso"
                const isWorking = tasks.some(t => t.assigneeId === designer.id && t.status === 'En Progreso');
                return (
                  <button
                    key={designer.id}
                    type="button"
                    id={`sidebar-role-${designer.id}`}
                    onClick={() => setCurrentUser(designer.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {/* Active status indicator dot */}
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isWorking 
                          ? 'bg-green-400 animate-pulse ring-4 ring-green-400/20' 
                          : 'bg-slate-600'
                      }`} />
                      <div className="truncate">
                        <span className="text-xs font-medium block leading-none">{designer.name}</span>
                        <span className={`text-[9px] block mt-0.5 font-light ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {designer.email}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 leading-none ${
                      isActive 
                        ? 'bg-indigo-500/40 text-indigo-100 border border-indigo-400/20' 
                        : designer.role === 'Inhouse' 
                          ? 'bg-slate-800 text-slate-400 border border-slate-700/50' 
                          : 'bg-amber-950/40 text-amber-500 border border-amber-900/40'
                    }`}>
                      {designer.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </nav>

        {/* Footer info inside sidebar */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 flex flex-col gap-0.5 shrink-0">
          <div className="flex items-center justify-between font-light">
            <span>Versión 1.2</span>
            <span>Establecimiento</span>
          </div>
          <p className="font-light truncate text-slate-600">Gestor Interno Marketing</p>
        </div>

      </aside>

      {/* 2. Main Area (Scrollable pane) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Horizontal Top Header - Sleek Interface style */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shrink-0 select-none">
          
          <div className="flex flex-col min-w-0">
            <span className="text-xs md:text-sm text-slate-500 font-medium truncate">
              {isManagerOrAnalyst 
                ? `Bienvenido de nuevo, ${activeAnalyst?.name}` 
                : `Portal del Diseñador: ${activeDesigner?.name}`}
            </span>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight leading-none mt-1 truncate">
              {isManagerOrAnalyst ? 'Gestión de Marketing' : 'Panel de Tareas'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4 shrink-0">
            {/* Quick simulated account stats/avatar */}
            <div className="flex items-center space-x-3.5">
              <span className="hidden sm:inline-block text-right">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {isManagerOrAnalyst ? activeAnalyst?.name : activeDesigner?.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-light">
                  {isManagerOrAnalyst ? activeAnalyst?.role : activeDesigner?.role}
                </span>
              </span>
              
              <div className="relative flex items-center">
                <div className={`w-10 h-10 ${isManagerOrAnalyst ? activeAnalyst?.avatarColor : 'bg-slate-100 text-slate-600'} rounded-full flex items-center justify-center border border-slate-200 font-bold uppercase shadow-sm`}>
                  {isManagerOrAnalyst ? activeAnalyst?.name.charAt(0) : activeDesigner?.name.charAt(0)}
                </div>
              </div>
            </div>

            {/* Simulated Mobile / Tablet Role Switcher inside top header */}
            <div className="lg:hidden">
              <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <select
                  aria-label="Seleccionar Rol"
                  value={currentUser}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 px-1 py-0.5 outline-none border-0 focus:ring-0 cursor-pointer"
                >
                  <optgroup label="Responsables y Analistas">
                    {analysts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Equipo de Diseño">
                    {designers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.role})</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

        </header>

        {/* Scrollable Workspace area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50">
          
          {/* Onboarding Guide Block */}
          {showHowToUse && (
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-950/40 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Background absolute abstract decoration */}
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1.5 max-w-3xl z-10">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-indigo-200">
                  <Info className="w-4 h-4 text-indigo-400" />
                  Guía Operativa del Simulador (Ver cómo funciona)
                </h3>
                <p className="text-xs text-indigo-100 font-light leading-relaxed">
                  Diseñamos esta aplicación enfocándonos de forma directa en tus problemas. Puedes experimentar el flujo completo usando la barra de simulación lateral:{' '}
                  <strong>(1) Crea una tarea</strong> como Meli / Analista y asígnale una plantilla de proceso obligatoria.{' '}
                  <strong>(2) Cambia de rol</strong> a un diseñador en el selector lateral, presiona <strong>Comenzar Tarea</strong> para activar el cronómetro, tilda los puntos del checklist y dale a <strong>Entregar</strong>.{' '}
                  <strong>(3) Vuelve al rol de Meli</strong> para ver las métricas consolidadas en el Panel de Rendimiento.
                </p>
              </div>

              <div className="flex gap-2 shrink-0 z-10 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowHowToUse(false)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer w-full sm:w-auto text-center"
                >
                  Entendido, ocultar
                </button>
              </div>
            </div>
          )}

          {/* Workspace Display conditional switch */}
          {isManagerOrAnalyst ? (
            <div className="space-y-6">
              
              {/* Context bar inside Admin */}
              <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Workspace: Portal Corporativo de Marketing</span>
                    <p className="text-[10px] text-slate-400 font-light">
                      Analiza esfuerzos de diseño e ingresa nuevas asignaciones de trabajo.
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleResetDatabase}
                  className="text-[10px] text-slate-500 hover:text-red-700 bg-slate-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition font-medium flex items-center gap-1 cursor-pointer"
                  title="Restablecer ejemplo base"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restablecer Base de Datos
                </button>
              </div>

              {/* Dashboard component */}
              <ManagerDashboard 
                tasks={tasks}
                designers={designers}
                analysts={analysts}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onUpdateDesigner={handleUpdateDesigner}
                onUpdateAnalyst={handleUpdateAnalyst}
              />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Active Designer dashboard */}
              <DesignerDashboard 
                designerId={currentUser}
                tasks={tasks}
                designers={designers}
                onStartTask={handleStartTask}
                onCompleteTask={handleCompleteTask}
                onCancelTaskTimer={handleCancelTaskTimer}
              />
            </div>
          )}

        </main>

        {/* Footer copyright section */}
        <footer className="bg-white border-t border-slate-250 py-4.5 text-center text-xs text-slate-400 shrink-0 select-none">
          <div className="px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <span>Diseñado para optimización de procesos de equipos de diseño</span>
              <Heart className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
            </div>
            <div>
              <span>Gestor Creativo &copy; 2026. Workspace Interno.</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
