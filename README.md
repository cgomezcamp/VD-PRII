# Turismo y bienestar social en Canarias · ¿Quién se beneficia?

Reportaje interactivo de datos que cruza el auge turístico de Canarias con sus
indicadores de pobreza, economía y percepción social, a partir de datos del
**ISTAC** (Instituto Canario de Estadística).

🔗 **Visualización en vivo:** 

## Preguntas que responde

1. ¿Ha crecido el bienestar de la población al mismo ritmo que el turismo?
2. ¿Concentran las mismas islas el turismo y el malestar social?
3. ¿Cómo perciben los residentes el impacto del turismo (por isla, sexo y edad)?

## Contenido del repositorio

```
index.html        Estructura del reportaje
style.css         Estilos (tema editorial)
charts.js         Visualizaciones interactivas con D3.js
data.js           Datos del proyecto embebidos (generados desde el ISTAC)
LICENSE           Licencia MIT
```

## Tecnología

HTML + CSS + JavaScript con [D3.js](https://d3js.org/) (vía CDN). Sin dependencias
que instalar ni backend: es un sitio totalmente estático.


## Fuentes

Instituto Canario de Estadística (ISTAC): encuesta ECOSOC, FRONTUR, indicador
AROPE, Contabilidad regional (PIB) y residuos urbanos. Los CSV de `datos/`
contienen los conjuntos ya limpios y reestructurados en formato largo.

## Licencia

Código publicado bajo licencia [MIT](LICENSE).
