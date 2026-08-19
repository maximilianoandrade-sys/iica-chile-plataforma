'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ExternalLink, ChevronDown } from 'lucide-react';
import type { Project } from '@/lib/data';

interface CalendarReminderButtonProps {
  project: Project;
  variant?: 'button' | 'icon' | 'badge';
  className?: string;
}

export function CalendarReminderButton({ project, variant = 'button', className = '' }: CalendarReminderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!project.fecha_cierre) return null;

  // Format dates for Google Calendar and iCal
  const closingDate = new Date(project.fecha_cierre);
  if (Number.isNaN(closingDate.getTime())) return null;

  // Event times: 09:00 to 17:00 on the closing date
  const startDateStr = closingDate.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 8) + 'T090000Z';
  const endDateStr = closingDate.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 8) + 'T170000Z';

  const title = encodeURIComponent(`[Cierre Concurso] ${project.nombre} (${project.institucion})`);
  const details = encodeURIComponent(
    `Recordatorio de Cierre de Convocatoria IICA Chile:\n\n` +
    `Proyecto: ${project.nombre}\n` +
    `Institución: ${project.institucion}\n` +
    `Monto: ${project.montoTexto || 'Ver bases'}\n` +
    `Enlace a bases oficiales: ${project.url_bases || 'https://iica-chile-plataforma.vercel.app'}\n\n` +
    `Plataforma Radar de Oportunidades IICA Chile`
  );
  const location = encodeURIComponent(project.url_bases || 'Plataforma IICA Chile');

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&location=${location}`;

  // Download .ics file
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IICA Chile//Radar Oportunidades 2026//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:iica-project-${project.id}-${Date.now()}@iica.int`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15)}Z`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:[Cierre Concurso] ${project.nombre.replace(/\n/g, ' ')}`,
      `DESCRIPTION:${project.nombre.replace(/\n/g, ' ')} - ${project.institucion} - Bases: ${project.url_bases || ''}`,
      `LOCATION:${project.url_bases || 'IICA Chile'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `cierre-concurso-${project.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1.5 text-gray-500 hover:text-[var(--iica-blue)] dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
          title="Agendar recordatorio en calendario"
          aria-label="Agendar recordatorio en mi calendario"
        >
          <Calendar className="w-4 h-4" />
        </button>
      ) : variant === 'badge' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-1 rounded-md transition-colors border border-emerald-200 dark:border-emerald-800"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agendar</span>
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-sm min-h-[44px]"
        >
          <Calendar className="w-4 h-4" />
          <span>Agendar Cierre en mi Calendario</span>
          <ChevronDown className="w-4 h-4 opacity-80" />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-50 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[var(--iica-blue)] transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span>Google Calendar</span>
            </a>
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 transition-colors text-left"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Outlook / iCal (.ics)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
