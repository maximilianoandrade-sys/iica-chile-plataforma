from flask import Flask, render_template
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

# Mock app setup similar to app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
app = Flask(__name__, template_folder=TEMPLATE_DIR)

# Mock data
proyectos_mock = [
    {
        "Nombre": "Proyecto Prueba",
        "Fuente": "FIA",
        "Estado": "Abierto",
        "Área de interés": "Agricultura",
        "Descripción": "Desc",
        "Enlace": "#",
        "Monto": "100"
    }
]

def test_render():
    with app.app_context():
        try:
            print("Tentative render...")
            html = render_template('todos_los_proyectos_mejorado.html',
                                  proyectos=proyectos_mock,
                                  total_proyectos=1,
                                  total_todos=1,
                                  areas_unicas=['Agricultura'],
                                  fuentes_unicas=['FIA'],
                                  estados_unicos=['Abierto'],
                                  query='',
                                  area='',
                                  fuente='',
                                  estado='')
            print("✅ Render success! Length:", len(html))
        except Exception as e:
            print("❌ Render FAILED:")
            print(e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_render()
