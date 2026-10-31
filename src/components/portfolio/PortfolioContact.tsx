import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Send, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm, ValidationError } from "@formspree/react";

export const PortfolioContact = () => {
  const { toast } = useToast();
  const [state, handleSubmit] = useForm("mnjqgkgz");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Watch for successful submission from Formspree
  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    }
  }, [state.succeeded, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-16 px-6 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-portfolio-card/50 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-6">Let's Connect</h3>
            <p className="text-portfolio-muted mb-8 text-lg">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
            </p>

            <div className="space-y-6">
              <a
                href="mailto:aaron7prince@gmail.com"
                className="flex items-center gap-4 p-4 bg-portfolio-card border border-portfolio-border rounded-xl hover:border-portfolio-accent/50 transition-all group"
              >
                <div className="p-3 bg-portfolio-accent/10 text-portfolio-accent rounded-lg group-hover:bg-portfolio-accent group-hover:text-white transition-colors">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-portfolio-muted">Email Me</p>
                  <p className="font-medium text-portfolio-text">aaron7prince@gmail.com</p>
                </div>
              </a>

              <a
                href="tel:8767902268"
                className="flex items-center gap-4 p-4 bg-portfolio-card border border-portfolio-border rounded-xl hover:border-portfolio-accent/50 transition-all group"
              >
                <div className="p-3 bg-portfolio-accent/10 text-portfolio-accent rounded-lg group-hover:bg-portfolio-accent group-hover:text-white transition-colors">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-portfolio-muted">Call Me</p>
                  <p className="font-medium text-portfolio-text">(876) 790-2268</p>
                </div>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Mandeville+Manchester+Jamaica"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-portfolio-card border border-portfolio-border rounded-xl hover:border-portfolio-accent/50 transition-all group"
              >
                <div className="p-3 bg-portfolio-accent/10 text-portfolio-accent rounded-lg group-hover:bg-portfolio-accent group-hover:text-white transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-portfolio-muted">Location</p>
                  <p className="font-medium text-portfolio-text">Mandeville, Manchester, Jamaica</p>
                </div>
              </a>

              <a
                href="https://linkedin.com/in/aaron-prince-b912b121"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-portfolio-card border border-portfolio-border rounded-xl hover:border-portfolio-accent/50 transition-all group"
              >
                <div className="p-3 bg-portfolio-accent/10 text-portfolio-accent rounded-lg group-hover:bg-portfolio-accent group-hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-portfolio-muted">LinkedIn</p>
                  <p className="font-medium text-portfolio-text">Aaron Prince</p>
                </div>
              </a>

              <a
                href="https://github.com/Aaron-C-P"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-portfolio-card border border-portfolio-border rounded-xl hover:border-portfolio-accent/50 transition-all group"
              >
                <div className="p-3 bg-portfolio-accent/10 text-portfolio-accent rounded-lg group-hover:bg-portfolio-accent group-hover:text-white transition-colors">
                  <Github className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-portfolio-muted">GitHub</p>
                  <p className="font-medium text-portfolio-text">Aaron-C-P</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-portfolio-card border border-portfolio-border rounded-2xl p-8 shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-portfolio-muted">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-portfolio-bg border-portfolio-border focus:border-portfolio-accent"
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-xs" />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-portfolio-muted">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-portfolio-bg border-portfolio-border focus:border-portfolio-accent"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-portfolio-muted">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can I help you?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="min-h-[150px] bg-portfolio-bg border-portfolio-border focus:border-portfolio-accent"
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-xs" />
              </div>

              <Button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-portfolio-accent hover:bg-portfolio-accent/90 text-white py-6 text-lg rounded-xl transition-all shadow-lg hover:shadow-portfolio-accent/25"
              >
                {state.submitting ? "Sending..." : "Send Message"}
                {!state.submitting && <Send className="ml-2 h-5 w-5" />}
              </Button>
              {state.succeeded && (
                  <p className="text-green-500 text-sm text-center mt-2">Thanks for your message!</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
