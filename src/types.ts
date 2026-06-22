/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DesignerRole = 'Inhouse' | 'Freelance';

export interface Designer {
  id: string;
  name: string;
  role: DesignerRole;
  avatarColor: string; // Tailwind bg class
  email: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TaskUrgency = 'Alta' | 'Media' | 'Baja';
export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completada';

export interface Analyst {
  id: string;
  name: string;
  role: string; // e.g. "Responsable de Área", "Analista de Marketing"
  avatarColor: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  templateId?: string;
  checklist: ChecklistItem[];
  assigneeId: string;
  creatorId?: string; // ID of the Analyst or Responsable who created/assigned the task
  urgency: TaskUrgency;
  status: TaskStatus;
  createdAt: number;
  startTime?: number; // timestamp
  endTime?: number;   // timestamp
  durationMs?: number; // duration in milliseconds
  notes?: string;     // comments or delivery links
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  checklistPreset: string[];
}
