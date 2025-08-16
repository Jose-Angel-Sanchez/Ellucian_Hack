-- Insert sample courses for the learning platform
INSERT INTO courses (title, description, category, difficulty_level, estimated_duration, prerequisites, learning_objectives, content) VALUES
(
  'Introducción a JavaScript',
  'Aprende los fundamentos de JavaScript desde cero. Este curso te llevará desde los conceptos básicos hasta la programación orientada a objetos.',
  'Programación',
  'beginner',
  480,
  ARRAY[]::TEXT[],
  ARRAY['Entender variables y tipos de datos', 'Dominar funciones y scope', 'Trabajar con objetos y arrays', 'Manejar eventos del DOM'],
  '{
    "modules": [
      {
        "id": "intro",
        "title": "Introducción a JavaScript",
        "lessons": [
          {"id": "variables", "title": "Variables y Tipos de Datos", "duration": 45, "type": "video"},
          {"id": "operators", "title": "Operadores y Expresiones", "duration": 30, "type": "interactive"},
          {"id": "practice1", "title": "Práctica: Primeros Scripts", "duration": 60, "type": "exercise"}
        ]
      },
      {
        "id": "functions",
        "title": "Funciones y Scope",
        "lessons": [
          {"id": "functions-intro", "title": "Introducción a Funciones", "duration": 40, "type": "video"},
          {"id": "scope", "title": "Scope y Closures", "duration": 50, "type": "video"},
          {"id": "practice2", "title": "Ejercicios de Funciones", "duration": 90, "type": "exercise"}
        ]
      }
    ]
  }'::jsonb
),
(
  'Diseño UX/UI Moderno',
  'Domina los principios del diseño de experiencia de usuario y interfaces modernas. Aprende herramientas y metodologías actuales.',
  'Diseño',
  'intermediate',
  360,
  ARRAY['Conocimientos básicos de diseño']::TEXT[],
  ARRAY['Aplicar principios de UX', 'Crear wireframes y prototipos', 'Dominar herramientas de diseño', 'Realizar testing de usabilidad'],
  '{
    "modules": [
      {
        "id": "ux-fundamentals",
        "title": "Fundamentos de UX",
        "lessons": [
          {"id": "user-research", "title": "Investigación de Usuarios", "duration": 60, "type": "video"},
          {"id": "personas", "title": "Creación de Personas", "duration": 45, "type": "interactive"},
          {"id": "user-journey", "title": "Customer Journey Mapping", "duration": 75, "type": "exercise"}
        ]
      }
    ]
  }'::jsonb
),
(
  'Marketing Digital Avanzado',
  'Estrategias avanzadas de marketing digital, incluyendo SEO, SEM, redes sociales y analytics para maximizar el ROI.',
  'Marketing',
  'advanced',
  600,
  ARRAY['Marketing básico', 'Conocimientos de analytics']::TEXT[],
  ARRAY['Desarrollar estrategias SEO avanzadas', 'Optimizar campañas SEM', 'Dominar marketing en redes sociales', 'Analizar métricas y ROI'],
  '{
    "modules": [
      {
        "id": "seo-advanced",
        "title": "SEO Avanzado",
        "lessons": [
          {"id": "technical-seo", "title": "SEO Técnico", "duration": 90, "type": "video"},
          {"id": "content-strategy", "title": "Estrategia de Contenidos", "duration": 75, "type": "interactive"}
        ]
      }
    ]
  }'::jsonb
),
(
  'Inteligencia Artificial para Principiantes',
  'Introducción accesible al mundo de la IA. Aprende conceptos fundamentales, aplicaciones prácticas y herramientas básicas.',
  'Tecnología',
  'beginner',
  420,
  ARRAY[]::TEXT[],
  ARRAY['Comprender qué es la IA', 'Identificar aplicaciones de IA', 'Usar herramientas de IA básicas', 'Evaluar impacto ético de la IA'],
  '{
    "modules": [
      {
        "id": "ai-intro",
        "title": "¿Qué es la Inteligencia Artificial?",
        "lessons": [
          {"id": "ai-definition", "title": "Definición y Historia de la IA", "duration": 45, "type": "video"},
          {"id": "ai-types", "title": "Tipos de Inteligencia Artificial", "duration": 60, "type": "interactive"}
        ]
      }
    ]
  }'::jsonb
),
(
  'Gestión de Proyectos Ágiles',
  'Metodologías ágiles para la gestión eficiente de proyectos. Scrum, Kanban y herramientas modernas de colaboración.',
  'Gestión',
  'intermediate',
  300,
  ARRAY['Experiencia básica en proyectos']::TEXT[],
  ARRAY['Implementar metodologías ágiles', 'Facilitar ceremonias Scrum', 'Usar herramientas de gestión', 'Liderar equipos ágiles'],
  '{
    "modules": [
      {
        "id": "agile-fundamentals",
        "title": "Fundamentos Ágiles",
        "lessons": [
          {"id": "agile-manifesto", "title": "Manifiesto Ágil", "duration": 30, "type": "video"},
          {"id": "scrum-framework", "title": "Framework Scrum", "duration": 90, "type": "interactive"}
        ]
      }
    ]
  }'::jsonb
);
