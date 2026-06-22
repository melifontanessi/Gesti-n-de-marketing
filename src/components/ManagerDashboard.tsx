/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Designer, Analyst } from '../types';
import TaskForm from './TaskForm';
import AnalyticsView from './AnalyticsView';
import { formatDuration, formatDate, formatTime } from '../utils';
import { Plus, ListTodo, BarChart3, AlertCircle, Edit, Trash2, Clock, CheckCircle2, User, Eye, Activity, Users, UserCog } from 'lucide-react';

interface ManagerDashboardProps {
  tasks: Task[];
  designers: Designer[];
  analysts: Analyst[];
  onAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onEditTask: (id: string, updated: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateDesigner: (id: string, updatedFields: Partial<Designer>) => void;
  onUpdateAnalyst: (id: string, updatedFields: Partial<Analyst>) => void;
}

export default function ManagerDashboard({ 
  tasks, 
  designers,
  analysts,
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onUpdateDesigner,
  onUpdateAnalyst
}: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'analytics' | 'team'>('board');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Quick status counters
  const pending = tasks.filter(t => t.status === 'Pendiente');
  const inProgress = tasks.filter(t => t.status === 'En Progreso');
  const completed = tasks.filter(t => t.status === 'Completada');

  const handleCreateSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    onAddTask(taskData);
    setIsAddingTask(false);
  };

  const handleEditSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    if (editingTask) {
      onEditTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const getCreatorName = (creatorId?: string) => {
    if (!creatorId) return 'Meli Fontanessi';
    const analyst = analysts.find(a => a.id === creatorId);
    return analyst ? analyst.name : 'Meli Fontanessi';
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Media': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top operational controls and Tabs toggling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-200 gap-4">
        
        {/* Tab triggers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 max-w-max">
          <button
            id="tab-btn-board"
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tablero de Tareas ({tasks.length})</span>
          </button>
          <button
            id="tab-btn-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Panel Rendimiento (Analíticas)</span>
          </button>
          <button
            id="tab-btn-team"
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipo y Analistas ({designers.length + analysts.length})</span>
          </button>
        </div>

        {/* Action: Open Task Creation form */}
        {activeTab === 'board' && !isAddingTask && !editingTask && (
          <button
            id="btn-create-task-trigger"
            onClick={() => setIsAddingTask(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear y Asignar Tarea</span>
          </button>
        )}

      </div>

      {/* Task Creation / Editing Area */}
      {isAddingTask && (
        <div className="animate-in fade-in duration-200">
          <TaskForm 
            onSubmit={handleCreateSubmit} 
            onCancel={() => setIsAddingTask(false)} 
            designers={designers}
            analysts={analysts}
          />
        </div>
      )}

      {editingTask && (
        <div className="animate-in fade-in duration-200">
          <TaskForm 
            onSubmit={handleEditSubmit} 
            onCancel={() => setEditingTask(null)}
            initialTask={editingTask}
            designers={designers}
            analysts={analysts}
          />
        </div>
      )}

      {/* Primary Workspace layout */}
      {activeTab === 'board' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Pendiente (Queue) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-100 border border-slate-200/60 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full" />
                Pendientes ({pending.length})
              </span>
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
                Por tomar
              </span>
            </div>

            <div className="space-y-3">
              {pending.map(task => {
                const designer = designers.find(d => d.id === task.assigneeId);
                const stepsCompleted = task.checklist.filter(c => c.completed).length;
                
                return (
                  <div key={task.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4.5 space-y-3.5 shadow-xs transition group">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadgeColor(task.urgency)}`}>
                        {task.urgency}
                      </span>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-light">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium select-none">
                        <span className="font-light">Soli. por:</span>
                        <span className="font-semibold text-slate-500">{getCreatorName(task.creatorId)}</span>
                      </div>
                    </div>

                    {/* Progress tracking indicator */}
                    <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${designer?.avatarColor}`}>
                          {designer?.name.split(' ').map(n=>n[0]).join('')}
                        </span>
                        <span className="font-semibold">{designer?.name}</span>
                      </div>
                      <span className="text-slate-400">
                        {stepsCompleted}/{task.checklist.length} procesos
                      </span>
                    </div>
                  </div>
                );
              })}

              {pending.length === 0 && (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 font-light italic">No hay tareas pendientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: En Progreso (Active Executing) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <span className="text-xs font-bold text-amber-600 tracking-wide uppercase flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                En Ejecución ({inProgress.length})
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                Cronómetro ON
              </span>
            </div>

            <div className="space-y-3">
              {inProgress.map(task => {
                const designer = designers.find(d => d.id === task.assigneeId);
                const stepsCompleted = task.checklist.filter(c => c.completed).length;
                
                // Show how long ago it was started
                const elapsedMs = task.startTime ? Date.now() - task.startTime : 0;
                
                return (
                  <div key={task.id} className="bg-white border-2 border-amber-400 rounded-xl p-4.5 space-y-3.5 shadow-sm relative group">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadgeColor(task.urgency)}`}>
                        {task.urgency}
                      </span>
                      
                      {/* Active tag info */}
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 font-mono">
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                        Corriendo
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-light">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium select-none">
                        <span className="font-light">Soli. por:</span>
                        <span className="font-semibold text-slate-550">{getCreatorName(task.creatorId)}</span>
                      </div>
                    </div>

                    {/* Progress tracking indicator */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${designer?.avatarColor}`}>
                            {designer?.name.split(' ').map(n=>n[0]).join('')}
                          </span>
                          <span className="font-semibold">{designer?.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono">
                          {stepsCompleted}/{task.checklist.length} procesos ({Math.round((stepsCompleted / (task.checklist.length || 1)) * 100)}%)
                        </span>
                      </div>
                      
                      {/* Step visual mini bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300" 
                          style={{ width: `${(stepsCompleted / (task.checklist.length || 1)) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-100/80 px-2.5 py-1.5 rounded-lg text-[10px] text-amber-800 font-medium">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Inició a las: {formatTime(task.startTime)} hs</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {inProgress.length === 0 && (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 font-light italic">No hay diseñadores ejecutando tareas en este momento.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Completada (Done Log) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Entregadas ({completed.length})
              </span>
              <span className="text-[10px] text-emerald-600 bg-white border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Historias
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {completed.map(task => {
                const designer = designers.find(d => d.id === task.assigneeId);
                return (
                  <div key={task.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs group">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-bold font-mono">
                        ✓ {formatDuration(task.durationMs || 0)}
                      </span>
                      {/* Delete logging optionally */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Eliminar del histórico"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 line-through decoration-slate-300 leading-snug">{task.title}</h4>
                      {task.notes && (
                        <p className="text-[11px] text-slate-500 mt-1.5 bg-white p-2 rounded-lg border border-slate-200/50 italic line-clamp-2">
                          "{task.notes}"
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-450 font-medium select-none">
                        <span className="font-light">Soli. por:</span>
                        <span className="font-semibold text-slate-500">{getCreatorName(task.creatorId)}</span>
                      </div>
                    </div>

                    {/* Meta info bottom */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/50 pt-2.5">
                      <div className="flex items-center gap-1">
                        <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${designer?.avatarColor}`}>
                          {designer?.name.split(' ').map(n=>n[0]).join('')}
                        </span>
                        <span>{designer?.name}</span>
                      </div>
                      <span className="font-mono text-[10px]">
                        {formatTime(task.endTime)} hs
                      </span>
                    </div>
                  </div>
                );
              })}

              {completed.length === 0 && (
                <div className="text-center py-10 bg-slate-100 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 font-light italic">No hay tareas entregadas todavía.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : activeTab === 'analytics' ? (
        <div className="animate-in fade-in duration-300">
          <AnalyticsView tasks={tasks} designers={designers} />
        </div>
      ) : (
        <div className="animate-in fade-in duration-300 space-y-8 max-w-4xl mx-auto pb-10">
          
          {/* Section 1: Marketing Analysts (Solicitantes de tareas) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
              <UserCog className="w-5 h-5 text-indigo-600" />
              <span>Analistas de Marketing (Solicitantes)</span>
            </h3>
            <p className="text-xs text-slate-500 font-light mb-6">
              Colaboradores y analistas con permiso directo para cargar y asignar tareas de diseño de marketing. Edita sus perfiles en tiempo real.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysts.map((analyst) => (
                <AnalystEditCard 
                  key={analyst.id}
                  analyst={analyst}
                  onUpdate={onUpdateAnalyst}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Designers team */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Equipo de Diseño</span>
            </h3>
            <p className="text-xs text-slate-500 font-light mb-6">
              Edita el nombre y datos de los integrantes del equipo creativo. Los cambios se actualizarán automáticamente en todo el sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {designers.map((designer) => {
                const currentActiveTask = tasks.find(t => t.assigneeId === designer.id && t.status === 'En Progreso');
                const pendingTasksCount = tasks.filter(t => t.assigneeId === designer.id && t.status === 'Pendiente').length;
                const completedTasksCount = tasks.filter(t => t.assigneeId === designer.id && t.status === 'Completada').length;
                
                return (
                  <DesignerEditCard 
                    key={designer.id}
                    designer={designer}
                    activeTaskTitle={currentActiveTask?.title}
                    pendingCount={pendingTasksCount}
                    completedCount={completedTasksCount}
                    onUpdate={onUpdateDesigner}
                  />
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

interface DesignerEditCardProps {
  key?: string;
  designer: Designer;
  activeTaskTitle?: string;
  pendingCount: number;
  completedCount: number;
  onUpdate: (id: string, updated: Partial<Designer>) => void;
}

function DesignerEditCard({ designer, activeTaskTitle, pendingCount, completedCount, onUpdate }: DesignerEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(designer.name);
  const [editedEmail, setEditedEmail] = useState(designer.email);
  const [editedRole, setEditedRole] = useState(designer.role);

  const handleSave = () => {
    if (!editedName.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }
    onUpdate(designer.id, {
      name: editedName.trim(),
      email: editedEmail.trim(),
      role: editedRole
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(designer.name);
    setEditedEmail(designer.email);
    setEditedRole(designer.role);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition shadow-2xs relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        
        {/* Designer information */}
        <div className="flex items-center gap-3 w-full">
          <div className={`w-11 h-11 ${designer.avatarColor} font-bold text-sm flex items-center justify-center shrink-0 rounded-full`}>
            {designer.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="grow min-w-0">
            {isEditing ? (
              <div className="space-y-2.5 w-full">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="Nombre del Diseñador"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full text-[11px] text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Tipo de Contrato</label>
                  <select
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value as any)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="Inhouse">In-house (Fijo corporativo)</option>
                    <option value="Freelance">Freelance (Por horas)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="truncate">
                <span className="text-sm font-bold text-slate-800 block truncate">{designer.name}</span>
                <span className="text-xs text-slate-500 block truncate">{designer.email}</span>
                <span className={`inline-block text-[9px] font-bold mt-1.5 px-2 py-0.5 rounded-md ${
                  designer.role === 'Inhouse' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {designer.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit controls */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[10px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0"
          >
            Editar Info
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shadow-xs"
          >
            Guardar
          </button>
        </div>
      ) : (
        <div className="border-t border-slate-200/60 pt-3 flex flex-col gap-2">
          
          {/* Status workload label */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-light">Estado actual:</span>
            {activeTaskTitle ? (
              <span className="text-green-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Trabajando en un proceso
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Disponible</span>
            )}
          </div>

          {/* Active task details if working */}
          {activeTaskTitle && (
            <div className="bg-green-50 border border-green-100 p-2 rounded-lg text-[10px] text-green-800 font-medium italic line-clamp-1">
              "{activeTaskTitle}"
            </div>
          )}

          {/* Metrics snippet */}
          <div className="grid grid-cols-2 gap-2 text-center text-slate-500 text-[10px] pt-1">
            <div className="bg-white/65 p-1.5 rounded-lg border border-slate-200/50">
              <span className="block text-slate-400 text-[8px] font-bold uppercase tracking-wider">Pendientes</span>
              <span className="text-xs font-bold text-slate-700">{pendingCount}</span>
            </div>
            <div className="bg-white/65 p-1.5 rounded-lg border border-slate-200/50">
              <span className="block text-slate-400 text-[8px] font-bold uppercase tracking-wider">Históricas</span>
              <span className="text-xs font-bold text-slate-700">{completedCount}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

interface AnalystEditCardProps {
  key?: string;
  analyst: Analyst;
  onUpdate: (id: string, updated: Partial<Analyst>) => void;
}

function AnalystEditCard({ analyst, onUpdate }: AnalystEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(analyst.name);
  const [editedEmail, setEditedEmail] = useState(analyst.email);
  const [editedRole, setEditedRole] = useState(analyst.role);

  const handleSave = () => {
    if (!editedName.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }
    onUpdate(analyst.id, {
      name: editedName.trim(),
      email: editedEmail.trim(),
      role: editedRole.trim()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(analyst.name);
    setEditedEmail(analyst.email);
    setEditedRole(analyst.role);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition shadow-2xs relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 w-full">
          <div className={`w-11 h-11 ${analyst.avatarColor} font-bold text-sm flex items-center justify-center shrink-0 rounded-full`}>
            {analyst.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="grow min-w-0">
            {isEditing ? (
              <div className="space-y-2.5 w-full">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full text-[11px] text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Cargo / Puesto</label>
                  <input
                    type="text"
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            ) : (
              <div className="truncate">
                <span className="text-sm font-bold text-slate-800 block truncate">{analyst.name}</span>
                <span className="text-xs text-slate-500 block truncate">{analyst.email}</span>
                <span className="inline-block text-[9px] font-bold mt-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                  {analyst.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[10px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0"
          >
            Editar Info
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shadow-xs"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
