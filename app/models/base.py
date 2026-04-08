from sqlalchemy.ext.declarative import declarative_base

# Clase Base declarativa de SQLAlchemy
# Todos los modelos definidos en app/models/ heredarán de esta clase
# para ser reconocidos por el ORM y mapeados a tablas de la base de datos.
Base = declarative_base()
