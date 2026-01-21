        </div >
    );
}

// Componente de Herramientas Rurales
function RuralTools({ project }: { project: Project }) {
    const { trackEvent } = useAnalytics();
    const [showMenu, setShowMenu] = useState(false);

    const handleWhatsApp = () => {
        const link = generateWhatsAppLink(project);
        window.open(link, '_blank');
        trackEvent('share_whatsapp', 'Share', project.nombre);
        setShowMenu(false);
    };

    const handleCalendar = () => {
        downloadICSFile(project);
        trackEvent('add_to_calendar', 'Calendar', project.nombre);
        setShowMenu(false);
    };

    const handleGoogleCalendar = () => {
        const link = generateGoogleCalendarLink(project);
        window.open(link, '_blank');
        trackEvent('add_to_google_calendar', 'Calendar', project.nombre);
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                aria-label="Herramientas adicionales"
                title="Compartir y recordatorios"
            >
                <Share2 className="h-4 w-4" />
            </button>

            <AnimatePresence>
                {showMenu && (
                    <>
                        {/* Overlay para cerrar */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />

                        {/* Menú */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20"
                        >
                            <button
                                onClick={handleWhatsApp}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <MessageCircle className="h-4 w-4 text-green-600" />
                                <span>Compartir por WhatsApp</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                onClick={handleCalendar}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>Descargar .ics</span>
                            </button>

                            <button
                                onClick={handleGoogleCalendar}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span>Google Calendar</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
