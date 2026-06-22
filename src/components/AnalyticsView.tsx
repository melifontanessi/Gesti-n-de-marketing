/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Designer } from '../types';
import { formatDuration, formatDate } from '../utils';
import { Clock, CheckCircle2, TrendingUp, Filter, Users, Calendar, ArrowUpDown, ChevronDown } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  designers: Designer[];
}

export default function AnalyticsView({ tasks, designers }: AnalyticsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesignerId, setSelectedDesignerId] = useState<'all' | string>('all');

  // Completed tasks only
  const completedTasks = tasks.filter(t => t.status === 'Completada');

  // Basic calculation helpers
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'En Progreso').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
  const completedCount = completedTasks.length;

  // Calculamos el total de milisegundos invertidos
  const totalDurationMs = completedTasks.reduce((sum, t) => sum + (t.durationMs || 0), 0);

  // Stats by designer
  const designerStats = designers.map(designer => {
    const designerCompleted = completedTasks.filter(t => t.assigneeId === designer.id);
    const count = designerCompleted.length;
    const totalMs = designerCompleted.reduce((sum, t) => sum + (t.durationMs || 0), 0);
    const avgMs = count > 0 ? totalMs / count : 0;
    
    // Status counts
    const activeCount = tasks.filter(t => t.assigneeId === designer.id && t.status === 'En Progreso').length;
    const pendingCount = tasks.filter(t => t.assigneeId === designer.id && t.status === 'Pendiente').length;

    return {
      designer,
      completedCount: count,
      totalHoursMs: totalMs,
      avgHoursMs: avgMs,
      activeCount,
      pendingCount
    };
  });

  // Filter completed logs for the table
  const filteredLogs = completedTasks.filter(task => {
    const designer = designers.find(d => d.id === task.assigneeId);
    const textMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (designer && designer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const designerMatch = selectedDesignerId === 'all' || task.assigneeId === selectedDesignerId;
    
    return textMatch && designerMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Metrics Row (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric Card 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">
              Tiempo Total Invertido
            </span>
            <span className="text-xl font-bold font-mono text-slate-800">
              {formatDuration(totalDurationMs)}
            </span>
            <span className="text-[10px] text-slate-400 block font-light">
              Suma de horas completadas
            </span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">
              Tareas Entregadas
            </span>
            <span className="text-xl font-bold text-slate-800 flex items-baseline gap-1">
              {completedCount}
              <span className="text-xs text-slate-400 font-normal">/ {totalTasks}</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-light">
              Tasa de éxito: {totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 animate-pulse">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">
              En Progreso Activo
            </span>
            <span className="text-xl font-bold text-slate-800">
              {inProgressTasks}
            </span>
            <span className="text-[10px] text-slate-400 block font-light">
              Cronómetros actualmente corriendo
            </span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">
              Cola Pendiente
            </span>
            <span className="text-xl font-bold text-slate-800">
              {pendingTasks}
            </span>
            <span className="text-[10px] text-slate-400 block font-light">
              Para tomar o iniciar
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Designer Metrics & Process Compliance Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Designer Efficiency Rankings */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rendimiento y Tiempos por Diseñador</h3>
              <p className="text-[11px] text-slate-500 font-light">
                Contrasta el promedio que le toma a cada diseñador resolver tareas habituales.
              </p>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full text-indigo-700 font-semibold uppercase">
              Control de Eficiencia
            </span>
          </div>

          <div className="p-5 space-y-5">
            {designerStats.map((stat) => {
              // Calculate percent of total hours logged for display relative bar size
              const maxHourMs = Math.max(...designerStats.map(s => s.totalHoursMs), 1);
              const barWidthPct = (stat.totalHoursMs / maxHourMs) * 100;
              
              return (
                <div key={stat.designer.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    {/* Designer Details */}
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg text-xs font-bold leading-none flex items-center justify-center ${stat.designer.avatarColor}`}>
                        {stat.designer.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800">{stat.designer.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1.5 bg-slate-100 ${
                          stat.designer.role === 'Inhouse' ? 'text-indigo-600 border border-indigo-100' : 'text-amber-700 border border-amber-100'
                        }`}>
                          {stat.designer.role}
                        </span>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="flex items-center gap-4 text-[11px]">
                      <div className="text-right">
                        <span className="text-slate-400 block">Promedio / Tarea</span>
                        <strong className="text-slate-700 font-mono">
                          {stat.completedCount > 0 ? formatDuration(stat.avgHoursMs) : 'S/D'}
                        </strong>
                      </div>
                      <div className="text-right border-l border-slate-200 pl-3">
                        <span className="text-slate-400 block">Entregadas</span>
                        <strong className="text-slate-700 font-mono">{stat.completedCount} tareas</strong>
                      </div>
                      <div className="text-right border-l border-slate-200 pl-3">
                        <span className="text-slate-400 block">Total Horas</span>
                        <strong className="text-indigo-600 font-mono font-bold">
                          {formatDuration(stat.totalHoursMs)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal visual chart bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.designer.role === 'Inhouse' ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(barWidthPct, 2)}%` }}
                      />
                    </div>
                    {/* Pending tasks count subindicator */}
                    {(stat.activeCount > 0 || stat.pendingCount > 0) ? (
                      <p className="text-[10px] text-slate-400 font-light">
                        Cola activa: {stat.activeCount} haciendo, {stat.pendingCount} por iniciar
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-light italic">
                        Sin tareas pendientes en cola actualmente
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Inhouse vs Freelance Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Distribución de Costo de Tiempos</h3>
            <p className="text-[11px] text-slate-500 font-light">
              Balance entre horas del recurso corporativo fijo (Inhouse) y colaboradores Freelance cobrando por hora.
            </p>
            
            {/* Visual Pie-style Balance representation inside card */}
            <div className="my-6 space-y-4">
              {(() => {
                const inhouseMs = completedTasks
                  .filter(t => {
                    const d = designers.find(des => des.id === t.assigneeId);
                    return d?.role === 'Inhouse';
                  })
                  .reduce((sum, t) => sum + (t.durationMs || 0), 0);

                const freelanceMs = completedTasks
                  .filter(t => {
                    const d = designers.find(des => des.id === t.assigneeId);
                    return d?.role === 'Freelance';
                  })
                  .reduce((sum, t) => sum + (t.durationMs || 0), 0);

                const totalMsCombined = inhouseMs + freelanceMs || 1;
                const inhousePct = Math.round((inhouseMs / totalMsCombined) * 100);
                const freelancePct = 100 - inhousePct;

                return (
                  <div className="space-y-5">
                    {/* Ring bar */}
                    <div className="flex h-5 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <div 
                        className="bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center transition-all duration-300"
                        style={{ width: `${inhouseMs > 0 ? inhousePct : 50}%` }}
                        title={`Inhouse: ${inhousePct}%`}
                      >
                        {inhouseMs > 0 ? `${inhousePct}%` : 'Inhouse'}
                      </div>
                      <div 
                        className="bg-amber-500 text-[10px] font-bold text-slate-900 flex items-center justify-center transition-all duration-300"
                        style={{ width: `${freelanceMs > 0 ? freelancePct : 50}%` }}
                        title={`Freelance: ${freelancePct}%`}
                      >
                        {freelanceMs > 0 ? `${freelancePct}%` : 'Freelance'}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <span className="text-[10px] font-semibold text-indigo-800 block uppercase">
                          Martín (Inhouse)
                        </span>
                        <strong className="text-base font-bold font-mono text-indigo-900 block mt-1">
                          {formatDuration(inhouseMs)}
                        </strong>
                        <span className="text-[9px] text-indigo-500">Recurso interno fijo</span>
                      </div>

                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <span className="text-[10px] font-semibold text-amber-800 block uppercase">
                          Freelancer Crew
                        </span>
                        <strong className="text-base font-bold font-mono text-amber-900 block mt-1">
                          {formatDuration(freelanceMs)}
                        </strong>
                        <span className="text-[9px] text-amber-600">3 Diseñadores externos</span>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-light mt-4">
            💡 <strong>Tip operacional:</strong> Los diseñadores freelance facturan según las horas registradas aquí. Exige el uso obligatorio de inicio/fin en cada orden de trabajo.
          </div>
        </div>

      </div>

      {/* Historical logs table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Header table controls */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              Bitácora Histórica y Tiempos de Entrega
            </h3>
            <p className="text-[11px] text-slate-500 font-light">
              Listado detallado de todas las asignaciones completadas con sus respectivos comentarios.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tarea o diseñador..."
                className="text-xs bg-white text-slate-800 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 w-full sm:w-56 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute left-2.5 top-2 ml-0.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            {/* Filter Designer */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDesignerId}
                onChange={(e) => setSelectedDesignerId(e.target.value)}
                className="bg-transparent border-0 py-1 focus:outline-hidden text-slate-700 font-medium text-xs pr-4"
              >
                <option value="all">Ver Todos</option>
                {designers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          {filteredLogs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/30">
                  <th className="py-3 px-5">Tarea / Proceso</th>
                  <th className="py-3 px-5">Diseñador</th>
                  <th className="py-3 px-5">Asignación → Entrega</th>
                  <th className="py-3 px-5 text-center">Checklist</th>
                  <th className="py-3 px-5 text-right">Tiempo Invertido</th>
                  <th className="py-3 px-5">Comentarios de Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => {
                  const designer = designers.find(d => d.id === log.assigneeId);
                  const checkedCount = log.checklist.filter(c => c.completed).length;
                  const totalSteps = log.checklist.length;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Name / Desc */}
                      <td className="py-4 px-5 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate" title={log.title}>
                          {log.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1 italic mt-0.5" title={log.description}>
                          {log.description}
                        </span>
                      </td>

                      {/* Designer */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-md text-[10px] font-bold leading-none flex items-center justify-center ${designer?.avatarColor || 'bg-slate-200'}`}>
                            {designer?.name.split(' ').map(n=>n[0]).join('')}
                          </span>
                          <div>
                            <span className="font-medium text-slate-800">{designer?.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-sm block bg-slate-100 max-w-max mt-0.5 ${
                              designer?.role === 'Inhouse' ? 'text-indigo-600 border border-indigo-100' : 'text-amber-700 border border-amber-100'
                            }`}>
                              {designer?.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Timing details */}
                      <td className="py-4 px-5 text-[11px] font-mono whitespace-nowrap">
                        <span className="text-slate-500 block">
                          Asignada: {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-slate-700 block font-semibold">
                          Inicio: {formatDate(log.startTime || 0)}
                        </span>
                        <span className="text-emerald-700 block font-semibold">
                          Fin: {formatDate(log.endTime || 0)}
                        </span>
                      </td>

                      {/* Checklist completion percent badge */}
                      <td className="py-4 px-5 text-center">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          checkedCount === totalSteps && totalSteps > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {checkedCount}/{totalSteps} pasos (100%)
                        </span>
                      </td>

                      {/* Time spent */}
                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 whitespace-nowrap text-xs">
                        {formatDuration(log.durationMs || 0)}
                      </td>

                      {/* Comments */}
                      <td className="py-4 px-5 max-w-sm text-[11px] text-slate-500 leading-relaxed font-light">
                        {log.notes ? (
                          <span className="block truncate max-h-12 overflow-y-auto whitespace-pre-wrap hover:text-slate-700" title={log.notes}>
                            {log.notes}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">Sin comentarios cargados</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-slate-50/50">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Sin registros de entrega</p>
              <p className="text-[11px] text-slate-400 mt-1">
                No hay tareas completadas que coincidan con la búsqueda actual o el selector.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
