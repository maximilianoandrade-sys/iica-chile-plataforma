def parsear_monto(monto_str):
    """
    Parsea un string de monto y devuelve el valor numérico para ordenamiento
    Ejemplos: "USD 50,000" -> 50000, "CLP 1,000,000" -> 1000000
    """
    if not monto_str or monto_str == 'N/A':
        return 0
    
    try:
        # Remover espacios y dividir por espacios
        parts = str(monto_str).strip().split()
        if len(parts) >= 2:
            # Tomar el último elemento que debería ser el número
            numero_str = parts[-1].replace(',', '').replace('.', '')
            return float(numero_str)
        else:
            # Si solo hay un elemento, intentar parsearlo directamente
            numero_str = str(monto_str).replace(',', '').replace('.', '')
            return float(numero_str)
    except (ValueError, IndexError):
        return 0