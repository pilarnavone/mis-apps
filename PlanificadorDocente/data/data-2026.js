const CLASES = [
  {n:1,  fecha:'Mié 19 ago', tipo:'clase',     teoria:'Clase presentación', practica:'Objetivo de la materia. Cronograma. Talleres y Proyecto. Armar grupos.', taller:'', comentario:'Mirar intro emilio'},
  {n:2,  fecha:'Lun 24 ago', tipo:'teoria',    teoria:'Unidad 1', practica:'', taller:'', comentario:''},
  {n:3,  fecha:'Mié 26 ago', tipo:'taller',    teoria:'', practica:'Procesos: definición, relación con objetivos, categorías, ingredientes.', taller:'Construcción de procesos e identificar tipos', comentario:'¿Metemos algo de datos?'},
  {n:4,  fecha:'Lun 31 ago', tipo:'teoria',    teoria:'Unidad 2', practica:'', taller:'', comentario:''},
  {n:5,  fecha:'Mié 2 sep',  tipo:'taller',    teoria:'', practica:'Industria - Organización - Procesos. Relevamiento. Mapa de Procesos.', taller:'Taller relevamiento e identificar industria', comentario:''},
  {n:6,  fecha:'Lun 7 sep',  tipo:'teoria',    teoria:'Unidad 3', practica:'', taller:'', comentario:''},
  {n:7,  fecha:'Mié 9 sep',  tipo:'taller',    teoria:'', practica:'Ciclo de vida. BPMN. Flujograma.', taller:'Taller armado Mapa de Procesos', comentario:'Ver si ciclo de vida se puede juntar con AS IS'},
  {n:8,  fecha:'Lun 14 sep', tipo:'sf',        teoria:'Semana de Finales', practica:'', taller:'', comentario:''},
  {n:9,  fecha:'Mié 16 sep', tipo:'sf',        teoria:'Semana de Finales', practica:'', taller:'', comentario:''},
  {n:10, fecha:'Lun 21 sep', tipo:'feriado',   teoria:'Día del Estudiante', practica:'', taller:'', comentario:''},
  {n:11, fecha:'Mié 23 sep', tipo:'parcial',   teoria:'', practica:'Primer Parcial', taller:'', comentario:''},
  {n:12, fecha:'Lun 28 sep', tipo:'teoria',    teoria:'Unidad 4', practica:'', taller:'', comentario:''},
  {n:13, fecha:'Mié 30 sep', tipo:'taller',    teoria:'', practica:'Análisis de procesos AS IS. Métricas, cuellos de botella, priorización. Presentación Proyecto.', taller:'Presentación proyecto', comentario:'¿Adelantar taller de flujograma?'},
  {n:14, fecha:'Lun 5 oct',  tipo:'teoria',    teoria:'Unidad 5', practica:'', taller:'', comentario:''},
  {n:15, fecha:'Mié 7 oct',  tipo:'taller',    teoria:'', practica:'Taller exhaustivo Flujograma', taller:'Taller flujograma con invitado', comentario:'Recu 1er Parcial — que tome Javi'},
  {n:16, fecha:'Lun 12 oct', tipo:'feriado',   teoria:'Feriado', practica:'', taller:'', comentario:''},
  {n:17, fecha:'Mié 14 oct', tipo:'clase',     teoria:'', practica:'TO BE. Mejoras y Reingeniería. Tareas manuales/repetitivas. Incorporación de SI.', taller:'Taller armado tablero datos?', comentario:''},
  {n:18, fecha:'Lun 19 oct', tipo:'sf',        teoria:'Unidad 6 — SF', practica:'', taller:'', comentario:'SF'},
  {n:19, fecha:'Mié 21 oct', tipo:'exposicion',teoria:'', practica:'Exposición Proyecto', taller:'', comentario:''},
  {n:20, fecha:'Lun 26 oct', tipo:'teoria',    teoria:'Unidad 7', practica:'', taller:'', comentario:''},
  {n:21, fecha:'Mié 28 oct', tipo:'clase',     teoria:'', practica:'Gestión del cambio. Gestión del riesgo. Implementación de nuevos procesos.', taller:'', comentario:'Definir si dividimos en dos aulas'},
  {n:22, fecha:'Lun 2 nov',  tipo:'parcial',   teoria:'Segundo Parcial', practica:'', taller:'', comentario:''},
  {n:23, fecha:'Mié 4 nov',  tipo:'clase',     teoria:'', practica:'Automatización. IA.', taller:'', comentario:'Juntar ejemplos reales. Dividir en 2'},
  {n:24, fecha:'Lun 9 nov',  tipo:'sf',        teoria:'Semana de Finales', practica:'', taller:'', comentario:''},
  {n:25, fecha:'Mié 11 nov', tipo:'clase',     teoria:'Tutoría opcional', practica:'', taller:'', comentario:''},
  {n:26, fecha:'Lun 16 nov', tipo:'recu',      teoria:'Recuperatorio 2do Parcial', practica:'', taller:'', comentario:''},
  {n:27, fecha:'Mié 18 nov', tipo:'exposicion',teoria:'', practica:'Exposición Proyecto', taller:'', comentario:'¿Transversal? No estoy segura'},
  {n:28, fecha:'Lun 23 nov', tipo:'feriado',   teoria:'Feriado', practica:'', taller:'', comentario:''},
  {n:29, fecha:'Mié 25 nov', tipo:'exposicion',teoria:'', practica:'Exposición Proyecto', taller:'', comentario:''},
  {n:30, fecha:'Lun 30 nov', tipo:'recu',      teoria:'Recuperatorio General', practica:'', taller:'', comentario:''},
  {n:31, fecha:'Mié 2 dic',  tipo:'clase',     teoria:'', practica:'', taller:'', comentario:''},
  {n:32, fecha:'Lun 7 dic',  tipo:'feriado',   teoria:'Feriado', practica:'', taller:'', comentario:''},
];

const EVALUACIONES = [
  {id:'e1', nombre:'Primer Parcial',           fecha:'Mié 23 sep', tipo:'parcial',   checks:['Enunciado armado','Corrección completada','Notas cargadas en sistema']},
  {id:'e2', nombre:'Recuperatorio 1er Parcial',fecha:'Mié 7 oct',  tipo:'recu',      checks:['Enunciado armado','Corrección completada','Notas cargadas en sistema']},
  {id:'e3', nombre:'Segundo Parcial',          fecha:'Lun 2 nov',  tipo:'parcial',   checks:['Enunciado armado','Corrección completada','Notas cargadas en sistema']},
  {id:'e4', nombre:'Recuperatorio 2do Parcial',fecha:'Lun 16 nov', tipo:'recu',      checks:['Enunciado armado','Corrección completada','Notas cargadas en sistema']},
  {id:'e5', nombre:'Recuperatorio General',    fecha:'Lun 30 nov', tipo:'recu',      checks:['Enunciado armado','Corrección completada','Notas cargadas en sistema']},
  {id:'e6', nombre:'Entrega Caso de Estudio',  fecha:'Mié 30 sep', tipo:'exposicion',checks:['Rúbrica lista','Corrección completada','Notas cargadas en sistema']},
  {id:'e7', nombre:'Exposición Proyecto (1ra)',fecha:'Mié 21 oct', tipo:'exposicion',checks:['Rúbrica lista','Corrección completada','Notas cargadas en sistema']},
  {id:'e8', nombre:'Exposición Proyecto (Final)',fecha:'Mié 25 nov',tipo:'exposicion',checks:['Rúbrica lista','Corrección completada','Notas cargadas en sistema']},
];

const HITOS_DEFAULT = [
  {nombre:'Definición del caso de estudio', fecha:'Ago 2026', done:false, nota:''},
  {nombre:'Primera entrega / avance grupos', fecha:'Sep 2026', done:false, nota:''},
  {nombre:'Exposición intermedia', fecha:'Oct 2026', done:false, nota:''},
  {nombre:'Entrega final', fecha:'Nov 2026', done:false, nota:''},
];

const RUBRICA_PARTES = [
  {
    id: 'p1', titulo: 'Parte I — Encuadre del problema y definición de la propuesta',
    items: [
      { id: 'p1_1', label: 'Descripción clara del problema: situación actual vs. deseada y justificación de relevancia' },
      { id: 'p1_2', label: 'Justificación con impacto esperado y al menos una referencia cuantificable' },
      { id: 'p1_3', label: 'Análisis de soluciones existentes: alternativas, limitaciones y oportunidad de diferenciación' },
      { id: 'p1_4', label: 'Definición del usuario o segmento objetivo' },
      { id: 'p1_5', label: 'Propuesta de Valor preliminar y Visión de Producto inicial' },
      { id: 'p1_6', label: 'Rol de la IA en la propuesta de valor (aporte o justificación de no uso)' },
      { id: 'p1_7', label: 'Definición de hipótesis clave: de valor, de uso y de adopción' },
      { id: 'p1_8', label: 'Validación preliminar: al menos una instancia de contraste con usuarios/fuentes y aprendizajes obtenidos' },
      { id: 'p1_9', label: 'Primer encuadre del modelo de negocio: cliente/pagador, captura de valor, sostenibilidad' },
    ]
  },
  {
    id: 'p2', titulo: 'Parte II — Diseño del Producto y experimentación',
    items: [
      { id: 'p2_1', label: 'Ajustes a la Propuesta de Valor y Visión de Producto respecto a Parte I' },
      { id: 'p2_2', label: 'Definición del PD: funcionalidades principales y alcance del MVP' },
      { id: 'p2_3', label: 'User Personas (hasta 3) y Journey Map aplicados al producto' },
      { id: 'p2_4', label: 'Priorización de funcionalidades: qué entra en el MVP, qué se posterga y por qué' },
      { id: 'p2_5', label: 'Justificación explícita de decisiones de diseño: criterios, trade-offs y alternativas consideradas' },
      { id: 'p2_6', label: 'Evidencia de validación: supuesto buscado, observación, decisión tomada y contraste del modelo de negocio' },
      { id: 'p2_7', label: 'Prototipo navegable del producto (mínimo requerido)' },
      { id: 'p2_8', label: 'Uso de IA en el diseño o funcionamiento: integración y valor aportado' },
      { id: 'p2_9', label: 'Desarrollo del modelo de negocio: captura de valor, tipo de monetización y supuestos a validar' },
    ]
  },
  {
    id: 'p3', titulo: 'Parte III — PD y modelo (Draft)',
    items: [
      { id: 'p3_1', label: 'Prototipo navegable de alta fidelidad o MVP funcional presentado' },
      { id: 'p3_2', label: 'Propuesta de Valor final consolidada' },
      { id: 'p3_3', label: 'Roadmap del producto: MVP definido y releases futuros' },
      { id: 'p3_4', label: 'Modelo de negocio completo (Business Model Canvas o equivalente)' },
      { id: 'p3_5', label: 'Métricas clave del producto y del negocio' },
      { id: 'p3_6', label: 'Análisis del uso de IA: beneficios, limitaciones y riesgos' },
      { id: 'p3_7', label: 'Preparación de la demo del producto' },
      { id: 'p3_8', label: 'Versión preliminar de la presentación final incluida' },
    ]
  },
  {
    id: 'p4', titulo: 'Entrega Final — Presentación y defensa oral',
    items: [
      { id: 'p4_1', label: 'Versión final del deck / documento entregada' },
      { id: 'p4_2', label: 'Producto Digital listo y funcional para demo' },
      { id: 'p4_3', label: 'Argumentación de decisiones clave tomadas a lo largo del proyecto y sus fundamentos' },
      { id: 'p4_4', label: 'Lógica del modelo de negocio: por qué crea valor, para quién y cómo lo captura' },
      { id: 'p4_5', label: 'Principales aprendizajes del proceso de validación expuestos con claridad' },
      { id: 'p4_6', label: 'Calidad del razonamiento que sostiene el producto (no solo el producto en sí)' },
    ]
  }
];
