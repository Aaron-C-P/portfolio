import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample blog posts - these would typically come from a CMS or database
const blogPosts = [
  {
    id: 1,
    title: "Building EGZIT: Lessons from Creating an AI-Powered Moving App",
    excerpt: "A deep dive into the architecture decisions, challenges, and solutions when building a full-stack moving assistant with AI integration.",
    date: "2024-12-28",
    readTime: "8 min read",
    tags: ["React", "AI", "Supabase"],
    image: null,
  },
  {
    id: 2,
    title: "My Journey into Cybersecurity: From Code to Protection",
    excerpt: "How my background in software development led me to explore cybersecurity, and what I've learned along the way.",
    date: "2024-12-20",
    readTime: "5 min read",
    tags: ["Cybersecurity", "Career"],
    image: null,
  },
  {
    id: 3,
    title: "Database Design Patterns I Wish I Knew Earlier",
    excerpt: "Key database design patterns and best practices that have significantly improved my application development workflow.",
    date: "2024-12-15",
    readTime: "6 min read",
    tags: ["PostgreSQL", "Database Design"],
    image: null,
  },
];

export const PortfolioBlog = () => {
  return (
    <section id="blog" className="relative z-10 py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-portfolio-accent font-medium mb-4 block">Blog</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Latest Insights</h2>
          <p className="text-portfolio-muted text-lg max-w-2xl">
            Sharing what I learn along the way - from coding challenges to career insights.
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 p-6 bg-gradient-to-r from-portfolio-accent/10 to-portfolio-primary/10 border border-portfolio-accent/20 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-portfolio-accent/20 rounded-xl">
              <Sparkles className="h-6 w-6 text-portfolio-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Blog Coming Soon!</h3>
              <p className="text-portfolio-muted text-sm">
                I'm working on creating regular content about my tech journey. Subscribe to get notified!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-portfolio-card border border-portfolio-border rounded-2xl overflow-hidden hover:border-portfolio-accent/50 transition-all hover:-translate-y-2"
            >
              {/* Post Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-portfolio-accent/20 to-portfolio-primary/20 flex items-center justify-center">
                <span className="text-4xl opacity-50">{post.title.charAt(0)}</span>
              </div>

              <div className="p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-portfolio-accent/10 text-portfolio-accent rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-portfolio-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-portfolio-muted text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-portfolio-muted">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            className="border-portfolio-border hover:border-portfolio-accent hover:text-portfolio-accent"
          >
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
