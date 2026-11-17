/* Dexter · marcas especiales
   Cargar DESPUÉS de datos/regiones.js.
   - D.SHINY_LOCK: especies (o formas, escritas como "Especie (Forma)") que nunca se han podido obtener shiny de forma legítima en los juegos principales
     (lista aproximada; si sale una distribución shiny nueva, borra la especie de aquí).
   Las demás marcas se calculan solas en app.js:
   - Alfa: solo si la especie aparece en Leyendas: Arceus o Leyendas: Z-A (según disponibilidad.js).
   - Mega: solo si en meta tiene la categoría "mega".
   - Gigamax: solo si está en D.GMAX (disponibilidad.js). */
(function (D) {
  D.SHINY_LOCK = [
    "Victini",
    "Keldeo",
    "Hoopa",
    "Type: Null",
    "Silvally",
    "Cosmog",
    "Cosmoem",
    "Magearna",
    "Marshadow",
    "Poipole",
    "Naganadel",
    "Kubfu",
    "Urshifu",
    "Zarude",
    "Glastrier",
    "Spectrier",
    "Calyrex",
    "Eternatus",
    "Enamorus",
    "Koraidon",
    "Miraidon",
    "Walking Wake",
    "Iron Leaves",
    "Okidogi",
    "Munkidori",
    "Fezandipiti",
    "Ogerpon",
    "Gouging Fire",
    "Raging Bolt",
    "Iron Boulder",
    "Iron Crown",
    "Terapagos",
    "Pecharunt",
    "Ursaluna (Luna Carmesí)",
  ];
})(window.DATA);
