import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowRight, Lightbulb } from "lucide-react"

const blogPosts = [
  {
    id: "1",
    title: "Cómo la IA está Revolucionando el Aprendizaje Personalizado",
    excerpt:
      "Descubre cómo los algoritmos de inteligencia artificial pueden adaptar el contenido educativo a tu estilo de aprendizaje único.",
    author: "Dr. María González",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Inteligencia Artificial",
    image: "/ai-learning-technology.png",
  },
  {
    id: "2",
    title: "5 Estrategias Efectivas para el Aprendizaje Autodirigido",
    excerpt: "Aprende técnicas probadas para maximizar tu productividad y retención cuando estudias por tu cuenta.",
    author: "Prof. Carlos Ruiz",
    date: "2024-01-12",
    readTime: "7 min",
    category: "Metodología",
    image: "/self-directed-learning.png",
  },
  {
    id: "3",
    title: "La Importancia de la Accesibilidad en la Educación Digital",
    excerpt:
      "Por qué crear plataformas educativas inclusivas beneficia a todos los estudiantes, no solo a aquellos con discapacidades.",
    author: "Dra. Ana Martín",
    date: "2024-01-10",
    readTime: "6 min",
    category: "Accesibilidad",
    image: "/digital-accessibility-education.png",
  },
  {
    id: "4",
    title: "Microaprendizaje: Grandes Resultados en Pequeñas Dosis",
    excerpt:
      "Cómo dividir el contenido en segmentos pequeños puede mejorar significativamente la retención y el engagement.",
    author: "Prof. Luis Herrera",
    date: "2024-01-08",
    readTime: "4 min",
    category: "Metodología",
    image: "/placeholder-atozb.png",
  },
  {
    id: "5",
    title: "El Futuro de los Certificados Digitales en la Educación",
    excerpt:
      "Explora cómo blockchain y la verificación digital están cambiando la forma en que validamos las competencias adquiridas.",
    author: "Dr. Roberto Silva",
    date: "2024-01-05",
    readTime: "8 min",
    category: "Tecnología",
    image: "/placeholder-bgs1v.png",
  },
  {
    id: "6",
    title: "Neurociencia del Aprendizaje: Cómo Aprende Realmente el Cerebro",
    excerpt:
      "Descubre los principios científicos detrás del aprendizaje efectivo y cómo aplicarlos en tu rutina de estudio.",
    author: "Dra. Patricia López",
    date: "2024-01-03",
    readTime: "10 min",
    category: "Neurociencia",
    image: "/brain-learning-neuroscience-education.png",
  },
]

const categories = ["Todos", "Inteligencia Artificial", "Metodología", "Accesibilidad", "Tecnología", "Neurociencia"]

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog Educativo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Artículos, investigaciones y tendencias sobre el futuro del aprendizaje y la educación digital
        </p>
      </div>

      {/* Featured Article */}
      <Card className="mb-8 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src="/ai-education-article.png"
              alt="Artículo destacado"
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6">
            <Badge className="mb-3">Artículo Destacado</Badge>
            <h2 className="text-2xl font-bold mb-3">Cómo la IA está Revolucionando el Aprendizaje Personalizado</h2>
            <p className="text-muted-foreground mb-4">
              Descubre cómo los algoritmos de inteligencia artificial pueden adaptar el contenido educativo a tu estilo
              de aprendizaje único, creando experiencias verdaderamente personalizadas.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Dr. María González
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                15 Enero 2024
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />5 min lectura
              </div>
            </div>
            <Button>
              Leer Artículo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </div>
              </div>
              <CardTitle className="line-clamp-2 hover:text-primary cursor-pointer">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3 mb-4">{post.excerpt}</CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString("es-ES")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter Signup */}
      <Card className="mt-12 text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Mantente Actualizado
          </CardTitle>
          <CardDescription>
            Recibe los últimos artículos sobre educación, tecnología y metodologías de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-3 py-2 border border-input rounded-md"
            />
            <Button>Suscribirse</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            No spam. Puedes cancelar tu suscripción en cualquier momento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
