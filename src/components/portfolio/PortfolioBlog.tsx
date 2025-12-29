import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PortfolioBlog = () => {
  // Placeholder posts for visual structure
  const posts = [
    {
      id: 1,
      title: "The Future of AI in Software Development",
      excerpt: "Exploring how Large Language Models are reshaping the way we write, test, and deploy code.",
      date: "Coming Soon",
      author: "Aaron Prince",
      category: "Artificial Intelligence",
    },
    {
      id: 2,
      title: "Building Scalable Web Applications with React",
      excerpt: "Best practices for state management, performance optimization, and component architecture.",
      date: "Coming Soon",
      author: "Aaron Prince",
      category: "Web Development",
    },
    {
      id: 3,
      title: "Cybersecurity Essentials for Developers",
      excerpt: "Understanding common vulnerabilities and how to secure your full-stack applications.",
      date: "Coming Soon",
      author: "Aaron Prince",
      category: "Security",
    },
  ];

  return (
    <section id="blog" className="py-24 px-6 bg-portfolio-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="text-portfolio-accent font-semibold mb-4 block uppercase tracking-wider text-sm">
            Insights
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Latest Articles</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-portfolio-accent to-portfolio-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-portfolio-card border border-portfolio-border rounded-xl overflow-hidden hover:border-portfolio-accent/50 transition-all group"
            >
              <div className="h-48 bg-gradient-to-br from-portfolio-accent/5 to-portfolio-secondary/5 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="h-12 w-12 text-portfolio-accent/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-portfolio-bg/80 backdrop-blur text-xs font-medium rounded-full border border-portfolio-border">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-portfolio-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-portfolio-accent transition-colors">
                  {post.title}
                </h3>
                <p className="text-portfolio-muted text-sm mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <Button
                  variant="ghost"
                  className="p-0 h-auto hover:bg-transparent text-portfolio-accent hover:text-portfolio-accent/80 font-medium"
                >
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
