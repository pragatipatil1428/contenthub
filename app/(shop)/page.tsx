"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Clock, Shield, Zap, Sparkles, Play, Download, FileText, Music, BookOpen, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const categories = [
  { name: "Videos", icon: Video, color: "from-red-500 to-orange-500", count: "2,450+" },
  { name: "Music", icon: Music, color: "from-purple-500 to-pink-500", count: "1,800+" },
  { name: "PDFs", icon: FileText, color: "from-blue-500 to-cyan-500", count: "3,200+" },
  { name: "Courses", icon: BookOpen, color: "from-emerald-500 to-teal-500", count: "890+" },
  { name: "Images", icon: Image, color: "from-amber-500 to-yellow-500", count: "5,600+" },
  { name: "Templates", icon: Sparkles, color: "from-indigo-500 to-violet-500", count: "1,200+" },
];

const features = [
  {
    icon: Zap,
    title: "Instant Access",
    description: "Get immediate access to your purchases. Download anytime, anywhere.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Your transactions are protected with industry-standard security.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Curated content from top creators and industry professionals.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Trending Content",
    description: "Stay ahead with the latest and most popular digital products.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Digital Creator",
    content: "ContentHub has been a game-changer for my workflow. The quality of assets is outstanding.",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Developer",
    content: "I've downloaded dozens of resources. The platform is smooth and the content is top-notch.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Designer",
    content: "The variety of content available here is incredible. Highly recommended for creative professionals.",
    rating: 5,
  },
];

export default function HomePage() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="absolute inset-0 bg-grid-zinc-900/[0.03] dark:bg-grid-zinc-50/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeInUp} custom={0} className="mb-6">
              <Badge variant="premium" className="px-4 py-1.5 text-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Premium Digital Marketplace
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Discover Premium{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Digital Content
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400"
            >
              Your one-stop marketplace for high-quality digital products. From courses and templates
              to music and videos — find everything you need to create, learn, and grow.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/contents">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Browse Content <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/free">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <Download className="h-4 w-4" /> Free Downloads
                </Button>
              </Link>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              custom={4}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-blue-400 dark:border-zinc-950"
                    />
                  ))}
                </div>
                <span>Trusted by 10K+ creators</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">4.9/5</span>
                <span>rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
              Browse by Category
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-zinc-500 dark:text-zinc-400">
              Explore our extensive collection across every category
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6"
          >
            {categories.map((category, i) => {
              const Icon = category.icon;
              return (
                <motion.div key={category.name} variants={fadeInUp} custom={i}>
                  <Link href={`/contents?type=${category.name.toUpperCase()}`}>
                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <CardContent className="flex flex-col items-center gap-3 p-6">
                        <div className={`rounded-2xl bg-gradient-to-br ${category.color} p-3 text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-xs text-zinc-400">{category.count}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
              Why Choose ContentHub?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-zinc-500 dark:text-zinc-400">
              We provide the best experience for buying and selling digital content
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeInUp} custom={i}>
                  <div className="group relative">
                    <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
              What Our Users Say
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-zinc-500 dark:text-zinc-400">
              Join thousands of satisfied customers
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div key={testimonial.name} variants={fadeInUp} custom={i}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-zinc-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-800 dark:to-blue-800">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Start Exploring?
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-purple-100">
              Join thousands of creators and start downloading premium content today.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {[
              { q: "How do I purchase content?", a: "Simply browse our catalog, select your desired content, and proceed to checkout. Choose your preferred payment method and complete the purchase." },
              { q: "Can I get a refund?", a: "Due to the digital nature of our products, all sales are final. However, if you encounter any issues, please contact our support team." },
              { q: "How do I access my purchased content?", a: "After purchase, content appears in your dashboard under 'My Purchases'. You can download or stream it anytime." },
            ].map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
