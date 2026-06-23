/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Designer, Analyst, TaskUrgency, ChecklistItem, TaskStatus } from '../types';
import TaskForm from './TaskForm';
import AnalyticsView from './AnalyticsView';
import { formatDuration, formatDate, formatTime, parseCSVorTSV } from '../utils';
import { TEMPLATES } from '../initialData';
import { Plus, ListTodo, BarChart3, AlertCircle, Edit, Trash2, Clock, CheckCircle2, User, Eye, Activity, Users, UserCog, Upload, X, ArrowRight, CheckSquare, Download, FileSpreadsheet, ClipboardList, Home } from 'lucide-react';

interface ManagerDashboardProps {
  tasks: Task[];
  designers: Designer[];
  analysts: Analyst[];
  onAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onEditTask: (id: string, updated: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateDesigner: (id: string, updatedFields: Partial<Designer>) => void;
  onUpdateAnalyst: (id: string, updatedFields: Partial<Analyst>) => void;
  onAddDesigner: (newDesigner: Omit<Designer, 'id'>) => void;
  onDeleteDesigner: (id: string) => void;
  onAddAnalyst: (newAnalyst: Omit<Analyst, 'id'>) => void;
  onDeleteAnalyst: (id: string) => void;
}

export default function ManagerDashboard({ 
  tasks, 
  designers,
  analysts,
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onUpdateDesigner,
  onUpdateAnalyst,
  onAddDesigner,
  onDeleteDesigner,
  onAddAnalyst,
  onDeleteAnalyst
}: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'analytics' | 'team' | 'weekly'>('board');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [copiedReport, setCopiedReport] = useState(false);

  // Download Report function
  const handleDownloadReport = () => {
    const headers = [
      'Título de Tarea',
      'Descripción / Especificaciones',
      'Prioridad / Urgencia',
      'Diseñador Asignado',
      'Rol de Diseñador',
      'Estado Actual',
      'Fecha de Creación',
      'Tiempo Registrado (Cronómetro)',
      'Avance Checklist (Procesos)',
      'Comentarios de Entrega / Notas'
    ];

    const rows = tasks.map(task => {
      const designer = designers.find(d => d.id === task.assigneeId);
      const designerName = designer ? designer.name : 'Sin asignar';
      const designerRole = designer ? designer.role : '';
      
      const dateStr = formatDate(task.createdAt);
      const durationStr = task.status === 'Completada' 
        ? formatDuration(task.durationMs || 0) 
        : task.status === 'En Progreso' 
          ? 'En ejecución (Ver cronómetro activo)' 
          : '0m';
          
      const stepsCompleted = task.checklist.filter(c => c.completed).length;
      const progressStr = `${stepsCompleted} de ${task.checklist.length} pasos`;
      const cleanDescription = (task.description || '').replace(/"/g, '""');
      const cleanTitle = (task.title || '').replace(/"/g, '""');
      const cleanNotes = (task.notes || '').replace(/"/g, '""');

      return [
        `"${cleanTitle}"`,
        `"${cleanDescription}"`,
        `"${task.urgency}"`,
        `"${designerName}"`,
        `"${designerRole}"`,
        `"${task.status}"`,
        `"${dateStr}"`,
        `"${durationStr}"`,
        `"${progressStr}"`,
        `"${cleanNotes}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Add UTF-8 BOM to ensure Excel reads Spanish marks correctly
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const now = new Date();
    const dateSuffix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    link.setAttribute('download', `reporte_weeklys_marketing_${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const compileMarkdownReportOutput = (): string => {
    const completedTasks = tasks.filter(t => t.status === 'Completada');
    const doingTasks = tasks.filter(t => t.status === 'En Progreso');
    const pendingTasks = tasks.filter(t => t.status === 'Pendiente');
    
    let totalTimeMs = completedTasks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
    const formattedHours = (totalTimeMs / 3600000).toFixed(1);

    let md = `# 📋 REPORTE SEMANAL DE MARKETING - GANTRY & DISEÑO\n`;
    md += `Fecha de generación: ${new Date().toLocaleDateString()}\n\n`;
    md += `## 🚀 MÉTRICAS DE LA SEMANA\n`;
    md += `- **Entregas Finalizadas:** ${completedTasks.length} requerimientos cerrados\n`;
    md += `- **Esfuerzo Acumulado:** ${formattedHours} hs reloj cronómetro registradas\n`;
    md += `- **Tareas en Proceso Activo:** ${doingTasks.length} pendientes de entrega\n`;
    md += `- **Fila de Espera (Backlog):** ${pendingTasks.length} ítems listados\n\n`;
    
    md += `## ✓ ENTREGAS CUMPLIDAS (COMPLETADAS)\n`;
    if (completedTasks.length === 0) {
      md += `_No se registraron entregas en este ciclo._\n`;
    } else {
      completedTasks.forEach((t, index) => {
        const designer = designers.find(d => d.id === t.assigneeId);
        const timeStr = formatDuration(t.durationMs || 0);
        md += `${index + 1}. **${t.title}**\n`;
        md += `   - **Encargado:** ${designer ? designer.name : 'Sin asignar'}\n`;
        md += `   - **Tiempo de producción:** ${timeStr}\n`;
        if (t.notes) md += `   - **Notas/Enlaces de Entrega:** ${t.notes}\n`;
        md += `\n`;
      });
    }

    md += `## ⏳ EN PROCESO (CRONÓMETRO CORRIENDO)\n`;
    if (doingTasks.length === 0) {
      md += `_No hay tareas activas en este momento._\n`;
    } else {
      doingTasks.forEach((t, index) => {
        const designer = designers.find(d => d.id === t.assigneeId);
        md += `- [ ] **${t.title}** (${designer ? designer.name : 'Sin asignar'}) - _Urgencia: ${t.urgency}_\n`;
      });
    }

    return md;
  };

  const handleCopyReport = () => {
    const content = compileMarkdownReportOutput();
    navigator.clipboard.writeText(content).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }).catch(() => {
      alert('No se pudo copiar automáticamente. Puedes seleccionar el reporte en el recuadro de abajo para copiarlo manualmente.');
    });
  };
  
  // User Management State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newType, setNewType] = useState<'designer' | 'analyst'>('designer');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newDesignerRole, setNewDesignerRole] = useState<'Inhouse' | 'Freelance'>('Inhouse');
  const [newAnalystRoleText, setNewAnalystRoleText] = useState('Analista de Marketing');
  const [newUserColor, setNewUserColor] = useState('bg-indigo-500 text-white');

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Por favor, completa el nombre y el correo.');
      return;
    }

    if (newType === 'designer') {
      onAddDesigner({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newDesignerRole,
        avatarColor: newUserColor
      });
    } else {
      onAddAnalyst({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newAnalystRoleText.trim(),
        avatarColor: newUserColor
      });
    }

    // Reset fields
    setNewUserName('');
    setNewUserEmail('');
    setNewDesignerRole('Inhouse');
    setNewAnalystRoleText('Analista de Marketing');
    setIsAddingUser(false);
  };
  
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
          
          <button
            id="tab-btn-weekly"
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Reporte Weeklys ✨</span>
          </button>
        </div>

        {/* Action: Open Task Creation or Sheets Import */}
        {activeTab === 'board' && !isAddingTask && !isImporting && !editingTask && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-import-sheets-trigger"
              onClick={() => setIsImporting(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-755 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Levantar Google Sheets / CSV</span>
            </button>
            <button
              id="btn-create-task-trigger"
              onClick={() => setIsAddingTask(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Crear y Asignar Tarea</span>
            </button>
          </div>
        )}

      </div>

      {/* Home/Back Operational Controller when editing/adding/importing (Requirement 3) */}
      {(isAddingTask || isImporting || editingTask) && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-xl shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-slate-500 animate-pulse" />
            <div className="text-[11.5px] text-slate-600 font-medium">
              Estas cargando o editando tareas. Una vez que termines, presiona para volver.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAddingTask(false);
              setIsImporting(false);
              setEditingTask(null);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl hover:shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Volver al Tablero General (Inicio)</span>
          </button>
        </div>
      )}

      {/* Sheets / CSV Import Panel */}
      {isImporting && (
        <div className="animate-in fade-in duration-200">
          <TaskImporter 
            designers={designers} 
            analysts={analysts}
            onImport={(compiledImportList) => {
              compiledImportList.forEach(task => onAddTask(task));
              setIsImporting(false);
            }} 
            onCancel={() => setIsImporting(false)} 
          />
        </div>
      )}

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
                      {(task.campaign || task.channel || task.contentType) && (
                        <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[9px] font-bold">
                          {task.campaign && (
                            <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1 py-0.5 rounded-sm" title="Campaña">
                              📢 {task.campaign}
                            </span>
                          )}
                          {task.channel && (
                            <span className="bg-sky-50 border border-sky-150 text-sky-750 px-1 py-0.5 rounded-sm" title="Canal">
                              🌐 {task.channel}
                            </span>
                          )}
                          {task.contentType && (
                            <span className="bg-pink-50 border border-pink-150 text-pink-750 px-1 py-0.5 rounded-sm" title="Tipo de Contenido">
                              🎨 {task.contentType}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium select-none">
                        <span className="font-light">Soli. por:</span>
                        <span className="font-semibold text-slate-500">{getCreatorName(task.creatorId)}</span>
                      </div>
                    </div>

                    {/* Progress tracking indicator */}
                    <div className="space-y-2 text-[11px] border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${designer?.avatarColor}`}>
                            {designer?.name.split(' ').map(n=>n[0]).join('')}
                          </span>
                          <span className="font-semibold">{designer?.name}</span>
                        </div>
                        <span className="text-slate-400 font-medium">
                          {stepsCompleted}/{task.checklist.length} procesos
                        </span>
                      </div>
                      
                      {/* Quick reassign tool */}
                      <div className="flex items-center justify-between gap-1 border border-slate-200/60 bg-slate-50/70 p-1.5 rounded-lg text-[10px]">
                        <span className="text-slate-500">Reasignar a:</span>
                        <select
                          aria-label="Reasignar tarea"
                          value={task.assigneeId}
                          onChange={(e) => onEditTask(task.id, { assigneeId: e.target.value })}
                          className="bg-white border border-slate-250 rounded-sm text-[10px] py-0.5 px-2 text-slate-705 font-bold focus:ring-1 focus:ring-indigo-505 max-w-[140px] cursor-pointer"
                        >
                          {designers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
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
                      {(task.campaign || task.channel || task.contentType) && (
                        <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[9px] font-bold">
                          {task.campaign && (
                            <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1 py-0.5 rounded-sm" title="Campaña">
                              📢 {task.campaign}
                            </span>
                          )}
                          {task.channel && (
                            <span className="bg-sky-50 border border-sky-150 text-sky-750 px-1 py-0.5 rounded-sm" title="Canal">
                              🌐 {task.channel}
                            </span>
                          )}
                          {task.contentType && (
                            <span className="bg-pink-50 border border-pink-150 text-pink-750 px-1 py-0.5 rounded-sm" title="Tipo de Contenido">
                              🎨 {task.contentType}
                            </span>
                          )}
                        </div>
                      )}
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
                      
                      {/* Active quick transfer tool */}
                      <div className="flex items-center justify-between gap-1.5 border border-amber-200 bg-amber-50/50 p-1.5 rounded-lg text-[10px]">
                        <span className="text-amber-805 font-semibold">Traspasar a:</span>
                        <select
                          aria-label="Transferir tarea"
                          value={task.assigneeId}
                          onChange={(e) => {
                            // If reassigning, keep status but transfer ownership
                            onEditTask(task.id, { assigneeId: e.target.value });
                          }}
                          className="bg-white border border-slate-250 rounded-sm text-[10px] py-0.5 px-2 text-slate-705 font-bold focus:ring-1 focus:ring-indigo-505 max-w-[140px] cursor-pointer"
                        >
                          {designers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
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
                      {(task.campaign || task.channel || task.contentType) && (
                        <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[9px] font-bold">
                          {task.campaign && (
                            <span className="bg-indigo-50 border border-indigo-200 text-indigo-750 px-1 py-0.5 rounded-sm" title="Campaña">
                              📢 {task.campaign}
                            </span>
                          )}
                          {task.channel && (
                            <span className="bg-sky-50 border border-sky-150 text-sky-755 px-1 py-0.5 rounded-sm" title="Canal">
                              🌐 {task.channel}
                            </span>
                          )}
                          {task.contentType && (
                            <span className="bg-pink-50 border border-pink-150 text-pink-755 px-1 py-0.5 rounded-sm" title="Tipo de Contenido">
                              🎨 {task.contentType}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-455 font-medium select-none">
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
      ) : activeTab === 'weekly' ? (
        <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-10">
          
          {/* Header Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400 animate-bounce" />
                  Consola de Estado para Reuniones de Weeklys
                </h3>
                <p className="text-xs text-slate-400 font-light max-w-2xl leading-relaxed">
                  Optimiza tus reuniones semanales descargando listados completos compatibles con Excel / Google Sheets o copia un resumen de texto formateado en Markdown para pegar en los canales Slack, Teams o e-mails de reporte.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Excel / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className={`px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition shrink-0 ${copiedReport ? 'bg-indigo-500 font-extrabold' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'}`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>{copiedReport ? '¡Copiado!' : 'Copiar Resumen'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bento metrics counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Entregas Realizadas</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {tasks.filter(t => t.status === 'Completada').length}
                </span>
                <span className="text-xs font-semibold text-emerald-600">Completas</span>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-1.5">Tareas finalizadas este período.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Horas Acumuladas</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-indigo-600 font-mono">
                  {(tasks.filter(t => t.status === 'Completada').reduce((acc, t) => acc + (t.durationMs || 0), 0) / 3600000).toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-indigo-500">Horas</span>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-1.5">Tiempo medido por cronómetros.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">En Progreso Activo</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-600 font-mono">
                  {tasks.filter(t => t.status === 'En Progreso').length}
                </span>
                <span className="text-xs font-semibold text-amber-500 font-sans">Activas</span>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-1.5">Diseñadores con cronómetro activo.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Calidad de Procesos</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-600 font-mono">
                  {(() => {
                    const finished = tasks.filter(t => t.status === 'Completada');
                    if (finished.length === 0) return '100';
                    const ticks = finished.reduce((acc, t) => acc + t.checklist.filter(c => c.completed).length, 0);
                    const total = finished.reduce((acc, t) => acc + t.checklist.length, 0);
                    return total === 0 ? '100' : Math.round((ticks / total) * 100).toString();
                  })()}%
                </span>
                <span className="text-xs font-semibold text-emerald-500">Ok</span>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-1.5">Procesos de control superados.</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual preview list on the left (2/3 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vistazo de Entregables para la Reunión</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md font-bold">Planilla Actualizada</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-150">
                        <th className="p-4">Tarea / Título</th>
                        <th className="p-4">Encargado</th>
                        <th className="p-4">Tiempo</th>
                        <th className="p-4">Procesos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {tasks.map(task => {
                        const ds = designers.find(d => d.id === task.assigneeId);
                        return (
                          <tr key={task.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 max-w-xs">
                              <span className="font-bold text-slate-800 block line-clamp-1">{task.title}</span>
                              <span className="text-[10px] text-slate-400 font-light mt-0.5 block line-clamp-1">{task.description}</span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center bg-slate-200 text-slate-800">
                                  {ds?.name.charAt(0)}
                                </span>
                                <span className="font-medium">{ds?.name || 'Sin Asignar'}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-[11px] whitespace-nowrap">
                              {task.status === 'Completada' ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-250 font-bold px-2 py-0.5 rounded-md">
                                  {formatDuration(task.durationMs || 0)}
                                </span>
                              ) : task.status === 'En Progreso' ? (
                                <span className="text-amber-805 bg-amber-50 border border-amber-250 font-bold px-2 py-0.5 rounded-md animate-pulse">
                                  Corriendo...
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap text-slate-550">
                              <span className="font-semibold font-mono text-[11px]">
                                {task.checklist.filter(c => c.completed).length} / {task.checklist.length} ok
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {tasks.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-slate-400 italic">No hay tareas cargadas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Live Markdown output block on the right (1/3 column) */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden text-white h-full flex flex-col justify-between">
                
                <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Markdown compilado</span>
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-250 px-2.5 py-1 rounded-md transition font-bold"
                  >
                    {copiedReport ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="p-4 font-mono text-[10px] leading-relaxed select-all overflow-y-auto max-h-[350px] whitespace-pre-wrap text-slate-350 grow">
                  {compileMarkdownReportOutput()}
                </div>

                <div className="p-4.5 bg-slate-950/80 border-t border-slate-850/50 text-center">
                  <p className="text-[10px] text-slate-500 font-light leading-snug">
                    Pulsa "Copiar" arriba para copiar este resumen listo para Slack o mail.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="animate-in fade-in duration-300 space-y-8 max-w-4xl mx-auto pb-10">
          
          {/* BLOQUE DE GESTIÓN Y CREACIÓN DE USUARIOS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sidebar-border pb-4 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-indigo-600" />
                  <span>Panel de Control: Gestión de Usuarios</span>
                </h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Registra nuevas personas en el simulador u organiza el equipo de analistas y creadores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingUser(!isAddingUser)}
                className={`text-xs px-4 py-2 rounded-xl font-bold cursor-pointer transition ${
                  isAddingUser 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {isAddingUser ? 'Cerrar Formulario' : '➕ Agregar Nuevo Usuario'}
              </button>
            </div>

            {/* Create user form */}
            {isAddingUser && (
              <form onSubmit={handleCreateUserSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-255">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registrar Nuevo Perfil en el Simulador</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de Usuario */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Tipo de Usuario / Rol</label>
                    <select
                      value={newType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNewType(val);
                        if (val === 'analyst') {
                          setNewUserColor('bg-violet-500 text-white');
                        } else {
                          setNewUserColor('bg-indigo-500 text-white');
                        }
                      }}
                      className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    >
                      <option value="designer">Diseñador (Ejecutor de piezas)</option>
                      <option value="analyst">Analista de Marketing (Solicitante)</option>
                    </select>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Ej: Carolina Domínguez"
                      className="w-full text-xs font-semibold text-slate-850 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="Ej: carolina.d@empresa.com"
                      className="w-full text-xs font-semibold text-slate-850 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>

                  {/* Dynamic position specification depending on type */}
                  {newType === 'designer' ? (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Modalidad de Contratación</label>
                      <select
                        value={newDesignerRole}
                        onChange={(e) => setNewDesignerRole(e.target.value as any)}
                        className="w-full text-xs font-semibold text-slate-850 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                      >
                        <option value="Inhouse">In-house (Personal de planta)</option>
                        <option value="Freelance">Freelance (Externo por proyectos)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Cargo / Puesto de Trabajo</label>
                      <input
                        type="text"
                        required
                        value={newAnalystRoleText}
                        onChange={(e) => setNewAnalystRoleText(e.target.value)}
                        placeholder="Ej: Analista de Growth o Contenido"
                        className="w-full text-xs font-semibold text-slate-850 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Avatar Color Picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Color del Perfil / Avatar</label>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {[
                      { bg: 'bg-rose-500 text-white', label: 'Coral' },
                      { bg: 'bg-violet-500 text-white', label: 'Violeta' },
                      { bg: 'bg-teal-500 text-white', label: 'Menta' },
                      { bg: 'bg-indigo-500 text-white', label: 'Indigo' },
                      { bg: 'bg-fuchsia-500 text-white', label: 'Fucsia' },
                      { bg: 'bg-cyan-500 text-white', label: 'Cian' },
                      { bg: 'bg-emerald-500 text-white', label: 'Esmeralda' },
                      { bg: 'bg-amber-500 text-black', label: 'Ambar' },
                      { bg: 'bg-pink-500 text-white', label: 'Rosa' },
                      { bg: 'bg-slate-700 text-white', label: 'Plomo' }
                    ].map((item) => {
                      const isSelected = newUserColor === item.bg;
                      return (
                        <button
                          key={item.bg}
                          type="button"
                          onClick={() => setNewUserColor(item.bg)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition border-2 ${
                            isSelected ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                          } ${item.bg}`}
                          title={item.label}
                        >
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 px-4 py-2 rounded-xl transition cursor-pointer font-semibold"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition cursor-pointer font-bold shadow-xs"
                  >
                    Confirmar Guardado
                  </button>
                </div>
              </form>
            )}

            <div className="border-t border-slate-100 my-4"></div>
            <p className="text-[11px] text-slate-400 font-light flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Sugerencia: Una vez creado, el usuario aparecerá en el listado respectivo y servirá para simular sus dashboards usando la barra de navegación lateral.
            </p>
          </div>
          
          {/* Section 1: Marketing Analysts (Solicitantes de tareas) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
              <UserCog className="w-5 h-5 text-indigo-600" />
              <span>Analistas de Marketing (Solicitantes)</span>
            </h3>
            <p className="text-xs text-slate-500 font-light mb-6">
              Colaboradores y analistas con permiso directo para cargar y asignar tareas de diseño de marketing. Edita sus perfiles en tiempo real o elimínalos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysts.map((analyst) => (
                <AnalystEditCard 
                  key={analyst.id}
                  analyst={analyst}
                  onUpdate={onUpdateAnalyst}
                  onDelete={onDeleteAnalyst}
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
              Edita el nombre, modalidad de contrato y datos de los integrantes del equipo creativo, o quítalos de la nómina.
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
                    onDelete={onDeleteDesigner}
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
  onDelete?: (id: string) => void;
}

function DesignerEditCard({ designer, activeTaskTitle, pendingCount, completedCount, onUpdate, onDelete }: DesignerEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(designer.name);
  const [editedEmail, setEditedEmail] = useState(designer.email);
  const [editedRole, setEditedRole] = useState(designer.role);

  // Sync inputs with designer is updated/prop is modified (fixes "no me toma el cambio")
  useEffect(() => {
    setEditedName(designer.name);
    setEditedEmail(designer.email);
    setEditedRole(designer.role);
  }, [designer]);

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
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200/50">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(designer.id);
                setIsEditing(false);
              }}
              className="text-[10px] bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Eliminar</span>
            </button>
          ) : <div />}
          <div className="flex gap-2">
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
  onDelete?: (id: string) => void;
}

function AnalystEditCard({ analyst, onUpdate, onDelete }: AnalystEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(analyst.name);
  const [editedEmail, setEditedEmail] = useState(analyst.email);
  const [editedRole, setEditedRole] = useState(analyst.role);

  // Sync inputs with analyst is updated/prop is modified (fixes "no me toma el cambio")
  useEffect(() => {
    setEditedName(analyst.name);
    setEditedEmail(analyst.email);
    setEditedRole(analyst.role);
  }, [analyst]);

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
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200/50">
          {onDelete && analyst.id !== 'ana_meli' ? (
            <button
              type="button"
              onClick={() => {
                onDelete(analyst.id);
                setIsEditing(false);
              }}
              className="text-[10px] bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Eliminar</span>
            </button>
          ) : <div />}
          <div className="flex gap-2">
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
        </div>
      )}
    </div>
  );
}

interface TaskImporterProps {
  designers: Designer[];
  analysts: Analyst[];
  onImport: (tasks: Omit<Task, 'id' | 'createdAt' | 'status'>[]) => void;
  onCancel: () => void;
}

function TaskImporter({ designers, analysts, onImport, onCancel }: TaskImporterProps) {
  const [importTab, setImportTab] = useState<'url' | 'paste' | 'file'>('url');
  const [sheetUrl, setSheetUrl] = useState('');
  const [pastedData, setPastedData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Tasks currently under preview before actual final validation & import
  const [parsedTasks, setParsedTasks] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const processRawDataInComponent = (rawText: string) => {
    setErrorMsg(null);
    if (!rawText || !rawText.trim()) {
      setErrorMsg('No se encontraron datos para procesar.');
      return;
    }
    
    try {
      const rows = parseCSVorTSV(rawText);
      if (rows.length < 2) {
        setErrorMsg('La planilla de tareas debe tener al menos una fila de encabezados (ej. "Campaña", "Tipo de contenido", "Descripción", "Responsable") y una fila de datos.');
        return;
      }
      
      const headers = rows[0].map(h => h.toLowerCase().trim());
      
      // Auto-detect index mappings
      let titleIdx = headers.findIndex(h => h.includes('tit') || h.includes('title') || h.includes('tarea') || h.includes('nombre'));
      let descIdx = headers.findIndex(h => h.includes('desc') || h.includes('det') || h.includes('espec') || h.includes('coment'));
      let urgencyIdx = headers.findIndex(h => h.includes('urg') || h.includes('prio') || h.includes('rele'));
      let assigneeIdx = headers.findIndex(h => h.includes('resp') || h.includes('asig') || h.includes('dis') || h.includes('owner') || h.includes('encarg') || h.includes('espec'));
      let templateIdx = headers.findIndex(h => h.includes('plan') || h.includes('temp') || h.includes('proc'));
      
      // Mappings matching team spreadsheet format
      let campaignIdx = headers.findIndex(h => h.includes('camp') || h.includes('marca'));
      let channelIdx = headers.findIndex(h => h.includes('canal') || h.includes('medio'));
      let contentTypeIdx = headers.findIndex(h => h.includes('tipo') || h.includes('contenido'));
      let statusIdx = headers.findIndex(h => h.includes('est') || h.includes('completado'));
      
      // Fallbacks if header wasn't super direct but columns exist
      if (descIdx === -1) {
        // If they have "descripcion" column, let's look for any column starting with desc
        descIdx = headers.findIndex(h => h.startsWith('desc'));
      }
      
      const tasksToPreview: any[] = [];
      const timestampRef = Date.now();
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || row.join('').trim() === '') continue;
        
        const campaignStr = campaignIdx !== -1 && row[campaignIdx] ? row[campaignIdx].trim() : '';
        const channelStr = channelIdx !== -1 && row[channelIdx] ? row[channelIdx].trim() : '';
        const contentTypeStr = contentTypeIdx !== -1 && row[contentTypeIdx] ? row[contentTypeIdx].trim() : '';
        const descStr = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : '';
        
        // Auto generate dynamic high-quality Title if not present in CSV
        let titleStr = '';
        if (titleIdx !== -1 && row[titleIdx]?.trim()) {
          titleStr = row[titleIdx].trim();
        } else {
          const parts = [];
          if (campaignStr) parts.push(campaignStr);
          if (contentTypeStr) parts.push(contentTypeStr);
          
          if (parts.length > 0) {
            titleStr = `[${parts.join(' - ')}]`;
            if (descStr) {
              const shortenedDesc = descStr.split('\n')[0].replace(/["']/g, '').substring(0, 45).trim();
              titleStr += ` ${shortenedDesc}`;
            }
          } else if (descStr) {
            titleStr = descStr.split('\n')[0].replace(/["']/g, '').substring(0, 50).trim() || 'Tarea sin título';
          } else {
            titleStr = `Tarea cargada #${i}`;
          }
        }
        
        // State status mapping
        let statusVal: TaskStatus = 'Pendiente';
        if (statusIdx !== -1 && row[statusIdx]) {
          const sStr = row[statusIdx].toLowerCase().trim();
          if (sStr.includes('comple') || sStr.includes('hecho') || sStr.includes('final') || sStr === 'si' || sStr === 'yes') {
            statusVal = 'Completada';
          } else if (sStr.includes('progr') || sStr.includes('curs') || sStr.includes('proce') || sStr.includes('haciendo')) {
            statusVal = 'En Progreso';
          }
        }
        
        // Urgency level resolution
        let urgencyVal: TaskUrgency = 'Media';
        if (urgencyIdx !== -1 && row[urgencyIdx]) {
          const uStr = row[urgencyIdx].toLowerCase();
          if (uStr.includes('alt')) urgencyVal = 'Alta';
          else if (uStr.includes('baj')) urgencyVal = 'Baja';
        }
        
        // Designer assignee resolution (handling @Victoria prefixes overlap matches)
        let assigneeIdVal = designers[0]?.id || '';
        if (assigneeIdx !== -1 && row[assigneeIdx]) {
          const dsName = row[assigneeIdx].replace('@', '').toLowerCase().trim();
          if (dsName) {
            const found = designers.find(d => {
              const desNameLower = d.name.toLowerCase();
              const firstWord = dsName.split(' ')[0];
              return desNameLower.includes(dsName) || 
                     dsName.includes(desNameLower) ||
                     (firstWord.length > 2 && desNameLower.includes(firstWord));
            });
            if (found) {
              assigneeIdVal = found.id;
            }
          }
        }
        
        // Smart Template checklist preset matching content type
        let templateIdVal = '';
        let checklistPreset: any[] = [];
        let detectedTemplate = null;
        
        if (contentTypeStr) {
          const ctLower = contentTypeStr.toLowerCase();
          if (ctLower.includes('hist') || ctLower.includes('stori') || ctLower.includes('red') || ctLower.includes('ig') || ctLower.includes('fb') || ctLower.includes('link')) {
            detectedTemplate = TEMPLATES.find(t => t.id === 'temp_rrss');
          } else if (ctLower.includes('banner') || ctLower.includes('ads') || ctLower.includes('slide') || ctLower.includes('web') || ctLower.includes('mail')) {
            detectedTemplate = TEMPLATES.find(t => t.id === 'temp_ads') || TEMPLATES.find(t => t.id === 'temp_web');
          } else if (ctLower.includes('follet') || ctLower.includes('flyer') || ctLower.includes('imprent') || ctLower.includes('print')) {
            detectedTemplate = TEMPLATES.find(t => t.id === 'temp_print');
          }
        }
        
        if (!detectedTemplate) {
          detectedTemplate = TEMPLATES[0]; // fallback
        }
        
        if (detectedTemplate) {
          templateIdVal = detectedTemplate.id;
          checklistPreset = detectedTemplate.checklistPreset.map((step, idx) => ({
            id: `step_import_${timestampRef}_${i}_${idx}`,
            text: step,
            completed: statusVal === 'Completada' // Auto mark as done if task is complete!
          }));
        }
        
        tasksToPreview.push({
          id_temp: `temp_task_${timestampRef}_${i}`,
          title: titleStr,
          description: descStr,
          urgency: urgencyVal,
          assigneeId: assigneeIdVal,
          creatorId: analysts[0]?.id || '',
          templateId: templateIdVal || undefined,
          checklist: checklistPreset,
          campaign: campaignStr || undefined,
          channel: channelStr || undefined,
          contentType: contentTypeStr || undefined,
          status: statusVal
        });
      }
      
      if (tasksToPreview.length === 0) {
        setErrorMsg('No se detectaron filas válidas con datos de títulos o tareas.');
      } else {
        setParsedTasks(tasksToPreview);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo interpretar el archivo o texto. Asegúrate de que las columnas están divididas correctamente.');
    }
  };

  const handleImportFromUrl = async (urlStr: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      let spreadsheetId = '';
      const match = urlStr.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        spreadsheetId = match[1];
      } else {
        throw new Error('Formato de enlace no reconocido. Copia la dirección completa de tu Google Sheet (ej. https://docs.google.com/spreadsheets/d/.../edit).');
      }
      
      // Google Sheets publishes/exports CSV format directly
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Error al conectar. Verifica que el archivo de Google Sheets tenga activado "Cualquiera con el enlace puede ver" en la configuración de compartir.');
      }
      
      const csvText = await response.text();
      processRawDataInComponent(csvText);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al intentar conectar. Prueba copiando y pegando el segmento de celdas como alternativa rápida.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedData.trim()) {
      setErrorMsg('Por favor ingresa o pega datos de la planilla.');
      return;
    }
    processRawDataInComponent(pastedData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processRawDataInComponent(text || '');
    };
    reader.onerror = () => {
      setErrorMsg('Error al abrir el archivo local.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processRawDataInComponent(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleRemovePreviewTask = (tempId: string) => {
    setParsedTasks(parsedTasks.filter(item => item.id_temp !== tempId));
  };

  const handleFieldChange = (tempId: string, field: string, value: any) => {
    setParsedTasks(parsedTasks.map(item => {
      if (item.id_temp === tempId) {
        const updated = { ...item, [field]: value };
        
        // If they updated the process template, re-render the default checklist for that template
        if (field === 'templateId') {
          const matched = TEMPLATES.find(t => t.id === value);
          if (matched) {
            updated.checklist = matched.checklistPreset.map((step, idx) => ({
              id: `step_import_change_${Date.now()}_${idx}`,
              text: step,
              completed: false
            }));
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const executeFinalImport = () => {
    if (parsedTasks.length === 0) return;
    // Strip temp attributes and call output
    const cleanImportList = parsedTasks.map(({ id_temp, ...rest }) => rest);
    onImport(cleanImportList);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>Cargar tareas desde Google Sheets / Planilla de Trabajo</span>
            </h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              Automatiza la carga de requerimientos importando de manera masiva tus planillas semanales de marketing o diseño.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition shrink-0 cursor-pointer"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Source selector Tabs */}
        {parsedTasks.length === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/60 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => { setImportTab('url'); setErrorMsg(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  importTab === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Sincronizar Enlace URL
              </button>
              <button
                type="button"
                onClick={() => { setImportTab('paste'); setErrorMsg(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  importTab === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Copiar y Pegar Celdas
              </button>
              <button
                type="button"
                onClick={() => { setImportTab('file'); setErrorMsg(null); }}
                className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  importTab === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Archivo CSV / TSV
              </button>
            </div>

            {/* ERROR OUT */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-rose-800 block">Surgió un inconveniente de lectura:</span>
                  <span className="text-[11px] text-rose-700 font-light block leading-tight mt-0.5">{errorMsg}</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: URL */}
            {importTab === 'url' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Completa la URL compartida de Google Sheet</span>
                  <span className="text-[11.5px] text-slate-500 font-light block leading-tight">
                    Para que la importación funcione, tu Google Sheets debe tener activado compartir en "<strong>Cualquiera con el enlace puede ver</strong>" (Shared as "Anyone with link can view").
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    aria-label="Google Sheets URL"
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                    className="grow text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                  />
                  <button
                    type="button"
                    disabled={isLoading || !sheetUrl}
                    onClick={() => handleImportFromUrl(sheetUrl)}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold px-4 py-2 text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Leyendo...</span>
                      </>
                    ) : (
                      <>
                        <span>Establecer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Instructions steps */}
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-[11px] text-slate-600 space-y-2">
                  <span className="font-bold text-slate-700 block text-xs">💡 Instrucciones de preparado de planilla:</span>
                  <p className="leading-relaxed">
                    1. Crea una Google Sheet con una fila inicial de títulos. Te sugerimos usar columnas llamadas: <br />
                    <code className="bg-slate-200 px-1 py-0.5 rounded-sm font-mono font-semibold text-slate-800">C1: Título</code>,{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded-sm font-mono font-semibold text-slate-800">C2: Descripción</code>,{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded-sm font-mono font-semibold text-slate-800">C3: Urgencia</code> (Alta, Media, Baja),{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded-sm font-mono font-semibold text-slate-800">C4: Diseñador</code> (Victoria, Giuliana, Martín, etc),{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded-sm font-mono font-semibold text-slate-800">C5: Proceso</code>.<br />
                    2. En la esquina superior derecha, haz click en <strong>Compartir</strong> &rarr; Cambiar a <strong>"Cualquiera con el enlace puede ver"</strong>.<br />
                    3. ¡Pega el enlace web aquí y presiona Establecer!
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: COPY-PASTE */}
            {importTab === 'paste' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Pega las celdas directas aquí</span>
                  <span className="text-[11.5px] text-slate-500 font-light block leading-snug">
                    Abre tu Google Sheets o Excel, resalta el rango de filas y columnas (incluyendo los encabezados de arriba), presiona <code className="bg-slate-100 border border-slate-200 px-1 rounded-sm text-[10.5px]">Ctrl + C</code> y pégalas en el cuadro inferior presionando <code className="bg-slate-100 border border-slate-200 px-1 rounded-sm text-[10.5px]">Ctrl + V</code>.
                  </span>
                </div>
                <textarea
                  aria-label="Celdas de planilla"
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  placeholder="Título	Descripción	Urgencia	Diseñador	Proceso
Post Carrusel	Diseño de feed de cyber	Alta	Victoria	Redes Sociales
Stories Promo	Descuentos de la semana	Media	Giuliana	Edición de Video"
                  rows={6}
                  className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono transition"
                />
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handlePasteSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                  >
                    Interpretar Tareas Directas
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FILE */}
            {importTab === 'file' && (
              <div className="bg-white border border-slate-205 rounded-xl p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">Sube un archivo de texto separado por comas o tabuladores</span>
                  <span className="text-[11.5px] text-slate-500 font-light block">Soporta archivos generados directamente desde planillas (.CSV, .TSV o .TXT).</span>
                </div>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    dragActive 
                      ? "border-indigo-500 bg-indigo-50/50" 
                      : "border-slate-300 hover:border-slate-400 bg-slate-50/20"
                  }`}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2.5" />
                  <span className="text-xs font-semibold text-slate-700 block">Arrastra tu archivo CSV aquí, o haz click para explorar</span>
                  <span className="text-[10px] text-slate-400 mt-1">Límite tamaño recomendado: 2 MB</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAP PREVIEW & CONFIRM LOG */}
        {parsedTasks.length > 0 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">Revisión de Datos & Sincronización ({parsedTasks.length} Tareas)</span>
                <span className="text-xs text-slate-500 font-light block mt-0.5">
                  Detectamos lo siguiente en tu planilla. Por favor valida la asignación de diseñadores antes de persistirlo en el tablero real.
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setParsedTasks([]); setErrorMsg(null); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer bg-transparent transition"
              >
                &larr; Volver a cargar planilla
              </button>
            </div>

            {/* List to approve */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white max-h-96">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-extrabold text-slate-550 uppercase tracking-wider select-none">
                    <th className="py-3 px-4">Título</th>
                    <th className="py-3 px-3">Campaña / Canal / Tipo</th>
                    <th className="py-3 px-3">Descripción</th>
                    <th className="py-3 px-3">Prioridad</th>
                    <th className="py-3 px-3">Diseñador Responsable</th>
                    <th className="py-3 px-3">Workflow / Checklist</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-center">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {parsedTasks.map((t, idx) => (
                    <tr key={t.id_temp} className="text-xs text-slate-800 hover:bg-slate-50/50 transition">
                      {/* Title */}
                      <td className="py-2.5 px-4 min-w-[150px] max-w-[200px]">
                        <input
                          aria-label="Task title preview"
                          type="text"
                          value={t.title}
                          onChange={(e) => handleFieldChange(t.id_temp, 'title', e.target.value)}
                          className="w-full text-slate-805 bg-white border border-slate-200 hover:border-slate-350 rounded-md px-2 py-1 font-semibold text-xs focus:ring-1 focus:ring-indigo-500/50 focus:outline-hidden"
                        />
                      </td>

                      {/* Campaign / Channel / ContentType */}
                      <td className="py-2.5 px-3 min-w-[210px] max-w-[260px]">
                        <div className="space-y-1">
                          <input
                            aria-label="Campaña"
                            type="text"
                            value={t.campaign || ''}
                            onChange={(e) => handleFieldChange(t.id_temp, 'campaign', e.target.value)}
                            placeholder="Campaña"
                            className="w-full text-[10px] text-slate-800 bg-white border border-slate-205 rounded px-1.5 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50"
                          />
                          <div className="flex gap-1.5">
                            <input
                              aria-label="Canal"
                              type="text"
                              value={t.channel || ''}
                              onChange={(e) => handleFieldChange(t.id_temp, 'channel', e.target.value)}
                              placeholder="Canal"
                              className="w-1/2 text-[10px] text-slate-550 bg-white border border-slate-205 rounded px-1 px-1 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <input
                              aria-label="Tipo"
                              type="text"
                              value={t.contentType || ''}
                              onChange={(e) => handleFieldChange(t.id_temp, 'contentType', e.target.value)}
                              placeholder="Tipo"
                              className="w-1/2 text-[10px] text-slate-550 bg-white border border-slate-205 rounded px-1 px-1 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50"
                            />
                          </div>
                        </div>
                      </td>
                      
                      {/* Description */}
                      <td className="py-2.5 px-3 min-w-[150px] max-w-[200px]">
                        <input
                          aria-label="Task description preview"
                          type="text"
                          value={t.description}
                          onChange={(e) => handleFieldChange(t.id_temp, 'description', e.target.value)}
                          placeholder="Sin especificaciones adicionales"
                          className="w-full text-slate-550 bg-white border border-slate-205 hover:border-slate-350 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500/50 focus:outline-hidden truncate"
                        />
                      </td>

                      {/* Urgency */}
                      <td className="py-2.5 px-3">
                        <select
                          aria-label="Task priority urgency preview"
                          value={t.urgency}
                          onChange={(e) => handleFieldChange(t.id_temp, 'urgency', e.target.value)}
                          className={`border rounded-md px-2 py-1 text-[11px] font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-505 cursor-pointer ${
                            t.urgency === 'Alta' 
                              ? 'bg-rose-50 border-rose-205 text-rose-800' 
                              : t.urgency === 'Baja' 
                              ? 'bg-slate-50 border-slate-205 text-slate-800' 
                              : 'bg-amber-50 border-amber-250 text-amber-850'
                          }`}
                        >
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                        </select>
                      </td>

                      {/* Designer assignee */}
                      <td className="py-2.5 px-3">
                        <select
                          aria-label="Task designer preview"
                          value={t.assigneeId}
                          onChange={(e) => handleFieldChange(t.id_temp, 'assigneeId', e.target.value)}
                          className="bg-white border border-slate-220 hover:border-slate-350 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          {designers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.role})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Workflow / Template */}
                      <td className="py-2.5 px-3">
                        <select
                          aria-label="Task process template preview"
                          value={t.templateId}
                          onChange={(e) => handleFieldChange(t.id_temp, 'templateId', e.target.value)}
                          className="bg-white border border-slate-220 hover:border-slate-350 rounded-md px-2 py-1 text-[11px] font-bold text-indigo-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-505 cursor-pointer"
                        >
                          {TEMPLATES.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <select
                          aria-label="Task status preview"
                          value={t.status || 'Pendiente'}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            // Also adjust checklist steps completed state based on setting status to Completada
                            const updatedChecklist = t.checklist.map((step: any) => ({
                              ...step,
                              completed: newStatus === 'Completada'
                            }));
                            handleFieldChange(t.id_temp, 'status', newStatus);
                            handleFieldChange(t.id_temp, 'checklist', updatedChecklist);
                          }}
                          className={`border rounded-md px-2 py-1 text-[11px] font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-505 cursor-pointer ${
                            t.status === 'Completada' 
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                              : t.status === 'En Progreso'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                              : 'bg-slate-50 border-slate-205 text-slate-800'
                          }`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Progreso">En Progreso</option>
                          <option value="Completada">Completada</option>
                        </select>
                      </td>

                      {/* Remove row */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePreviewTask(t.id_temp)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Eliminar de la lista de importación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Import buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setParsedTasks([])}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition text-xs font-semibold cursor-pointer"
              >
                Cancelar y Limpiar
              </button>
              <button
                type="button"
                onClick={executeFinalImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" />
                <span>✓ Confirmar y Cargar {parsedTasks.length} Tareas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

