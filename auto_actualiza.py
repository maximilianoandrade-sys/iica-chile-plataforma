from app import recolectar_todos, guardar_excel
proyectos = recolectar_todos()
guardar_excel(proyectos)
print("¡Actualización completa!")
