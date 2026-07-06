export default function DatabaseError() {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30 p-6 text-center">
            <p className="text-red-800 dark:text-red-200 font-medium">
                Error al conectar con la base de datos
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                Los datos no están disponibles en este momento.
                Por favor intenta nuevamente más tarde.
            </p>
        </div>
    );
}
