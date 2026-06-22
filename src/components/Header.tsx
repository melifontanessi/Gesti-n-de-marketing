/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DESIGNERS } from '../initialData';
import { ShieldCheck, User, Users, Briefcase } from 'lucide-react';

interface HeaderProps {
  currentUser: 'manager' | string;
  onUserChange: (user: 'manager' | string) => void;
}

export default function Header({ currentUser, onUserChange }: HeaderProps) {
  const activeDesigner = currentUser !== 'manager' 
    ? DESIGNERS.find(d => d.id === currentUser)
    : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 flex items-center justify-center shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Gestor Creativo
                <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                  v1.2 Interno
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Control de procesos y tiempos para Diseñadores (vía Marketing)
              </p>
            </div>
          </div>

          {/* Current Session Simulator Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Simular Rol:</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {/* Manager Button */}
              <button
                id="btn-role-manager"
                onClick={() => onUserChange('manager')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentUser === 'manager'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Meli (Manager/Analista)</span>
              </button>

              {/* Designers */}
              {DESIGNERS.map((designer) => {
                const isActive = currentUser === designer.id;
                return (
                  <button
                    key={designer.id}
                    id={`btn-role-${designer.id}`}
                    onClick={() => onUserChange(designer.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{designer.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full leading-none font-bold ${
                      isActive 
                        ? 'bg-black/15 text-white' 
                        : designer.role === 'Inhouse' 
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {designer.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
      
      {/* Active User banner info */}
      <div className="bg-slate-50/50 border-t border-slate-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 bg-emerald-500 rounded-full aspect-square animate-pulse" />
            <span>
              Sesión activa simulada:{' '}
              <strong className="text-slate-700 font-semibold">
                {currentUser === 'manager' ? 'Meli o Analista de Marketing' : activeDesigner?.name}
              </strong>{' '}
              {currentUser !== 'manager' && `(${activeDesigner?.role} | ${activeDesigner?.email})`}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Canal de comunicación interno de diseño</span>
          </div>
        </div>
      </div>
    </header>
  );
}
