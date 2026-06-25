import type { LegacyKnowledgeNode } from "./migrate-lesson"

export interface SubjectTemplate {
  key: string
  subject: string
  /** keywords that route an input to this template */
  match: string[]
  nodes: LegacyKnowledgeNode[]
}

const biologia: SubjectTemplate = {
  key: "biologia",
  subject: "Biología celular",
  match: ["celula", "célula", "biolog", "adn", "mitocondria", "membrana", "organismo", "genetic", "genét"],
  nodes: [
    {
      id: "celula",
      title: "La célula",
      summary: "Unidad básica estructural y funcional de los seres vivos.",
      detail:
        "La célula es la mínima porción de materia viva capaz de realizar todas las funciones vitales: nutrición, relación y reproducción. Todos los organismos están formados por una o más células.",
      examples: ["Una neurona es una célula especializada en transmitir señales.", "Una bacteria es un organismo de una sola célula."],
      level: 0,
      deps: [],
      questions: [
        {
          id: "celula-q1",
          question: "¿Qué define a la célula?",
          options: ["La unidad básica de los seres vivos", "Un tipo de molécula", "Un órgano", "Un tejido"],
          correctIndex: 0,
          explanation: "La célula es la unidad estructural y funcional mínima de la vida.",
        },
        {
          id: "celula-q2",
          question: "¿Cuántas células tiene una bacteria?",
          options: ["Ninguna", "Una", "Miles", "Depende de la especie"],
          correctIndex: 1,
          explanation: "Las bacterias son organismos unicelulares: una sola célula.",
        },
        {
          id: "celula-q3",
          question: "¿Qué funciones vitales realiza una célula?",
          options: ["Solo nutrición", "Nutrición, relación y reproducción", "Solo reproducción", "Ninguna"],
          correctIndex: 1,
          explanation: "Toda célula cumple las tres funciones vitales básicas.",
        },
      ],
    },
    {
      id: "membrana",
      title: "Membrana plasmática",
      summary: "Barrera selectiva que separa el interior celular del medio.",
      detail:
        "La membrana plasmática es una bicapa lipídica con proteínas embebidas. Regula qué entra y sale de la célula gracias a su permeabilidad selectiva.",
      examples: ["Deja pasar oxígeno pero controla el paso de iones.", "Sus proteínas actúan como canales y receptores."],
      level: 1,
      deps: ["celula"],
      questions: [
        {
          id: "membrana-q1",
          question: "¿De qué está formada principalmente la membrana?",
          options: ["Una bicapa lipídica", "Celulosa", "Calcio", "Almidón"],
          correctIndex: 0,
          explanation: "Su base es una doble capa de lípidos con proteínas.",
        },
        {
          id: "membrana-q2",
          question: "La permeabilidad de la membrana es...",
          options: ["Total", "Nula", "Selectiva", "Aleatoria"],
          correctIndex: 2,
          explanation: "Controla selectivamente el paso de sustancias.",
        },
        {
          id: "membrana-q3",
          question: "¿Qué función cumplen sus proteínas?",
          options: ["Solo decorativa", "Canales y receptores", "Producir energía", "Almacenar ADN"],
          correctIndex: 1,
          explanation: "Actúan como canales de transporte y receptores de señales.",
        },
      ],
    },
    {
      id: "nucleo",
      title: "Núcleo celular",
      summary: "Centro de control que guarda el material genético.",
      detail:
        "El núcleo contiene el ADN organizado en cromosomas y dirige la actividad celular. Está rodeado por la envoltura nuclear con poros que regulan el intercambio con el citoplasma.",
      examples: ["Controla la síntesis de proteínas.", "Los glóbulos rojos maduros pierden el núcleo."],
      level: 1,
      deps: ["celula"],
      questions: [
        {
          id: "nucleo-q1",
          question: "¿Qué guarda el núcleo?",
          options: ["Lípidos", "El material genético (ADN)", "Oxígeno", "Agua"],
          correctIndex: 1,
          explanation: "El núcleo almacena y protege el ADN.",
        },
        {
          id: "nucleo-q2",
          question: "El núcleo se considera el...",
          options: ["Centro de control", "Sistema de transporte", "Almacén de grasa", "Generador de calor"],
          correctIndex: 0,
          explanation: "Dirige la actividad de toda la célula.",
        },
        {
          id: "nucleo-q3",
          question: "¿Qué regulan los poros nucleares?",
          options: ["La temperatura", "El intercambio con el citoplasma", "La luz", "El color"],
          correctIndex: 1,
          explanation: "Permiten el paso controlado de moléculas entre núcleo y citoplasma.",
        },
      ],
    },
    {
      id: "transporte",
      title: "Transporte celular",
      summary: "Cómo entran y salen sustancias de la célula.",
      detail:
        "El transporte puede ser pasivo (sin gasto de energía, como la difusión y la ósmosis) o activo (con gasto de ATP para mover sustancias contra su gradiente).",
      examples: ["La ósmosis mueve agua según la concentración.", "La bomba sodio-potasio es transporte activo."],
      level: 2,
      deps: ["membrana"],
      questions: [
        {
          id: "transporte-q1",
          question: "El transporte pasivo...",
          options: ["Gasta energía", "No gasta energía", "Solo ocurre de noche", "Necesita luz"],
          correctIndex: 1,
          explanation: "El transporte pasivo no requiere ATP.",
        },
        {
          id: "transporte-q2",
          question: "La ósmosis es el movimiento de...",
          options: ["Proteínas", "Agua", "ADN", "Lípidos"],
          correctIndex: 1,
          explanation: "Es la difusión de agua a través de la membrana.",
        },
        {
          id: "transporte-q3",
          question: "La bomba sodio-potasio es un ejemplo de...",
          options: ["Transporte activo", "Difusión", "Ósmosis", "Filtración"],
          correctIndex: 0,
          explanation: "Usa ATP para mover iones contra su gradiente.",
        },
      ],
    },
    {
      id: "organelos",
      title: "Orgánulos",
      summary: "Estructuras internas con funciones especializadas.",
      detail:
        "Los orgánulos son compartimentos celulares como el retículo endoplásmico, el aparato de Golgi o los lisosomas, cada uno con una tarea concreta.",
      examples: ["El Golgi empaqueta proteínas.", "Los lisosomas digieren residuos."],
      level: 2,
      deps: ["membrana"],
      questions: [
        {
          id: "organelos-q1",
          question: "¿Qué hace el aparato de Golgi?",
          options: ["Empaqueta y distribuye proteínas", "Produce ADN", "Almacena agua", "Genera luz"],
          correctIndex: 0,
          explanation: "Modifica, empaqueta y envía proteínas y lípidos.",
        },
        {
          id: "organelos-q2",
          question: "Los lisosomas se encargan de...",
          options: ["La fotosíntesis", "Digerir residuos", "Dividir el núcleo", "Transportar oxígeno"],
          correctIndex: 1,
          explanation: "Contienen enzimas digestivas que degradan materiales.",
        },
        {
          id: "organelos-q3",
          question: "Un orgánulo es...",
          options: ["Un compartimento especializado", "Un tipo de célula", "Un organismo", "Un tejido"],
          correctIndex: 0,
          explanation: "Es una estructura interna con una función concreta.",
        },
      ],
    },
    {
      id: "adn",
      title: "ADN y genes",
      summary: "La molécula que guarda la información hereditaria.",
      detail:
        "El ADN es una doble hélice formada por nucleótidos. Los genes son fragmentos de ADN que codifican proteínas y determinan los rasgos del organismo.",
      examples: ["Un gen puede determinar el color de ojos.", "El ADN se copia antes de cada división."],
      level: 2,
      deps: ["nucleo"],
      questions: [
        {
          id: "adn-q1",
          question: "La estructura del ADN es una...",
          options: ["Esfera", "Doble hélice", "Línea recta", "Cuadrícula"],
          correctIndex: 1,
          explanation: "El ADN tiene forma de doble hélice.",
        },
        {
          id: "adn-q2",
          question: "Un gen es...",
          options: ["Un orgánulo", "Un fragmento de ADN que codifica proteínas", "Una célula", "Una proteína"],
          correctIndex: 1,
          explanation: "Es la unidad de información que codifica un producto.",
        },
        {
          id: "adn-q3",
          question: "¿Qué forma las 'letras' del ADN?",
          options: ["Aminoácidos", "Nucleótidos", "Lípidos", "Azúcares simples"],
          correctIndex: 1,
          explanation: "El ADN está hecho de nucleótidos (A, T, C, G).",
        },
      ],
    },
    {
      id: "mitocondria",
      title: "Mitocondrias",
      summary: "Las centrales energéticas de la célula.",
      detail:
        "Las mitocondrias producen ATP mediante la respiración celular. Tienen su propio ADN y una doble membrana con crestas que aumentan la superficie.",
      examples: ["Abundan en células musculares.", "Generan la energía del esfuerzo físico."],
      level: 3,
      deps: ["organelos"],
      questions: [
        {
          id: "mito-q1",
          question: "¿Qué producen las mitocondrias?",
          options: ["ADN", "ATP (energía)", "Lípidos", "Agua pura"],
          correctIndex: 1,
          explanation: "Son la fuente principal de ATP de la célula.",
        },
        {
          id: "mito-q2",
          question: "¿Cuántas membranas tiene una mitocondria?",
          options: ["Una", "Dos", "Tres", "Ninguna"],
          correctIndex: 1,
          explanation: "Posee una doble membrana, la interna forma crestas.",
        },
        {
          id: "mito-q3",
          question: "¿Dónde hay más mitocondrias?",
          options: ["Células poco activas", "Células musculares", "Células muertas", "Fuera de la célula"],
          correctIndex: 1,
          explanation: "Las células con alta demanda energética tienen más.",
        },
      ],
    },
    {
      id: "division",
      title: "División celular",
      summary: "Cómo una célula da lugar a nuevas células.",
      detail:
        "La mitosis genera dos células idénticas para crecimiento y reparación. La meiosis produce gametos con la mitad de cromosomas para la reproducción sexual.",
      examples: ["La piel se repara por mitosis.", "Los óvulos y espermatozoides surgen por meiosis."],
      level: 3,
      deps: ["adn"],
      questions: [
        {
          id: "div-q1",
          question: "La mitosis produce...",
          options: ["Dos células idénticas", "Cuatro gametos", "Una célula", "Ninguna"],
          correctIndex: 0,
          explanation: "Da lugar a dos células hijas genéticamente iguales.",
        },
        {
          id: "div-q2",
          question: "La meiosis sirve para...",
          options: ["Reparar heridas", "Producir gametos", "Generar energía", "Digerir alimentos"],
          correctIndex: 1,
          explanation: "Forma células sexuales con la mitad de cromosomas.",
        },
        {
          id: "div-q3",
          question: "Antes de dividirse, la célula debe...",
          options: ["Duplicar su ADN", "Perder el núcleo", "Dejar de respirar", "Reducir su tamaño"],
          correctIndex: 0,
          explanation: "Replica su ADN para repartirlo entre las hijas.",
        },
      ],
    },
    {
      id: "metabolismo",
      title: "Metabolismo",
      summary: "Conjunto de reacciones químicas de la célula.",
      detail:
        "El metabolismo incluye el anabolismo (construir moléculas con gasto de energía) y el catabolismo (descomponer moléculas liberando energía).",
      examples: ["Sintetizar proteínas es anabolismo.", "Degradar glucosa es catabolismo."],
      level: 4,
      deps: ["mitocondria"],
      questions: [
        {
          id: "meta-q1",
          question: "El anabolismo...",
          options: ["Construye moléculas", "Destruye moléculas", "No usa energía", "Solo ocurre en plantas"],
          correctIndex: 0,
          explanation: "Construye moléculas complejas consumiendo energía.",
        },
        {
          id: "meta-q2",
          question: "El catabolismo...",
          options: ["Libera energía", "Almacena ADN", "Crea células", "Forma membranas"],
          correctIndex: 0,
          explanation: "Descompone moléculas liberando energía.",
        },
        {
          id: "meta-q3",
          question: "El metabolismo es el conjunto de...",
          options: ["Reacciones químicas celulares", "Orgánulos", "Genes", "Membranas"],
          correctIndex: 0,
          explanation: "Agrupa todas las reacciones químicas de la célula.",
        },
      ],
    },
    {
      id: "respiracion",
      title: "Respiración celular",
      summary: "Proceso que extrae energía de la glucosa.",
      detail:
        "La respiración celular oxida la glucosa en presencia de oxígeno para producir ATP, agua y dióxido de carbono. Ocurre principalmente en las mitocondrias.",
      examples: ["Convierte azúcar en energía utilizable.", "Produce el CO2 que exhalamos."],
      level: 5,
      deps: ["metabolismo"],
      questions: [
        {
          id: "resp-q1",
          question: "¿Qué gas se necesita en la respiración aeróbica?",
          options: ["Nitrógeno", "Oxígeno", "Helio", "Hidrógeno"],
          correctIndex: 1,
          explanation: "Usa oxígeno para oxidar la glucosa.",
        },
        {
          id: "resp-q2",
          question: "¿Qué se obtiene principalmente?",
          options: ["ADN", "ATP", "Proteínas", "Lípidos"],
          correctIndex: 1,
          explanation: "El objetivo es producir energía en forma de ATP.",
        },
        {
          id: "resp-q3",
          question: "¿Dónde ocurre principalmente?",
          options: ["En el núcleo", "En las mitocondrias", "En la membrana", "En el Golgi"],
          correctIndex: 1,
          explanation: "Las mitocondrias son su sede principal.",
        },
      ],
    },
  ],
}

const historia: SubjectTemplate = {
  key: "historia",
  subject: "Revolución Industrial",
  match: ["historia", "revoluc", "industrial", "guerra", "imperio", "siglo", "vapor", "fábrica", "obrer"],
  nodes: [
    {
      id: "contexto",
      title: "Contexto previo",
      summary: "La sociedad agraria antes de la industrialización.",
      detail:
        "Antes del siglo XVIII la economía era mayoritariamente agraria y artesanal. La producción era manual, lenta y dependía del campo.",
      examples: ["La mayoría vivía en zonas rurales.", "Los gremios controlaban la artesanía."],
      level: 0,
      deps: [],
      questions: [
        {
          id: "ctx-q1",
          question: "¿Cómo era la economía antes de la industrialización?",
          options: ["Agraria y artesanal", "Digital", "Industrial", "De servicios"],
          correctIndex: 0,
          explanation: "Dominaban la agricultura y la artesanía manual.",
        },
        {
          id: "ctx-q2",
          question: "¿Dónde vivía la mayoría de la población?",
          options: ["En ciudades", "En zonas rurales", "En fábricas", "En el extranjero"],
          correctIndex: 1,
          explanation: "La población era predominantemente rural.",
        },
        {
          id: "ctx-q3",
          question: "¿Quién controlaba la artesanía?",
          options: ["Las fábricas", "Los gremios", "Los bancos", "El Estado"],
          correctIndex: 1,
          explanation: "Los gremios regulaban los oficios artesanales.",
        },
      ],
    },
    {
      id: "maquina-vapor",
      title: "La máquina de vapor",
      summary: "El invento que impulsó la producción mecanizada.",
      detail:
        "La máquina de vapor de James Watt permitió mover maquinaria sin depender de la fuerza humana o animal, multiplicando la capacidad productiva.",
      examples: ["Impulsó telares mecánicos.", "Hizo posible el ferrocarril."],
      level: 1,
      deps: ["contexto"],
      questions: [
        {
          id: "vap-q1",
          question: "¿Quién perfeccionó la máquina de vapor?",
          options: ["Newton", "James Watt", "Edison", "Darwin"],
          correctIndex: 1,
          explanation: "James Watt mejoró su eficiencia de forma decisiva.",
        },
        {
          id: "vap-q2",
          question: "¿Qué permitió la máquina de vapor?",
          options: ["Mover maquinaria mecánicamente", "Generar electricidad doméstica", "Volar", "Comunicarse a distancia"],
          correctIndex: 0,
          explanation: "Mecanizó la producción sin fuerza humana o animal.",
        },
        {
          id: "vap-q3",
          question: "¿Qué transporte hizo posible?",
          options: ["El avión", "El ferrocarril", "El coche eléctrico", "El cohete"],
          correctIndex: 1,
          explanation: "El vapor impulsó locomotoras y barcos.",
        },
      ],
    },
    {
      id: "fabricas",
      title: "El sistema fabril",
      summary: "Concentración de la producción en fábricas.",
      detail:
        "El trabajo pasó de los talleres domésticos a grandes fábricas con máquinas, donde se concentraban muchos obreros bajo horarios estrictos.",
      examples: ["Las fábricas textiles dominaban el paisaje.", "Se trabajaba por turnos largos."],
      level: 2,
      deps: ["maquina-vapor"],
      questions: [
        {
          id: "fab-q1",
          question: "El sistema fabril concentró...",
          options: ["La producción en fábricas", "El campo", "Los gremios", "La artesanía doméstica"],
          correctIndex: 0,
          explanation: "Reunió máquinas y obreros en grandes fábricas.",
        },
        {
          id: "fab-q2",
          question: "¿Qué sector destacó primero?",
          options: ["El textil", "El espacial", "El informático", "El turístico"],
          correctIndex: 0,
          explanation: "La industria textil fue pionera.",
        },
        {
          id: "fab-q3",
          question: "Los horarios de trabajo eran...",
          options: ["Cortos", "Largos y estrictos", "Inexistentes", "Flexibles"],
          correctIndex: 1,
          explanation: "Las jornadas eran largas y muy reguladas.",
        },
      ],
    },
    {
      id: "urbanizacion",
      title: "Urbanización",
      summary: "Migración masiva del campo a la ciudad.",
      detail:
        "La industrialización atrajo a millones de personas a las ciudades en busca de trabajo, provocando un crecimiento urbano rápido y desordenado.",
      examples: ["Manchester creció enormemente.", "Surgieron barrios obreros hacinados."],
      level: 3,
      deps: ["fabricas"],
      questions: [
        {
          id: "urb-q1",
          question: "La urbanización implicó...",
          options: ["Migración del campo a la ciudad", "Abandono de las ciudades", "Más agricultura", "Menos población"],
          correctIndex: 0,
          explanation: "La gente migró a las ciudades industriales.",
        },
        {
          id: "urb-q2",
          question: "El crecimiento urbano fue...",
          options: ["Lento y planificado", "Rápido y desordenado", "Inexistente", "Solo rural"],
          correctIndex: 1,
          explanation: "Creció de forma acelerada y caótica.",
        },
        {
          id: "urb-q3",
          question: "¿Qué surgió en las ciudades industriales?",
          options: ["Barrios obreros hacinados", "Zonas turísticas", "Parques naturales", "Universidades rurales"],
          correctIndex: 0,
          explanation: "Aparecieron barrios obreros superpoblados.",
        },
      ],
    },
    {
      id: "clase-obrera",
      title: "La clase obrera",
      summary: "Nace un nuevo grupo social: el proletariado.",
      detail:
        "La clase obrera vendía su fuerza de trabajo a cambio de un salario, con condiciones laborales duras que impulsaron las primeras reivindicaciones.",
      examples: ["Trabajo infantil en las fábricas.", "Salarios bajos y jornadas largas."],
      level: 4,
      deps: ["urbanizacion"],
      questions: [
        {
          id: "obr-q1",
          question: "El proletariado vendía...",
          options: ["Tierras", "Su fuerza de trabajo", "Fábricas", "Máquinas"],
          correctIndex: 1,
          explanation: "Vivía de su salario a cambio de trabajo.",
        },
        {
          id: "obr-q2",
          question: "Las condiciones laborales eran...",
          options: ["Excelentes", "Duras", "Inexistentes", "Voluntarias"],
          correctIndex: 1,
          explanation: "Eran muy duras: jornadas largas y poca seguridad.",
        },
        {
          id: "obr-q3",
          question: "Una injusticia frecuente fue...",
          options: ["El trabajo infantil", "Las vacaciones pagadas", "El teletrabajo", "Los seguros médicos"],
          correctIndex: 0,
          explanation: "El trabajo infantil era habitual en las fábricas.",
        },
      ],
    },
    {
      id: "sindicatos",
      title: "Movimiento obrero",
      summary: "Organización de los trabajadores para defender derechos.",
      detail:
        "Los obreros se agruparon en sindicatos para negociar salarios y condiciones, dando origen a huelgas y a las primeras leyes laborales.",
      examples: ["Primeras huelgas organizadas.", "Reclamo de la jornada de 8 horas."],
      level: 5,
      deps: ["clase-obrera"],
      questions: [
        {
          id: "sin-q1",
          question: "Los sindicatos servían para...",
          options: ["Defender los derechos obreros", "Construir máquinas", "Gobernar el país", "Vender productos"],
          correctIndex: 0,
          explanation: "Agrupaban a trabajadores para negociar mejoras.",
        },
        {
          id: "sin-q2",
          question: "Una herramienta del movimiento obrero fue...",
          options: ["La huelga", "La guerra", "El comercio", "La emigración"],
          correctIndex: 0,
          explanation: "La huelga presionaba a los empresarios.",
        },
        {
          id: "sin-q3",
          question: "Una reivindicación clásica fue...",
          options: ["Jornada de 8 horas", "Eliminar los salarios", "Más horas de trabajo", "Cerrar fábricas"],
          correctIndex: 0,
          explanation: "Se reclamaba reducir la jornada a 8 horas.",
        },
      ],
    },
    {
      id: "ferrocarril",
      title: "El ferrocarril",
      summary: "Revolución del transporte de personas y mercancías.",
      detail:
        "El ferrocarril, impulsado por el vapor, abarató y aceleró el transporte, integrando mercados y favoreciendo el comercio a gran escala.",
      examples: ["Conectó ciudades industriales.", "Redujo el coste del transporte de carbón."],
      level: 2,
      deps: ["maquina-vapor"],
      questions: [
        {
          id: "fer-q1",
          question: "El ferrocarril funcionaba con...",
          options: ["Electricidad solar", "Vapor", "Viento", "Energía nuclear"],
          correctIndex: 1,
          explanation: "Las primeras locomotoras eran de vapor.",
        },
        {
          id: "fer-q2",
          question: "El ferrocarril ayudó a...",
          options: ["Integrar mercados", "Aislar regiones", "Frenar el comercio", "Reducir la población"],
          correctIndex: 0,
          explanation: "Conectó mercados y abarató el transporte.",
        },
        {
          id: "fer-q3",
          question: "¿Qué transportaba de forma clave?",
          options: ["Carbón y mercancías", "Solo personas", "Nada", "Solo correo"],
          correctIndex: 0,
          explanation: "Movía materias primas y productos industriales.",
        },
      ],
    },
    {
      id: "capitalismo",
      title: "Capitalismo industrial",
      summary: "Sistema económico basado en el capital y el mercado.",
      detail:
        "El capitalismo industrial se basa en la propiedad privada de los medios de producción, la inversión de capital y la búsqueda de beneficio en el mercado.",
      examples: ["Empresarios reinvierten beneficios.", "La competencia regula los precios."],
      level: 3,
      deps: ["fabricas"],
      questions: [
        {
          id: "cap-q1",
          question: "El capitalismo se basa en...",
          options: ["La propiedad privada y el beneficio", "El reparto igualitario", "La economía agraria", "El trueque"],
          correctIndex: 0,
          explanation: "Se apoya en el capital privado y el lucro.",
        },
        {
          id: "cap-q2",
          question: "¿Quién posee los medios de producción?",
          options: ["El Estado solo", "Empresarios privados", "Los gremios", "Nadie"],
          correctIndex: 1,
          explanation: "Pertenecen a propietarios privados.",
        },
        {
          id: "cap-q3",
          question: "¿Qué regula los precios en este sistema?",
          options: ["La competencia y el mercado", "La iglesia", "El clima", "La nobleza"],
          correctIndex: 0,
          explanation: "El mercado y la competencia fijan los precios.",
        },
      ],
    },
    {
      id: "consecuencias",
      title: "Consecuencias sociales",
      summary: "Transformación profunda de la sociedad.",
      detail:
        "La Revolución Industrial cambió la estructura social, creó nuevas clases, transformó las ciudades y sentó las bases del mundo contemporáneo.",
      examples: ["Crecimiento de la burguesía.", "Cambios en la vida cotidiana."],
      level: 6,
      deps: ["sindicatos", "capitalismo"],
      questions: [
        {
          id: "con-q1",
          question: "Una consecuencia social fue...",
          options: ["Nuevas clases sociales", "Menos población", "Regreso al campo", "Fin del comercio"],
          correctIndex: 0,
          explanation: "Surgieron la burguesía industrial y el proletariado.",
        },
        {
          id: "con-q2",
          question: "La Revolución Industrial sentó las bases del...",
          options: ["Mundo contemporáneo", "Imperio romano", "Feudalismo", "Neolítico"],
          correctIndex: 0,
          explanation: "Configuró la sociedad moderna.",
        },
        {
          id: "con-q3",
          question: "¿Qué clase social ganó protagonismo?",
          options: ["La nobleza feudal", "La burguesía", "El clero", "Los esclavos"],
          correctIndex: 1,
          explanation: "La burguesía industrial se volvió dominante.",
        },
      ],
    },
  ],
}

const programacion: SubjectTemplate = {
  key: "programacion",
  subject: "Fundamentos de Programación",
  match: ["program", "código", "codigo", "javascript", "python", "variable", "función", "funcion", "algoritmo", "software", "bucle"],
  nodes: [
    {
      id: "algoritmo",
      title: "Algoritmos",
      summary: "Secuencia de pasos para resolver un problema.",
      detail:
        "Un algoritmo es un conjunto ordenado y finito de instrucciones que resuelven un problema o realizan una tarea. Es la base de cualquier programa.",
      examples: ["Una receta de cocina es un algoritmo.", "Ordenar una lista de números."],
      level: 0,
      deps: [],
      questions: [
        {
          id: "alg-q1",
          question: "¿Qué es un algoritmo?",
          options: ["Una secuencia de pasos para resolver un problema", "Un lenguaje", "Un ordenador", "Una variable"],
          correctIndex: 0,
          explanation: "Es un conjunto ordenado y finito de instrucciones.",
        },
        {
          id: "alg-q2",
          question: "Un algoritmo debe ser...",
          options: ["Infinito", "Finito y ordenado", "Aleatorio", "Secreto"],
          correctIndex: 1,
          explanation: "Tiene un número finito de pasos en orden.",
        },
        {
          id: "alg-q3",
          question: "¿Cuál es un ejemplo cotidiano?",
          options: ["Una receta de cocina", "Una piedra", "Un color", "Una nube"],
          correctIndex: 0,
          explanation: "Una receta describe pasos ordenados, como un algoritmo.",
        },
      ],
    },
    {
      id: "variables",
      title: "Variables",
      summary: "Espacios con nombre para guardar datos.",
      detail:
        "Una variable es un contenedor con nombre que almacena un valor que puede cambiar durante la ejecución del programa.",
      examples: ["edad = 25", "nombre = 'Ana'"],
      level: 1,
      deps: ["algoritmo"],
      questions: [
        {
          id: "var-q1",
          question: "Una variable sirve para...",
          options: ["Guardar un dato con nombre", "Dibujar en pantalla", "Apagar el equipo", "Conectarse a internet"],
          correctIndex: 0,
          explanation: "Almacena un valor accesible por su nombre.",
        },
        {
          id: "var-q2",
          question: "El valor de una variable...",
          options: ["Nunca cambia", "Puede cambiar", "Es siempre texto", "Es invisible"],
          correctIndex: 1,
          explanation: "Puede modificarse durante la ejecución.",
        },
        {
          id: "var-q3",
          question: "¿Cuál es una asignación válida?",
          options: ["edad = 25", "25 = edad", "= edad 25", "edad 25"],
          correctIndex: 0,
          explanation: "Se asigna el valor a la variable: nombre = valor.",
        },
      ],
    },
    {
      id: "tipos",
      title: "Tipos de datos",
      summary: "Categorías de información: números, texto, booleanos.",
      detail:
        "Los tipos de datos definen qué clase de valor guarda una variable: enteros, decimales, cadenas de texto o valores lógicos (verdadero/falso).",
      examples: ["42 es un entero.", "'hola' es una cadena."],
      level: 2,
      deps: ["variables"],
      questions: [
        {
          id: "tip-q1",
          question: "¿Qué tipo es 'hola'?",
          options: ["Número", "Cadena de texto", "Booleano", "Lista"],
          correctIndex: 1,
          explanation: "El texto entre comillas es una cadena (string).",
        },
        {
          id: "tip-q2",
          question: "Un booleano puede valer...",
          options: ["Verdadero o falso", "Cualquier número", "Solo texto", "Cualquier letra"],
          correctIndex: 0,
          explanation: "Representa true/false (verdadero o falso).",
        },
        {
          id: "tip-q3",
          question: "El número 42 es de tipo...",
          options: ["Entero", "Texto", "Booleano", "Nulo"],
          correctIndex: 0,
          explanation: "Es un número entero.",
        },
      ],
    },
    {
      id: "condicionales",
      title: "Condicionales",
      summary: "Tomar decisiones según una condición.",
      detail:
        "Las estructuras condicionales (if/else) ejecutan distintos bloques de código dependiendo de si una condición es verdadera o falsa.",
      examples: ["if edad >= 18: ...", "else: ..."],
      level: 3,
      deps: ["tipos"],
      questions: [
        {
          id: "cond-q1",
          question: "Un condicional permite...",
          options: ["Tomar decisiones", "Guardar datos", "Repetir infinitamente", "Apagar el PC"],
          correctIndex: 0,
          explanation: "Ejecuta código según una condición.",
        },
        {
          id: "cond-q2",
          question: "La palabra clave típica es...",
          options: ["if", "loop", "var", "print"],
          correctIndex: 0,
          explanation: "if evalúa una condición.",
        },
        {
          id: "cond-q3",
          question: "El bloque 'else' se ejecuta cuando...",
          options: ["La condición es falsa", "La condición es verdadera", "Siempre", "Nunca"],
          correctIndex: 0,
          explanation: "Se ejecuta si la condición del if no se cumple.",
        },
      ],
    },
    {
      id: "bucles",
      title: "Bucles",
      summary: "Repetir instrucciones varias veces.",
      detail:
        "Los bucles (for, while) repiten un bloque de código mientras se cumpla una condición o un número determinado de veces.",
      examples: ["for i in range(10): ...", "while activo: ..."],
      level: 3,
      deps: ["tipos"],
      questions: [
        {
          id: "buc-q1",
          question: "Un bucle sirve para...",
          options: ["Repetir instrucciones", "Tomar decisiones", "Guardar texto", "Sumar una sola vez"],
          correctIndex: 0,
          explanation: "Ejecuta un bloque repetidamente.",
        },
        {
          id: "buc-q2",
          question: "El bucle 'while' se repite mientras...",
          options: ["La condición sea verdadera", "Sea falsa", "Pase un minuto", "Haya internet"],
          correctIndex: 0,
          explanation: "Itera mientras la condición se cumpla.",
        },
        {
          id: "buc-q3",
          question: "¿Qué riesgo tiene un bucle mal hecho?",
          options: ["Bucle infinito", "Más memoria RAM", "Mejor rendimiento", "Nada"],
          correctIndex: 0,
          explanation: "Si la condición nunca cambia, se repite para siempre.",
        },
      ],
    },
    {
      id: "funciones",
      title: "Funciones",
      summary: "Bloques de código reutilizables con un nombre.",
      detail:
        "Una función agrupa instrucciones bajo un nombre para reutilizarlas. Puede recibir parámetros y devolver un resultado.",
      examples: ["def sumar(a, b): return a + b", "saludar('Ana')"],
      level: 4,
      deps: ["condicionales", "bucles"],
      questions: [
        {
          id: "fun-q1",
          question: "Una función permite...",
          options: ["Reutilizar código", "Apagar el equipo", "Crear variables globales solo", "Conectarse a la red"],
          correctIndex: 0,
          explanation: "Encapsula y reutiliza instrucciones.",
        },
        {
          id: "fun-q2",
          question: "Los datos que recibe una función son...",
          options: ["Parámetros", "Bucles", "Tipos", "Bits"],
          correctIndex: 0,
          explanation: "Se llaman parámetros o argumentos.",
        },
        {
          id: "fun-q3",
          question: "Una función puede...",
          options: ["Devolver un resultado", "Solo imprimir", "No hacer nada nunca", "Borrar el disco"],
          correctIndex: 0,
          explanation: "Puede retornar un valor con return.",
        },
      ],
    },
    {
      id: "estructuras",
      title: "Estructuras de datos",
      summary: "Formas de organizar colecciones de datos.",
      detail:
        "Las listas, diccionarios y conjuntos permiten almacenar y organizar varios valores de forma eficiente para su acceso y manipulación.",
      examples: ["Una lista: [1, 2, 3]", "Un diccionario: {'edad': 25}"],
      level: 5,
      deps: ["funciones"],
      questions: [
        {
          id: "est-q1",
          question: "Una lista guarda...",
          options: ["Varios valores ordenados", "Un solo valor", "Solo texto", "Solo booleanos"],
          correctIndex: 0,
          explanation: "Almacena una colección ordenada de elementos.",
        },
        {
          id: "est-q2",
          question: "Un diccionario asocia...",
          options: ["Claves con valores", "Solo números", "Bucles", "Funciones"],
          correctIndex: 0,
          explanation: "Relaciona claves con sus valores.",
        },
        {
          id: "est-q3",
          question: "¿Cuál es una lista válida?",
          options: ["[1, 2, 3]", "(1; 2; 3)", "1-2-3", "{1.2.3}"],
          correctIndex: 0,
          explanation: "Las listas usan corchetes y comas.",
        },
      ],
    },
    {
      id: "depuracion",
      title: "Depuración",
      summary: "Encontrar y corregir errores en el código.",
      detail:
        "Depurar (debugging) consiste en identificar, analizar y corregir errores. Herramientas como los mensajes de log o los puntos de interrupción ayudan en el proceso.",
      examples: ["Usar print para inspeccionar valores.", "Leer el mensaje de error."],
      level: 6,
      deps: ["estructuras"],
      questions: [
        {
          id: "dep-q1",
          question: "Depurar significa...",
          options: ["Corregir errores", "Escribir más errores", "Borrar el código", "Apagar el PC"],
          correctIndex: 0,
          explanation: "Es el proceso de encontrar y arreglar fallos.",
        },
        {
          id: "dep-q2",
          question: "Una técnica básica de depuración es...",
          options: ["Imprimir valores con print", "Ignorar los errores", "Reiniciar siempre", "Cambiar de lenguaje"],
          correctIndex: 0,
          explanation: "Inspeccionar valores ayuda a localizar el fallo.",
        },
        {
          id: "dep-q3",
          question: "Ante un error, lo primero es...",
          options: ["Leer el mensaje de error", "Borrar todo", "Cerrar el editor", "Esperar"],
          correctIndex: 0,
          explanation: "El mensaje suele indicar la causa y la línea.",
        },
      ],
    },
  ],
}

export const templates: SubjectTemplate[] = [biologia, historia, programacion]
