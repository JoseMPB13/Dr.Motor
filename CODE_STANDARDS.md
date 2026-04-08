# Estándares de Código para el Sistema de Gestión de Taller Mecánico

Este documento establece las directrices para la escritura, documentación y mantenimiento del código fuente del sistema de gestión de taller mecánico. El objetivo es asegurar la consistencia, legibilidad y facilidad de comprensión del código, especialmente para desarrolladores con diferentes niveles de experiencia.

## 1. Nivel de Detalle en Comentarios (Explicativo para Principiantes)

Todos los comentarios en el código deben ser **explicativos y detallados**, cubriendo tanto el _qué_ como el _cómo_ de las secciones de código. Esto está pensado para facilitar la comprensión a personas con menos experiencia en el proyecto o en la tecnología específica.

- **Propósito del Código:** Explica claramente qué hace un bloque de código, una función, una clase o un módulo.
- **Lógica Detallada:** Desglosa los pasos complejos o no obvios de la lógica de negocio.
- **Decisiones Importantes:** Documenta el _porqué_ detrás de decisiones de diseño o implementaciones específicas, especialmente si hay alternativas consideradas.
- **Variables y Estructuras:** Cuando sea necesario, explica el propósito y el contenido de variables clave, estructuras de datos o clases.

**Ejemplo (Python):**

```python
# Esta función calcula el monto total de una orden de trabajo
# sumando el precio de cada servicio realizado y su cantidad.
def calculate_work_order_total(db: Session, work_order_id: int) -> float:
    # Obtener la orden de trabajo específica de la base de datos
    work_order = db.query(models.WorkOrder).filter(models.WorkOrder.id == work_order_id).first()
    if not work_order:
        # Si la orden de trabajo no existe, lanzar una excepción
        raise ValueError("Orden de trabajo no encontrada.")

    total_amount = 0.0
    # Iterar sobre cada servicio asociado a la orden de trabajo
    for wo_service in work_order.services_performed:
        # Multiplicar el precio del servicio por la cantidad y sumarlo al total
        total_amount += wo_service.price_at_time * wo_service.quantity

    # Retornar el monto total calculado para la orden de trabajo
    return total_amount
```

## 2. Estilo de Documentación de Funciones (Docstrings Python)

Para las funciones y métodos en Python, se utilizará el formato **Google Style Docstrings**. Esto asegura una documentación rica y consistente que puede ser interpretada por herramientas de generación de documentación.

Cada docstring debe incluir al menos las siguientes secciones:

- **Breve descripción:** Un resumen conciso de lo que hace la función.
- **Argumentos (`Args`):** Descripción de cada parámetro, su tipo y propósito.
- **Retorna (`Returns`):** Descripción del valor retornado y su tipo.
- **Lanza (`Raises`):** Descripción de las excepciones que puede lanzar la función y bajo qué condiciones.

**Ejemplo (Python):**

```python
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Crea un nuevo usuario en la base de datos con una contraseña hasheada.

    Esta función toma los datos de un nuevo usuario, hashea su contraseña
    para almacenarla de forma segura y luego guarda el usuario en la BD.
    El rol predeterminado para nuevos usuarios es 'recepcionista'.

    Args:
        db (Session): La sesión de la base de datos SQLAlchemy.
        user (schemas.UserCreate): Esquema Pydantic con los datos del nuevo usuario (email, password, role).

    Returns:
        models.User: El objeto User recién creado y guardado en la base de datos.

    Raises:
        ValueError: Si la contraseña proporcionada es débil o inválida (ejemplo, no implementado aquí pero es una buena práctica).
    """
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

## 3. Comentarios en General (Comentarios en todo el código)

Se buscará una alta densidad de comentarios para garantizar que **todo el código sea fácilmente comprensible**, línea por línea o bloque por bloque.

- **Líneas de Código Complejas:** Cada línea o bloque de código que realice una operación no trivial debe tener un comentario explicativo.
- **Bucles y Condicionales:** Explica el propósito de los bucles (`for`, `while`) y las condiciones (`if`, `elif`, `else`).
- **Variables Locales Importantes:** Define el propósito de las variables locales que tienen un rol significativo en la lógica.
- **Constantes y Configuraciones:** Explica el significado de las constantes y los valores de configuración.
- **Comentarios de Sección:** Utiliza comentarios para demarcar y describir secciones lógicas dentro de una función o archivo.
- **Evitar Comentarios Obvios:** No es necesario comentar `x = x + 1` como "incrementa x en 1", a menos que haya un contexto muy específico.
- **Actualización de Comentarios:** Los comentarios deben mantenerse actualizados con los cambios en el código. Los comentarios obsoletos son peores que la falta de comentarios.

**Ejemplo (Python):**

```python
# Definir la ruta API para la creación de clientes
@router.post("/", response_model=schemas.Client)
def create_client(
    client_in: schemas.ClientCreate, # Pydantic schema para validar la entrada del cliente
    db: Session = Depends(get_db), # Inyectar la sesión de la base de datos
    current_user: schemas.User = Depends(security.get_current_active_recepcionista_or_admin_user) # Asegurar que el usuario esté autenticado y tenga el rol correcto
):
    """
    Endpoint para crear un nuevo cliente en el sistema.
    Solo usuarios con rol 'recepcionista' o 'admin' pueden acceder a esta funcionalidad.
    """
    # Buscar si ya existe un cliente con el mismo número de teléfono o email
    # Esto previene la duplicidad de registros y asegura la unicidad de datos clave.
    existing_client = crud_clients.get_client_by_phone_or_email(db, phone_number=client_in.phone_number, email=client_in.email)
    if existing_client:
        # Si se encuentra un cliente existente, devolver un error 400 Bad Request
        # Indicando que el recurso ya existe con los datos proporcionados.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un cliente con el mismo número de teléfono o email."
        )

    # Crear el nuevo cliente en la base de datos utilizando la función CRUD
    # La función crud_clients.create_client se encarga de la lógica de persistencia.
    new_client = crud_clients.create_client(db=db, client=client_in)

    # Retornar el objeto del cliente recién creado
    # El Pydantic schema (schemas.Client) se usa para formatear la respuesta.
    return new_client
```

## 4. Manejo de Errores (Documentación en Código y Comentarios)

La documentación del manejo de errores será exhaustiva, cubriendo tanto el _qué_ (qué error se captura) como el _porqué_ (razón de la captura, posibles escenarios y cómo se resuelve o propaga).

- **Bloques `try...except`:** Cada bloque `try...except` debe tener comentarios que expliquen:
  - **Propósito:** ¿Qué operaciones se están intentando en el `try` y qué errores se esperan?
  - **Excepción Capturada:** ¿Qué tipo de excepción se está capturando?
  - **Escenario de Error:** ¿En qué situaciones específicas se lanzaría esta excepción?
  - **Manejo del Error:** ¿Cómo se maneja la excepción (ej. logging, mensaje al usuario, rollback de transacción, relanzar una excepción diferente)?
- **Mensajes de Error al Usuario:** Los mensajes de error devueltos al usuario deben ser claros, informativos y amigables, evitando jergas técnicas.
- **Logging:** Todas las excepciones capturadas deben ser loggeadas con un nivel de detalle apropiado (ERROR, WARNING, INFO) para facilitar la depuración.

**Ejemplo (Python):**

```python
try:
    # Intentar obtener el usuario de la base de datos por su ID.
    # Esta operación podría fallar si la conexión a la base de datos se pierde
    # o si hay un problema a nivel de la sesión de SQLAlchemy.
    user = crud_users.get_user(db, user_id=user_id)
    if not user:
        # Si el usuario no es encontrado en la base de datos,
        # lanzamos una excepción HTTP 404 Not Found.
        # Esto indica al cliente que el recurso solicitado no existe.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Si el usuario se encuentra con éxito, lo retornamos.
    return user
except SQLAlchemyError as e:
    # Capturar cualquier error relacionado con SQLAlchemy durante la operación de base de datos.
    # Esto puede incluir problemas de conexión, errores de consulta, etc.
    # Registrar el error detalladamente para fines de depuración.
    # El log.error registrará el traceback completo.
    print(f"ERROR: Error de base de datos al intentar obtener usuario {user_id}: {e}") # Usar un logger real en producción
    # Lanzar una excepción HTTP 500 Internal Server Error,
    # ya que es un problema inesperado del servidor que impide completar la solicitud.
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor al procesar la solicitud.")
except Exception as e:
    # Capturar cualquier otra excepción inesperada que pueda ocurrir.
    # Esto actúa como un último recurso para evitar que la aplicación falle completamente.
    # Es crucial registrar este tipo de errores, ya que pueden indicar un bug no previsto.
    print(f"ERROR: Error inesperado al intentar obtener usuario {user_id}: {e}") # Usar un logger real en producción
    # Devolver un error 500 para el cliente, ya que el problema es del servidor.
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Ha ocurrido un error inesperado.")
```

## 5. Comportamiento del Agente al Generar Código

Cuando el agente genere o modifique código en el futuro, deberá adherirse estrictamente a estos estándares:

- **Comentarios Explicativos:** Incluir comentarios detallados en cada sección de código que no sea autoexplicativa, siguiendo el nivel de detalle "Explicativo para Principiantes".
- **Docstrings Completos:** Generar docstrings para todas las funciones y métodos públicos utilizando el formato Google Style Docstrings, incluyendo `Args`, `Returns` y `Raises`.
- **Manejo de Errores Documentado:** Implementar bloques `try...except` con comentarios claros sobre la excepción, el escenario y la estrategia de manejo, así como mensajes de error informativos.
- **Consistencia de Estilo:** Mantener el estilo de formateo, nomenclatura y estructura de directorios definido en `BACKEND_MVC.md` y `FRONTEND_UI.md`.
- **PEP 8:** Para el código Python, seguir las directrices de estilo PEP 8.
