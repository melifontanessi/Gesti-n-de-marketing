/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Designer, ChecklistItem, Analyst } from '../types';
import TaskForm from './TaskForm';
import { formatDuration, formatDate, formatTime } from '../utils';
import { Clock, CheckSquare, Play, AlertTriangle, Send, RefreshCw, Star, Ban, ExternalLink, HelpCircle, Bell, X, Check, Plus, Edit, Trash2, ClipboardList, CheckCircle2, UserCheck, User } from 'lucide-react';

interface DesignerDashboardProps {
  designerId: string;
  tasks: Task[];
  designers: Designer[];
  analysts: Analyst[];
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string, notes: string, checklist: ChecklistItem[]) => void;
  onCancelTaskTimer: (taskId: string) => void;
  onAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onEditTask: (id: string, updatedFields: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function DesignerDashboard({ 
  designerId, 
  tasks, 
  designers,
  analysts,
  onStartTask, 
  onCompleteTask, 
  onCancelTaskTimer,
  onAddTask,
  onEditTask,
  onDeleteTask
}: DesignerDashboardProps) {
  const activeDesigner = designers.find(d => d.id === designerId);

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Media': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };
  
  // Tabs state for Inhouse coordination
  const [designerTab, setDesignerTab] = useState<'my-tasks' | 'team-assignments'>('my-tasks');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Real-time ticker to make all active stopwatch elements clock up fluidly
  const [ticker, setTicker] = useState(Date.now());

  // Filter tasks specific to this designer
  const myTasks = tasks.filter(t => t.assigneeId === designerId);
  const pending = myTasks.filter(t => t.status === 'Pendiente');
  const inProgress = myTasks.filter(t => t.status === 'En Progreso');
  const completed = myTasks.filter(t => t.status === 'Completada');

  // Local state for active note taking and checklist completion
  const [activeNotes, setActiveNotes] = useState<{ [taskId: string]: string }>({});
  const [activeChecklists, setActiveChecklists] = useState<{ [taskId: string]: ChecklistItem[] }>({});

  // Notifications personal dismissed log
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`read_notif_${designerId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep in sync when designer switch occurs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`read_notif_${designerId}`);
      setReadNotificationIds(saved ? JSON.parse(saved) : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [designerId]);

  // Notifications criteria: tasks assigned to me that are pending and not dismissed
  const notifications = pending.filter(task => !readNotificationIds.includes(task.id));

  const handleDismissNotification = (taskId: string) => {
    const nextRead = [...readNotificationIds, taskId];
    setReadNotificationIds(nextRead);
    localStorage.setItem(`read_notif_${designerId}`, JSON.stringify(nextRead));
  };

  const handleClearAllNotifications = () => {
    const nextRead = [...readNotificationIds, ...pending.map(p => p.id)];
    setReadNotificationIds(nextRead);
    localStorage.setItem(`read_notif_${designerId}`, JSON.stringify(nextRead));
  };

  // Core ticker loop
  useEffect(() => {
    let intervalId: any = null;
    if (inProgress.length > 0) {
      intervalId = setInterval(() => {
        setTicker(Date.now());
      }, 1000);
    } else {
      setTicker(Date.now());
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [inProgress.length]);

  // Sync active checklists state when task goes into progress
  useEffect(() => {
    inProgress.forEach(task => {
      if (!activeChecklists[task.id]) {
        setActiveChecklists(prev => ({
          ...prev,
          [task.id]: [...task.checklist]
        }));
      }
    });
  }, [inProgress, activeChecklists]);

  const handleChecklistToggle = (taskId: string, stepId: string) => {
    const currentList = activeChecklists[taskId] || [];
    const updated = currentList.map(item => 
      item.id === stepId ? { ...item, completed: !item.completed } : item
    );
    setActiveChecklists(prev => ({
      ...prev,
      [taskId]: updated
    }));
  };

  const handleCompleteSubmit = (taskId: string) => {
    const notes = activeNotes[taskId] || '';
    const checklist = activeChecklists[taskId] || [];
    
    // Check if checklist is fully completed
    const incompleteCount = checklist.filter(item => !item.completed).length;
    if (incompleteCount > 0) {
      alert('⚠️ Para asegurar la calidad del proceso, debes marcar todos los puntos del checklist obligatorio antes de entregar.');
      return;
    }

    onCompleteTask(taskId, notes, checklist);
    
    // Clean local state
    setActiveNotes(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setActiveChecklists(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Wave header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center font-bold text-lg font-mono">
            {activeDesigner?.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              ¡Hola, {activeDesigner?.name}! 👋
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              Aquí está tu listado de prioridades. Al iniciar una tarea, activa el cronómetro para registrar tu esfuerzo.
            </p>
          </div>
        </div>

        {/* Contract stats */}
        <div className="flex gap-2.5">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Pendientes</span>
            <span className="text-base font-bold font-mono text-slate-800">{pending.length}</span>
          </div>
          <div className="bg-amber-100/50 border border-amber-200 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-amber-700 block font-semibold uppercase tracking-wider">Haciendo</span>
            <span className="text-base font-bold font-mono text-amber-800">{inProgress.length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-150 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-emerald-700 block font-semibold uppercase tracking-wider">Completadas</span>
            <span className="text-base font-bold font-mono text-emerald-800">{completed.length}</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher for Inhouse Coordinators */}
      {activeDesigner?.role === 'Inhouse' && (
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs max-w-max">
          <button
            onClick={() => {
              setDesignerTab('my-tasks');
              setIsAddingTask(false);
              setEditingTask(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              designerTab === 'my-tasks'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mis Tareas ({myTasks.length})</span>
          </button>
          
          <button
            onClick={() => setDesignerTab('team-assignments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              designerTab === 'team-assignments'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Asignar y Reasignar Equipo ({tasks.length})</span>
          </button>
        </div>
      )}

      {designerTab === 'my-tasks' ? (
        <>
          {/* Designer Notification Panel (Requirement 4) */}
          {notifications.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-600/5 to-transparent border border-indigo-200 p-5 rounded-2xl shadow-3xs space-y-3.5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-405 opacity-75 animate-sine"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                  <Bell className="w-4 h-4 text-indigo-600 animate-bounce" />
                  <span>Buzón de Notificaciones: Nuevas Tareas Asignadas ({notifications.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={handleClearAllNotifications}
                  className="text-[10px] bg-indigo-600 text-white font-semibold px-2.5 py-1 rounded-md hover:bg-indigo-700 hover:shadow-xs transition cursor-pointer"
                >
                  Marcar todas como leídas
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white border border-indigo-100 p-2.5 rounded-xl flex items-center justify-between gap-4 shadow-3xs hover:bg-slate-50/55 transition"
                  >
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <span className={`text-[9px] font-bold uppercase rounded-md px-1.5 py-0.5 border shrink-0 mt-0.5 ${getUrgencyBadgeColor(task.urgency)}`}>
                        {task.urgency}
                      </span>
                      <div className="truncate">
                        <span className="text-[11px] text-slate-500 block">Nueva asignación cargada en tu listado:</span>
                        <span className="text-xs text-indigo-950 font-bold block truncate font-sans">
                          "{task.title}"
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onStartTask(task.id);
                          handleDismissNotification(task.id);
                        }}
                        className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Iniciar ya</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissNotification(task.id)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Descartar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid: Columns of work */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: ACTIVE / IN-PROGRESS & PENDING queue */}
            <div className="space-y-6">
              
              {/* Section 1: ACTIVE (CRON RUNNING) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/15 p-3 rounded-xl max-w-max">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                  Cronómetros Activos ({inProgress.length})
                </h3>

                {inProgress.map(task => {
                  const checklist = activeChecklists[task.id] || task.checklist;
                  const pendingStepsCount = checklist.filter(item => !item.completed).length;
                  const elapsedMs = task.startTime ? ticker - task.startTime : 0;
                  const notes = activeNotes[task.id] || '';

                  return (
                    <div key={task.id} className="bg-white border-2 border-amber-400 rounded-2xl p-6 space-y-5 shadow-xs transition-all relative">
                      
                      {/* Stopwatch Badge */}
                      <div className="absolute -top-3.5 right-6 bg-slate-900 border border-slate-800 text-white font-mono font-bold text-xs px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>STOPWATCH: {formatDuration(elapsedMs, true)}</span>
                      </div>

                      {/* Header info */}
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700">
                          Urgencia {task.urgency}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-2.5">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-light leading-relaxed">
                          {task.description}
                        </p>
                        {(task.campaign || task.channel || task.contentType) && (
                          <div className="flex flex-wrap gap-1 mt-2 select-none text-[9px] font-bold">
                            {task.campaign && (
                              <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1.5 py-0.5 rounded-sm" title="Campaña">
                                📢 {task.campaign}
                              </span>
                            )}
                            {task.channel && (
                              <span className="bg-sky-50 border border-sky-150 text-sky-750 px-1.5 py-0.5 rounded-sm" title="Canal">
                                🌐 {task.channel}
                              </span>
                            )}
                            {task.contentType && (
                              <span className="bg-pink-50 border border-pink-150 text-pink-750 px-1.5 py-0.5 rounded-sm" title="Tipo de Contenido">
                                🎨 {task.contentType}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mandate Guidelines Process Checklist */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                          Procesos de Calidad Obligatorios:
                        </span>
                        <p className="text-[10px] text-slate-400 font-light mt-0.5 mb-3">
                          Asignados por marketing. Deben cumplirse al 100% antes de entregar.
                        </p>
                        
                        <div className="space-y-2">
                          {checklist.map(item => (
                            <label 
                              key={item.id} 
                              onClick={() => handleChecklistToggle(task.id, item.id)}
                              className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none transition"
                            >
                              <input 
                                type="checkbox" 
                                checked={item.completed}
                                onChange={() => {}} // Controlled via onClick on wrapper
                                className="translate-y-0.5 rounded-sm text-indigo-600 focus:ring-indigo-505 cursor-pointer"
                              />
                              <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {item.text}
                              </span>
                            </label>
                          ))}
                          {checklist.length === 0 && (
                            <span className="text-xs text-slate-400 font-light italic">
                              No se añadieron procesos obligatorios para esta orden.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes / Delivery box */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <label htmlFor={`notes-${task.id}`} className="text-xs font-semibold text-slate-700">
                          Notas de Entrega / Enlace (Drive, Figma)
                        </label>
                        <textarea
                          id={`notes-${task.id}`}
                          value={notes}
                          onChange={(e) => setActiveNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Coloca comentarios de entrega o enlace de Figma para que el manager o analista lo vea..."
                          rows={2}
                          className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition"
                        />
                      </div>

                      {/* Actions buttons */}
                      <div className="flex items-center justify-between border-t border-slate-100 border-dashed pt-4.5 gap-2.5">
                        <button
                          type="button"
                          onClick={() => onCancelTaskTimer(task.id)}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-slate-500 hover:text-red-650 hover:bg-slate-50 transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                          title="Pausar el tiempo"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Pausar / Ajustar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCompleteSubmit(task.id)}
                          disabled={pendingStepsCount > 0}
                          className={`px-4.5 py-2 rounded-lg text-[11px] font-black flex items-center gap-2 shadow-xs transition cursor-pointer grow justify-center ${
                            pendingStepsCount > 0
                              ? 'bg-slate-100 text-slate-400 border border-slate-205 cursor-not-allowed'
                              : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-500/20'
                          }`}
                          title={pendingStepsCount > 0 ? "Completa todos los ítems obligatorios antes de finalizar" : "Hacer click para frena la tarea ahora"}
                        >
                          <Check className="w-4 h-4 text-white" />
                          <span>
                            {pendingStepsCount > 0 
                              ? `Pendiente Checklist (${pendingStepsCount})` 
                              : '⏹ Botón 2: Finalizado (Frenar Tarea)'
                            }
                          </span>
                        </button>
                      </div>

                    </div>
                  );
                })}

                {inProgress.length === 0 && (
                  <div className="bg-indigo-50/50 border border-dashed border-indigo-200 text-center py-7 rounded-2xl">
                    <Clock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs text-indigo-900 font-semibold">No tienes ningún cronómetro corriendo.</p>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">
                      Elige una tarea de abajo y presiona "Comenzar Tarea" para medir tus tiempos.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 2: PENDING RECRUIT */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  Cola de Pendientes ({pending.length})
                </h3>

                <div className="space-y-3">
                  {pending.map(task => {
                    return (
                      <div key={task.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 space-y-4 shadow-2xs transition group">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border ${getUrgencyBadgeColor(task.urgency)}`}>
                            Prioridad {task.urgency}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Asignada el {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3 font-light leading-relaxed">
                            {task.description}
                          </p>
                          {(task.campaign || task.channel || task.contentType) && (
                            <div className="flex flex-wrap gap-1 mt-2 select-none text-[9px] font-bold">
                              {task.campaign && (
                                <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1.5 py-0.5 rounded-sm" title="Campaña">
                                  📢 {task.campaign}
                                </span>
                              )}
                              {task.channel && (
                                <span className="bg-sky-50 border border-sky-150 text-sky-750 px-1.5 py-0.5 rounded-sm" title="Canal">
                                  🌐 {task.channel}
                                </span>
                              )}
                              {task.contentType && (
                                <span className="bg-pink-50 border border-pink-150 text-pink-750 px-1.5 py-0.5 rounded-sm" title="Tipo de Contenido">
                                  🎨 {task.contentType}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Previews process requirements */}
                        <div className="text-[11px] text-indigo-600 bg-indigo-50/50 px-3 py-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                          <span>Proceso de control obligado:</span>
                          <strong className="font-semibold">{task.checklist.length} requisitos de entrega</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => onStartTask(task.id)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition ring-2 ring-indigo-500/10"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span>▶ Botón 1: Arrancar Tarea (Iniciar Tiempo)</span>
                        </button>
                      </div>
                    );
                  })}

                  {pending.length === 0 && (
                    <div className="bg-slate-50 border border-dashed border-slate-200 text-center py-7 rounded-xl">
                      <p className="text-xs text-slate-400 font-light italic">¡Libre! No tienes tareas pendientes asignadas.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Historical Finished Logs of this Designer */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl max-w-max">
                ✓ Historial de Entregas ({completed.length})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {completed.map(task => {
                  return (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 font-mono">
                            {formatDuration(task.durationMs || 0)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Fin: {formatDate(task.endTime || 0)}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 leading-snug">{task.title}</h4>
                        <p className="text-[11px] text-slate-405 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        {(task.campaign || task.channel || task.contentType) && (
                          <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[9px] font-bold">
                            {task.campaign && (
                              <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1.5 py-0 rounded-sm" title="Campaña">
                                📢 {task.campaign}
                              </span>
                            )}
                            {task.channel && (
                              <span className="bg-sky-50 border border-sky-150 text-sky-750 px-1.5 py-0 rounded-sm" title="Canal">
                                🌐 {task.channel}
                              </span>
                            )}
                            {task.contentType && (
                              <span className="bg-pink-50 border border-pink-150 text-pink-750 px-1.5 py-0 rounded-sm" title="Tipo de Contenido">
                                🎨 {task.contentType}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Checklist summary */}
                      <div className="text-[10px] text-slate-400 flex items-center justify-between py-1 bg-slate-50 px-2 rounded-md">
                        <span>Procesos cumplidos:</span>
                        <span className="font-semibold text-emerald-600 font-mono">
                          {task.checklist.filter(c => c.completed).length} / {task.checklist.length} pasos OK
                        </span>
                      </div>

                      {/* Notes submitted */}
                      {task.notes && (
                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/50 text-[11px] text-slate-600 font-light">
                          <strong className="font-semibold block text-[10px] text-slate-500 uppercase">Comentario enviado:</strong>
                          <span className="italic block mt-0.5 max-h-16 overflow-y-auto whitespace-pre-wrap">"{task.notes}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {completed.length === 0 && (
                  <div className="bg-slate-50 border border-dashed border-slate-200 text-center py-10 rounded-xl text-slate-400">
                    <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Aún no registraste entregas.</p>
                    <p className="text-[11px] font-light mt-0.5">
                      Tus tareas completadas con cronómetro se guardarán en este bloque.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Inhouse team allocations and assignment control (Requirement 1) */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Consola de Coordinación de Equipo (Canal In-house)
                </h3>
                <p className="text-xs text-slate-400 font-light tracking-wide max-w-[650px] leading-relaxed">
                  Tienes permisos habilitados de asignación y re-asignación. Puedes transferir cualquier tarea activa o pendiente a otro diseñador, editar especificaciones o dar de alta nuevos requerimientos operativos.
                </p>
              </div>
              {!isAddingTask && !editingTask && (
                <button
                  type="button"
                  onClick={() => setIsAddingTask(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-705 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition shrink-0 self-start sm:self-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear y Asignar Tarea</span>
                </button>
              )}
            </div>
          </div>

          {isAddingTask && (
            <div className="animate-in fade-in duration-200">
              <TaskForm 
                onSubmit={(taskData) => {
                  onAddTask(taskData);
                  setIsAddingTask(false);
                }} 
                onCancel={() => setIsAddingTask(false)}
                designers={designers}
                analysts={analysts}
              />
            </div>
          )}

          {editingTask && (
            <div className="animate-in fade-in duration-200">
              <TaskForm 
                onSubmit={(taskData) => {
                  onEditTask(editingTask.id, taskData);
                  setEditingTask(null);
                }} 
                onCancel={() => setEditingTask(null)}
                initialTask={editingTask}
                designers={designers}
                analysts={analysts}
              />
            </div>
          )}

          {!isAddingTask && !editingTask && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                
                <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-100/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-705 uppercase tracking-wider">
                    Planilla General de Trabajo del Equipo ({tasks.length} Tareas Totales)
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                    Modo Editor / Reasignador Activo
                  </span>
                </div>

                <div className="overflow-x-auto">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-light italic">
                      No hay tareas registradas en el sistema.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-4">Especificación / Tarea</th>
                          <th className="p-4">Prioridad</th>
                          <th className="p-4">Solicitado por</th>
                          <th className="p-4">Gestión de Asignación / Diseñador</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {tasks.map(task => {
                          const currDesigner = designers.find(d => d.id === task.assigneeId);
                          const currAnalyst = analysts.find(a => a.id === task.creatorId) || analysts[0];
                          
                          return (
                            <tr key={task.id} className="hover:bg-slate-50/40 transition">
                              
                              <td className="p-4 max-w-sm">
                                <span className="font-bold text-slate-800 block text-xs leading-snug">{task.title}</span>
                                <span className="text-[11px] text-slate-400 font-light mt-1 block line-clamp-2">
                                  {task.description}
                                </span>
                                {(task.campaign || task.channel || task.contentType) && (
                                  <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[9px] font-bold">
                                    {task.campaign && (
                                      <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1.5 py-0.5 rounded-sm" title="Campaña">
                                        📢 {task.campaign}
                                      </span>
                                    )}
                                    {task.channel && (
                                      <span className="bg-sky-50 border border-sky-150 text-sky-750 px-1.5 py-0.5 rounded-sm" title="Canal">
                                        🌐 {task.channel}
                                      </span>
                                    )}
                                    {task.contentType && (
                                      <span className="bg-pink-50 border border-pink-150 text-pink-750 px-1.5 py-0.5 rounded-sm" title="Tipo de Contenido">
                                        🎨 {task.contentType}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <span className="text-[10px] text-indigo-650 font-medium block mt-1">
                                  ✓ Contiene {task.checklist.length} procesos obligatorios
                                </span>
                              </td>

                              <td className="p-4 whitespace-nowrap">
                                <span className={`text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border ${getUrgencyBadgeColor(task.urgency)}`}>
                                  {task.urgency}
                                </span>
                              </td>

                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-medium text-slate-650">
                                  <User className="w-3.5 h-3.5 text-slate-450" />
                                  <span>{currAnalyst ? currAnalyst.name : 'Meli Fontanessi'}</span>
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${currDesigner?.avatarColor || 'bg-slate-200 text-slate-650'}`}>
                                      {(currDesigner?.name || 'S').charAt(0)}
                                    </span>
                                    <span className="font-semibold text-slate-800">{currDesigner?.name || 'Sin Asignar'}</span>
                                  </div>

                                  {/* Dynamic Assignee/Re-assignee dropdown */}
                                  <div className="flex items-center gap-1">
                                    <select
                                      aria-label="Reasignar Diseñador"
                                      value={task.assigneeId}
                                      onChange={(e) => {
                                        onEditTask(task.id, { assigneeId: e.target.value });
                                      }}
                                      className="bg-white border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-[11px] text-slate-700 font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer block w-full max-w-[185px] leading-none"
                                    >
                                      <option value="" disabled>Asignar a otro diseñador</option>
                                      {designers.map(d => (
                                        <option key={d.id} value={d.id}>
                                          {d.name} ({d.role})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 whitespace-nowrap">
                                <span className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1 border ${
                                  task.status === 'Completada'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                    : task.status === 'En Progreso'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                      : 'bg-slate-50 text-slate-500 border-slate-250'
                                }`}>
                                  {task.status}
                                </span>
                              </td>

                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTask(task)}
                                    className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-850 rounded-lg transition cursor-pointer"
                                    title="Editar especificaciones de la tarea"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('¿Deseas eliminar permanentemente esta tarea?')) {
                                        onDeleteTask(task.id);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-red-50 text-red-550 hover:text-red-700 rounded-lg transition cursor-pointer"
                                    title="Eliminar tarea"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
