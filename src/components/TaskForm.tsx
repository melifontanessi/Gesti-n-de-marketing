/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskUrgency, TaskTemplate, Designer, ChecklistItem, Analyst } from '../types';
import { TEMPLATES } from '../initialData';
import { Plus, Trash2, CheckSquare, Sparkles, BookOpen, UserCheck, AlertTriangle, User } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onCancel?: () => void;
  initialTask?: Task; // If provided, we are editing
  designers: Designer[];
  analysts: Analyst[];
}

export default function TaskForm({ onSubmit, onCancel, initialTask, designers, analysts }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(() => initialTask?.assigneeId || designers[0]?.id || '');
  const [creatorId, setCreatorId] = useState(() => initialTask?.creatorId || analysts[0]?.id || '');
  const [urgency, setUrgency] = useState<TaskUrgency>('Media');
  
  // Checklist dynamic state
  const [checklist, setChecklist] = useState<Omit<ChecklistItem, 'completed'>[]>([]);
  const [newStepText, setNewStepText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Handle load if editing
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setAssigneeId(initialTask.assigneeId);
      setCreatorId(initialTask.creatorId || analysts[0]?.id || '');
      setUrgency(initialTask.urgency);
      setChecklist(initialTask.checklist.map(item => ({ id: item.id, text: item.text })));
      setSelectedTemplateId(initialTask.templateId || '');
    }
  }, [initialTask, analysts]);

  // Apply a template to the form
  const applyTemplate = (templateId: string) => {
    if (!templateId) {
      setSelectedTemplateId('');
      return;
    }
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setTitle(template.title);
      setDescription(template.description);
      
      // Generate a checklist using the preset steps
      const newChecklist = template.checklistPreset.map((step, index) => ({
        id: `step_${Date.now()}_${index}`,
        text: step
      }));
      setChecklist(newChecklist);
    }
  };

  const addCustomStep = () => {
    if (!newStepText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `step_custom_${Date.now()}`,
        text: newStepText.trim()
      }
    ]);
    setNewStepText('');
  };

  const removeStep = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;

    // Map list to proper ChecklistItem structure
    const compiledChecklist: ChecklistItem[] = checklist.map(item => {
      // If we are editing, check if this step already existed as completed
      const existing = initialTask?.checklist.find(ex => ex.text === item.text);
      return {
        id: item.id,
        text: item.text,
        completed: existing ? existing.completed : false
      };
    });

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      creatorId,
      urgency,
      templateId: selectedTemplateId || undefined,
      checklist: compiledChecklist
    });

    // Reset if creating new
    if (!initialTask) {
      setTitle('');
      setDescription('');
      setChecklist([]);
      setSelectedTemplateId('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {initialTask ? 'Editar Tarea Existente' : 'Nueva Solicitud de Tarea'}
          </h2>
          <p className="text-xs text-slate-500 font-light">
            {initialTask ? 'Modifica los parámetros o redefine la lista de procesos requeridos.' : 'Carga una tarea y define el proceso obligatorio para el diseñador.'}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        
        {/* Templates selector (only if creating a task) */}
        {!initialTask && (
          <div className="space-y-1.5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60">
            <label className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Usar Plantilla de Proceso Habitual:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {TEMPLATES.map((temp) => (
                <button
                  key={temp.id}
                  type="button"
                  onClick={() => applyTemplate(temp.id)}
                  className={`p-2.5 rounded-lg text-left text-xs transition border cursor-pointer flex flex-col justify-between h-full ${
                    selectedTemplateId === temp.id
                      ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    {temp.title}
                    {selectedTemplateId === temp.id && (
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-light mt-1 line-clamp-2">
                    {temp.description}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplateId('');
                  setTitle('');
                  setDescription('');
                  setChecklist([]);
                }}
                className={`p-2.5 rounded-lg text-left text-xs transition border border-dashed cursor-pointer flex items-center justify-center font-medium ${
                  !selectedTemplateId
                    ? 'bg-slate-100 text-slate-800 border-slate-400'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-300'
                }`}
              >
                Sin Plantilla (Diseño en Blanco)
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label htmlFor="task-title" className="text-xs font-semibold text-slate-700">
            Título de la Tarea <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Diseño de Banner para Campaña Cyber"
            className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="task-desc" className="text-xs font-semibold text-slate-700">
            Descripción y Especificaciones
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Especifica los formatos, copys, links de assets a usar y cualquier otra aclaración para el diseñador..."
            rows={3}
            className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Assignee, Creator & Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="task-assignee" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Diseñador Asignado</span>
            </label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              {designers.map((designer) => (
                <option key={designer.id} value={designer.id}>
                  {designer.name} ({designer.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="task-creator" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Solicitado por (Analista)</span>
            </label>
            <select
              id="task-creator"
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
              className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              {analysts.map((analyst) => (
                <option key={analyst.id} value={analyst.id}>
                  {analyst.name} ({analyst.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="task-urgency" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              <span>Prioridad / Urgencia</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Baja', 'Media', 'Alta'] as TaskUrgency[]).map((level) => {
                const colorClasses = {
                  Baja: level === urgency ? 'bg-slate-100 border-slate-400 text-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500',
                  Media: level === urgency ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500',
                  Alta: level === urgency ? 'bg-rose-100 border-rose-400 text-rose-800' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500',
                };
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition cursor-pointer ${colorClasses[level]}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Process Checklist (Procesos obligatorios) */}
        <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Paso de Proceso Requerido (Checklist Obligatorio)</span>
            </label>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-200 px-1.5 py-0.5 rounded-sm">
              {checklist.length} pasos
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 mb-2 font-light">
            El diseñador no podrá dar por completada la tarea hasta que marque de manera explícita cada uno de estos pasos, asegurando la calidad.
          </p>

          {/* Checklist Items list */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto mb-3">
            {checklist.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-indigo-600 font-mono font-semibold bg-indigo-50 w-5 h-5 flex items-center justify-center rounded-sm">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const next = [...checklist];
                    next[index].text = e.target.value;
                    setChecklist(next);
                  }}
                  className="grow text-xs text-slate-800 bg-transparent py-0.5 focus:outline-hidden border-b border-transparent focus:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => removeStep(item.id)}
                  className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {checklist.length === 0 && (
              <div className="text-center py-4 bg-white rounded-lg border border-slate-200 border-dashed">
                <p className="text-xs text-slate-400 font-light italic">
                  No hay pasos obligatorios añadidos. ¡Sugerimos agregar alguno para cuidar el proceso de entrega!
                </p>
              </div>
            )}
          </div>

          {/* Add custom step */}
          <div className="flex gap-2">
            <input
              id="new-step-text"
              type="text"
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              placeholder="Ej. Revisar tamaño de la tipografía móvil."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomStep();
                }
              }}
              className="grow text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addCustomStep}
              className="bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {/* Actions Submit */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            id="btn-submit-task-form"
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm text-xs transition cursor-pointer"
          >
            {initialTask ? 'Guardar Cambios' : 'Asignar Tarea'}
          </button>
        </div>

      </form>
    </div>
  );
}
