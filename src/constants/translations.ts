export type Language = 'en' | 'es';

export const translations = {
  en: {
    hero: {
      tag: "AVAILABLE FOR PROJECTS",
      role: "FULL-STACK DEVELOPER",
      bio: "9th-semester Systems Engineering student specialized in building modern, high-performance web architectures. Focused on creating agile, stunning, and highly functional user interfaces with React, Django, and modern cloud technologies.",
      viewWork: "View Work",
      letsTalk: "Let's Talk",
    },
    sections: {
      experience: {
        tag: "Journey",
        title: "Experience",
        active: "Active",
        roles: [
          {
            role: "Systems Engineering (9th Semester)",
            company: "Universidad Santa María",
            date: "2022 - Present",
            desc: "Building a rigorous technical foundation with a focus on Database Architecture, Advanced Programming Logic, and Algorithms. Developing deep analytical skills to design scalable software architectures and translate theoretical models into high-performance digital solutions.",
          },
          {
            role: "B2C Customer Insights Intern",
            company: "Telefónica Venezolana C.A.",
            date: "Aug 2025 - Present",
            desc: "Engineered a full-stack campaign analytics platform. Architected a robust Django & SQL backend integrated with a high-performance React/TypeScript frontend, securely deployed on a remote Linux server for scalable data workflows.",
          },
          {
            role: "Freelance Full-Stack Developer",
            company: "Independent",
            date: "Present",
            desc: "Designing and engineering bespoke digital experiences, solving complex business problems through highly optimized React & Django applications for real-world clients.",
          },
        ]
      },
      skills: {
        tag: "Core Tech Stack",
        title: "The Architecture",
      },
      projects: {
        tag: "Selected Works",
        title: "Projects",
        tesisFar: {
          desc: "Full-stack platform for academic records management. Built with React and Django, featuring secure authentication and high-performance data processing.",
        },
        echoPlan: {
          desc: "Enterprise-grade planning solution for digital campaigns, optimizing massive data extraction and statistical visualization workflows.",
        },
        personalized: {
          title: "Fully Personalized Websites",
          status: "Available right now",
          desc: "I can help you build your dream project from scratch with the highest industry standards.",
          cta: "Concept to Code",
        }
      },
      contact: {
        tag: "Get in touch",
        time: "Local time",
        based: "Based in",
        developedBy: "Developed by",
        copyEmail: "Click to copy email",
        copied: "Copied!",
      },
      skillDescriptions: {
        "React": "Component-driven UI architecture for dynamic web applications.",
        "Next.js": "Production-ready framework with server-side rendering.",
        "Three.js": "3D rendering engine for immersive in-browser graphics.",
        "GSAP": "High-performance animation library for fluid web motion.",
        "Node.js": "Scalable JavaScript runtime for performant APIs.",
        "Python": "Versatile language for backend logic and data pipelines.",
        "SQL": "Relational database management for persistent storage.",
        "Django": "High-level Python web framework for rapid development.",
        "Tailwind": "Utility-first CSS framework for rapid UI styling.",
      }
    },
    preloader: ["DESIGN", "DEVELOP", "INNOVATE", "DEPLOY"]
  },
  es: {
    hero: {
      tag: "DISPONIBLE PARA PROYECTOS",
      role: "FULL-STACK DEVELOPER",
      bio: "Estudiante de Ingeniería de Sistemas de 9no semestre, especializado en la construcción de arquitecturas web modernas y de alto rendimiento. Enfocado en crear interfaces de usuario ágiles, atractivas y altamente funcionales con React, Django y tecnologías modernas.",
      viewWork: "Ver Proyectos",
      letsTalk: "Hablemos",
    },
    sections: {
      experience: {
        tag: "Trayectoria",
        title: "Experiencia",
        active: "Activo",
        roles: [
          {
            role: "Ingeniería de Sistemas (9no Semestre)",
            company: "Universidad Santa María",
            date: "2022 - Actualidad",
            desc: "Construyendo una base técnica rigurosa con un enfoque en Arquitectura de Bases de Datos, Lógica de Programación Avanzada y Algoritmos. Desarrollando habilidades analíticas profundas para diseñar arquitecturas de software escalables y traducir modelos teóricos en soluciones digitales de alto rendimiento.",
          },
          {
            role: "Pasante de Conocimiento al Cliente B2C",
            company: "Telefónica Venezolana C.A.",
            date: "Ago 2025 - Actualidad",
            desc: "Diseñé una plataforma full-stack de análisis de campañas. Arquitecté un backend robusto en Django y SQL integrado con un frontend de alto rendimiento en React/TypeScript, desplegado de forma segura en un servidor remoto Linux.",
          },
          {
            role: "Desarrollador Full-Stack Freelance",
            company: "Independiente",
            date: "Actualidad",
            desc: "Diseñando e implementando experiencias digitales a medida, resolviendo problemas de negocio complejos mediante aplicaciones altamente optimizadas en React y Django para clientes reales.",
          },
        ]
      },
      skills: {
        tag: "Stack Tecnológico",
        title: "La Arquitectura",
      },
      projects: {
        tag: "Trabajos Seleccionados",
        title: "Proyectos",
        tesisFar: {
          desc: "Plataforma full-stack para la gestión de registros académicos. Construida con React y Django, con autenticación segura y procesamiento de datos de alto rendimiento.",
        },
        echoPlan: {
          desc: "Solución de planificación empresarial para campañas digitales, optimizando flujos de trabajo de extracción masiva de datos y visualización estadística.",
        },
        personalized: {
          title: "Sitios Web Personalizados",
          status: "Disponible ahora",
          desc: "Puedo ayudarte a construir tu proyecto soñado desde cero con los más altos estándares de la industria.",
          cta: "Del Concepto al Código",
        }
      },
      contact: {
        tag: "Contacto",
        time: "Hora local",
        based: "Ubicado en",
        developedBy: "Desarrollado por",
        copyEmail: "Click para copiar",
        copied: "¡Copiado!",
      },
      skillDescriptions: {
        "React": "Arquitectura de UI basada en componentes para aplicaciones web dinámicas.",
        "Next.js": "Framework listo para producción con renderizado del lado del servidor.",
        "Three.js": "Motor de renderizado 3D para gráficos inmersivos en el navegador.",
        "GSAP": "Biblioteca de animación de alto rendimiento para movimiento web fluido.",
        "Node.js": "Entorno de ejecución JavaScript escalable para APIs de alto rendimiento.",
        "Python": "Lenguaje versátil para lógica de backend y flujos de datos.",
        "SQL": "Gestión de bases de datos relacionales para almacenamiento persistente.",
        "Django": "Framework web Python de alto nivel para desarrollo rápido.",
        "Tailwind": "Framework CSS orientado a utilidades para estilizado rápido de UI.",
      }
    },
    preloader: ["DISEÑO", "DESARROLLO", "INNOVACIÓN", "DESPLIEGUE"]
  }
};
