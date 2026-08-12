'use client';

import { useState } from 'react';
import { CalendarPlus, Download, ExternalLink, ChevronDown } from 'lucide-react';
import type { Project } from '@/lib/data';

interface CalendarReminderButtonProps {
  project: Project;
  className?: string;
}

export function CalendarReminderButton({ project, className = '' }: CalendarReminderButtonProps) {
  const [open, setOpen] = useState(false);

  // Format YYYYMMDD date for Google Calendar
  const getFormattedDate = (dateStr: string): string => {
    if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      return tomorrow.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 8);
    }
    const clean = dateStr.replace(/-/g, '');
    return `${clean}T235900Z`;
  };

  const closeDateFormatted = getFormattedDate(project.fecha_cierre);
  
  const title = encodeURIComponent(`[IICA] Cierre Convocatoria: ${project.nombre}`);
  const details = encodeURIComponent(
    `Recordatorio de Cierre de Convocatoria:\n` +
    `Fondo: ${project.nombre}\n` +
    `Institución: ${project.institucion}\n` +
    `Monto: ${project.montoTexto || (project.monto ? `$${project.monto}` : 'Ver bases')}\n` +
    `Bases Oficiales: ${project.url_bases}\n\n` +
    `Generado por Radar de Oportunidades IICA Chile`
  );
  const location = encodeURIComponent(project.url_bases);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${closeDateFormatted}/${closeDateFormatted}&details=${details}&location=${location}`;

  const downloadIcs = () => {
    const cleanDate = project.fecha_cierre ? project.fecha_cierre.replace(/-/g, '') : '20261231';
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IICA Chile//Radar Oportunidades//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:iica-project-${project.id}@iica.int`,
      `DTSTAMP:${cleanDate}T120000Z`,
      `DTSTART:${cleanDate}T090000Z`,
      `DTEND:${cleanDate}T180000Z`,
      `SUMMARY:[IICA] Cierre: ${project.nombre.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${(project.institucion + ' - ' + (project.montoTexto || '')).replace(/,/g, '\\,')}`,
      `URL:${project.url_bases}`,
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio IICA: Que quedan 7 días para el cierre del fondo',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-P2D',
      'ACTION:DISPLAY',
      'DESCRIPTION:URGENTE IICA: Quedan 2 días para el cierre del fondo',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cierre-fondo-${project.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 transition-all cursor-pointer min-h-[44px]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <CalendarPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>Agendar Cierre</span>
        <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in"
          role="menu"
        >
          <div className="p-2 space-y-1">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              role="menuitem"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={downloadIcs}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-left"
              role="menuitem"
            >
              <Download className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Outlook / Apple (.ics)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
