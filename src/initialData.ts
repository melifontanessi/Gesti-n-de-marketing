/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Designer, TaskTemplate, Task, Analyst } from './types';

export const ANALYSTS: Analyst[] = [
  {
    id: 'ana_meli',
    name: 'Meli Fontanessi',
    role: 'Responsable de Área',
    avatarColor: 'bg-rose-500 text-white',
    email: 'meli.f@empresa.com'
  },
  {
    id: 'ana_tomas',
    name: 'Tomás Rivas',
    role: 'Analista de Paid Media',
    avatarColor: 'bg-violet-500 text-white',
    email: 'tomas.r@empresa.com'
  },
  {
    id: 'ana_sofia',
    name: 'Sofía Benítez',
    role: 'Analista de Contenido',
    avatarColor: 'bg-teal-500 text-white',
    email: 'sofia.b@empresa.com'
  }
];

export const DESIGNERS: Designer[] = [
  {
    id: 'des_victoria',
    name: 'Victoria Rossi',
    role: 'Inhouse',
    avatarColor: 'bg-fuchsia-500 text-white',
    email: 'victoria.r@empresa.com'
  },
  {
    id: 'des_giuliana',
    name: 'Giuliana Marín',
    role: 'Inhouse',
    avatarColor: 'bg-cyan-500 text-white',
    email: 'giuliana.m@empresa.com'
  },
  {
    id: 'des_martin',
    name: 'Martín Cabrera',
    role: 'Inhouse',
    avatarColor: 'bg-indigo-500 text-white',
    email: 'martin.c@empresa.com'
  },
  {
    id: 'des_lucia',
    name: 'Lucía Gómez',
    role: 'Freelance',
    avatarColor: 'bg-emerald-500 text-white',
    email: 'lucia.g.design@gmail.com'
  },
  {
    id: 'des_javier',
    name: 'Javier Peralta',
    role: 'Freelance',
    avatarColor: 'bg-amber-500 text-black',
    email: 'javier.peralta.freelance@gmail.com'
  },
  {
    id: 'des_elena',
    name: 'Elena Rostova',
    role: 'Freelance',
    avatarColor: 'bg-pink-500 text-white',
    email: 'elena.rostova@designstudio.io'
  }
];

export const TEMPLATES: TaskTemplate[] = [
  {
    id: 'temp_rrss',
    title: 'Creativo para Redes Sociales',
    description: 'Diseño de post o storie para Instagram, Facebook o LinkedIn según especificaciones de contenido.',
    checklistPreset: [
      'Confirmar dimensiones requeridas (ej: 1080x1080 Post, 1080x1920 Story).',
      'Alinear con la paleta de colores y línea gráfica de la marca seleccionada.',
      'Revisar la ortografía de los textos utilizando corrector.',
      'Asegurar legibilidad de texto y que los logos tengan el margen de seguridad.',
      'Exportar en formato PNG a máxima calidad (@2x).',
      'Subir los archivos finales organizados en la carpeta de Drive compartida.'
    ]
  },
  {
    id: 'temp_ads',
    title: 'Creativo para Paid Media (Ads)',
    description: 'Banners o videos cortos optimizados para anuncios pagos en Meta Ads, Google Ads o TikTok.',
    checklistPreset: [
      'Correr prueba de legibilidad móvil (simular pantalla chica).',
      'Verificar restricciones de porcentaje de texto en imagen.',
      'Adaptar el diseño a múltiples formatos estándar (1:1, 9:16, 16:9) si aplica.',
      'Comprimir imágenes (peso ideal < 350kb por banner) y exportar en WebP.',
      'Registrar enlace de entrega en figma/drive en la planilla de conversiones.'
    ]
  },
  {
    id: 'temp_web',
    title: 'Banner Web / E-Commerce Hero',
    description: 'Imagen destacada para home o categoría específica del sitio web o tienda online.',
    checklistPreset: [
      'Verificar encuadre considerando safe-zones donde irá texto dinámico.',
      'Revisar resolución de assets de producto integrados en el diseño.',
      'Garantizar contraste óptimo entre fondo y Call to Action (CTA).',
      'Optimizar exportación en WebP/SVG para velocidad de carga web.',
      'Nombrar archivo siguiendo la nomenclatura del sitio (ej: HERO_PRODUCTO_FECHA.webp).'
    ]
  },
  {
    id: 'temp_print',
    title: 'Folleto / Material Impreso',
    description: 'Diseño de folletos, flyers o cartelería listos para enviar a imprenta.',
    checklistPreset: [
      'Convertir el perfil de color a modo de impresión CMYK.',
      'Añadir 3mm de demasía (sangría / bleed) en el documento de corte.',
      'Convertir todos los textos y fuentes tipográficas a curvas vectoriales.',
      'Garantizar que todas las imágenes incrustadas tengan un mínimo de 300 DPI.',
      'Exportar en PDF de Alta Resolución con marcas de corte y registro activadas.'
    ]
  }
];

// Generamos tareas de ejemplo realistas
const now = Date.now();
const hourInMs = 60 * 60 * 1000;
const dayInMs = 24 * hourInMs;

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_001',
    title: 'Post Carrusel: Lanzamiento de Temporada',
    description: 'Armar carrusel de 5 slides para Instagram presentando la nueva línea de productos de invierno de la marca.',
    templateId: 'temp_rrss',
    assigneeId: 'des_lucia', // Freelance
    urgency: 'Alta',
    status: 'Completada',
    createdAt: now - 3 * dayInMs,
    startTime: now - 2 * dayInMs - 4 * hourInMs,
    endTime: now - 2 * dayInMs - 1.5 * hourInMs, // Tomó 2h 30m
    durationMs: 2.5 * hourInMs,
    notes: 'Entregado en Drive. Lucía comentó: Se extendió un poco el tiempo porque el cliente envió un cambio de copys a mitad del proceso.',
    checklist: [
      { id: 'step_1', text: 'Confirmar dimensiones requeridas (ej: 1080x1080 Post, 1080x1920 Story).', completed: true },
      { id: 'step_2', text: 'Alinear con la paleta de colores y línea gráfica de la marca seleccionada.', completed: true },
      { id: 'step_3', text: 'Revisar la ortografía de los textos utilizando corrector.', completed: true },
      { id: 'step_4', text: 'Asegurar legibilidad de texto y que los logos tengan el margen de seguridad.', completed: true },
      { id: 'step_5', text: 'Exportar en formato PNG a máxima calidad (@2x).', completed: true },
      { id: 'step_6', text: 'Subir los archivos finales organizados en la carpeta de Drive compartida.', completed: true }
    ]
  },
  {
    id: 'task_002',
    title: 'Banners Meta Ads - CyberMonday Promos',
    description: 'Adaptar los banners de la campaña general para anuncios pagos en formato cuadrado e historias.',
    templateId: 'temp_ads',
    assigneeId: 'des_martin', // Inhouse
    urgency: 'Alta',
    status: 'En Progreso',
    createdAt: now - 1 * dayInMs,
    startTime: now - 2.5 * hourInMs, // Lleva 2.5 horas haciéndose
    checklist: [
      { id: 'step_1', text: 'Correr prueba de legibilidad móvil (simular pantalla chica).', completed: true },
      { id: 'step_2', text: 'Verificar restricciones de porcentaje de texto en imagen.', completed: true },
      { id: 'step_3', text: 'Adaptar el diseño a múltiples formatos estándar (1:1, 9:16, 16:9) si aplica.', completed: false },
      { id: 'step_4', text: 'Comprimir imágenes (peso ideal < 350kb por banner) y exportar en WebP.', completed: false },
      { id: 'step_5', text: 'Registrar enlace de entrega en figma/drive en la planilla de conversiones.', completed: false }
    ]
  },
  {
    id: 'task_003',
    title: 'Rediseño Banner Principal Home',
    description: 'Actualización estacional del banner tipo slider número 1 de la web principal.',
    templateId: 'temp_web',
    assigneeId: 'des_elena', // Freelance
    urgency: 'Media',
    status: 'Pendiente',
    createdAt: now - 12 * hourInMs,
    checklist: [
      { id: 'step_1', text: 'Verificar encuadre considerando safe-zones donde irá texto dinámico.', completed: false },
      { id: 'step_2', text: 'Revisar resolución de assets de producto integrados en el diseño.', completed: false },
      { id: 'step_3', text: 'Garantizar contraste óptimo entre fondo y Call to Action (CTA).', completed: false },
      { id: 'step_4', text: 'Optimizar exportación en WebP/SVG para velocidad de carga web.', completed: false },
      { id: 'step_5', text: 'Nombrar archivo siguiendo la nomenclatura del sitio (ej: HERO_PRODUCTO_FECHA.webp).', completed: false }
    ]
  },
  {
    id: 'task_004',
    title: 'Brochure Institucional 8 Páginas',
    description: 'Ajuste de textos y reemplazo de fotos en el folleto corporativo para enviarlo a la imprenta local.',
    templateId: 'temp_print',
    assigneeId: 'des_javier', // Freelance
    urgency: 'Baja',
    status: 'Pendiente',
    createdAt: now - 2 * dayInMs,
    checklist: [
      { id: 'step_1', text: 'Convertir el perfil de color a modo de impresión CMYK.', completed: false },
      { id: 'step_2', text: 'Añadir 3mm de demasía (sangría / bleed) en el documento de corte.', completed: false },
      { id: 'step_3', text: 'Convertir todos los textos y fuentes tipográficas a curvas vectoriales.', completed: false },
      { id: 'step_4', text: 'Garantizar que todas las imágenes incrustadas tengan un mínimo de 300 DPI.', completed: false },
      { id: 'step_5', text: 'Exportar en PDF de Alta Resolución con marcas de corte y registro activadas.', completed: false }
    ]
  },
  {
    id: 'task_005',
    title: 'Stories Semanales: Preguntas Frecuentes',
    description: 'Kit de 5 stories con diseño de interacción para resolver dudas de soporte habituales.',
    templateId: 'temp_rrss',
    assigneeId: 'des_javier', // Freelance
    urgency: 'Media',
    status: 'Completada',
    createdAt: now - 2 * dayInMs,
    startTime: now - 1 * dayInMs - 3 * hourInMs,
    endTime: now - 1 * dayInMs - 1.2 * hourInMs, // Tomó 1h 48m
    durationMs: 1.8 * hourInMs,
    notes: 'Javier comentó: Todo liso, ya subido a la carpeta FAQ.',
    checklist: [
      { id: 'step_1', text: 'Confirmar dimensiones requeridas (ej: 1080x1080 Post, 1080x1920 Story).', completed: true },
      { id: 'step_2', text: 'Alinear con la paleta de colores y línea gráfica de la marca seleccionada.', completed: true },
      { id: 'step_3', text: 'Revisar la ortografía de los textos utilizando corrector.', completed: true },
      { id: 'step_4', text: 'Asegurar legibilidad de texto y que los logos tengan el margen de seguridad.', completed: true },
      { id: 'step_5', text: 'Exportar en formato PNG a máxima calidad (@2x).', completed: true },
      { id: 'step_6', text: 'Subir los archivos finales organizados en la carpeta de Drive compartida.', completed: true }
    ]
  }
];
