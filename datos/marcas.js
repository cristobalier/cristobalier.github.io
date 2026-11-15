/* Dexter · marcas especiales
   Cargar DESPUÉS de datos/regiones.js.
   - D.SHINY_LOCK: especies que nunca se han podido obtener shiny de forma legítima en los juegos principales
     (lista aproximada; si sale una distribución shiny nueva, borra la especie de aquí).
   Las demás marcas se calculan solas en app.js:
   - Alfa: solo si la especie aparece en Leyendas: Arceus o Leyendas: Z-A (según disponibilidad.js).
   - Mega: solo si en meta tiene la categoría "mega".
   - Gigamax: solo si está en D.GMAX (disponibilidad.js). */
(function (D) {
  D.SHINY_LOCK = [
    "Victini",
    "Keldeo",
    "Meloetta",
    "Hoopa",
    "Volcanion",
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
    "Wo-Chien",
    "Chien-Pao",
    "Ting-Lu",
    "Chi-Yu",
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
  ];
})(window.DATA);
