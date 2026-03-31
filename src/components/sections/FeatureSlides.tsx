import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Brain, CalendarCheck2, MessageSquare, Rocket, Sparkles, Waypoints, Workflow } from "lucide-react";
import dailyTaskImg from "@/assets/features/daily-task.jpg";
import weeklyInterestImg from "@/assets/features/weekly-interest.jpg";
import weeklyPotentialImg from "@/assets/features/weekly-potential.jpg";
import careerInsightsImg from "@/assets/features/career-insights.jpg";
import sparkInterestImg from "@/assets/features/spark-interest.jpg";
import weeklyQuizImg from "@/assets/features/weekly-quiz.jpg";
import parentsChatbotImg from "@/assets/features/parents-chatbot.jpg";
import moralStoryImg from "@/assets/features/moral-story.jpg";
const slides = [
  {
    title: "One Daily Task. Every Domain. Every Skill.",
    body:
      "Each day, your child gets a 20–30 min activity covering all key domains — creativity, logic, social skills, and values. And when you choose a career path, Nurture ensures every task nurtures their curiosity and skills in that direction… without losing the fun.",
    icon: CalendarCheck2,
    image: dailyTaskImg,
    alt: "Nurture daily task illustration showing a parent and child doing a creative activity",
  },
  {
    title: "Weekly Interest Questionnaire",
    body:
      "See their passions before they even know them. A simple weekly set of questions reveals what excites your child most. Before long, you’ll start seeing patterns — and know exactly what sparks their eyes to light up.",
    icon: Sparkles,
    image: weeklyInterestImg,
    alt: "Weekly interest questionnaire illustration with playful icons",
  },
  {
    title: "Weekly Potential Questionnaire",
    body:
      "Spot natural talents early. Just like interests, Nurture helps you uncover natural strengths your child may not even realise yet — whether it’s problem‑solving, leadership, design, or analytical thinking. And then, we build on them.",
    icon: Brain,
    image: weeklyPotentialImg,
    alt: "Potential and strengths badges on a parent dashboard illustration",
  },
  {
    title: "Career Insights",
    subtitle: "Parents dashboard only",
    body:
      "From clues to clear career paths. Nurture combines interest and potential data to give you a clear list of possible careers your child is likely to thrive in — backed by their own progress and preferences.",
    icon: Waypoints,
    image: careerInsightsImg,
    alt: "Career insights dashboard illustration with path nodes and career cards",
  },
  {
    title: "Decided Career / Spark an Interest",
    subtitle: "Parents dashboard only",
    body:
      "Set the path. We’ll build the road. Whether you’ve chosen a career path or just want to nurture an early spark, Nurture ensures your child’s learning, play, and challenges all align — while keeping curiosity alive.",
    icon: Rocket,
    image: sparkInterestImg,
    alt: "Parent choosing a path or sparking interest illustration",
  },
  {
    title: "Weekly Quiz",
    body:
      "Quizzes — learning that sticks. Our quizzes revisit the week’s learning — and subtly bring back past concepts — so your child remembers and applies them naturally. No cramming. No pressure.",
    icon: Workflow,
    image: weeklyQuizImg,
    alt: "Friendly weekly quiz cards with progress dots illustration",
  },
  {
    title: "Moral Story (Bedtime Values Builder)",
    body:
      "One story a day. One value for life. Every night, Nurture shares a short, engaging story that weaves in a timeless moral — kindness, honesty, resilience, empathy, respect, and more. These aren't just tales — they're seeds planted in your child's mind, shaping their decisions, relationships, and sense of right and wrong as they grow. And because Nurture knows your chosen career path, even the stories subtly reinforce qualities that matter most for that future — whether it's teamwork for an engineer, empathy for a doctor, or perseverance for an artist.",
    icon: Sparkles,
    image: moralStoryImg,
    alt: "Bedtime moral story illustration with values and character building",
  },
  {
    title: "Parents Chatbot",
    body:
      "Chatbot trained on your child's knowledge. The co‑parent who knows everything about your child. Every task, answer, quiz, and milestone your child completes trains our AI — so you can ask: ‘Why is Aarav avoiding math lately?’ or ‘What’s the next step to make him better at teamwork?’ — and get instant, data‑backed answers.",
    icon: MessageSquare,
    image: parentsChatbotImg,
    alt: "Parents chatbot with helpful insights tied to child's data illustration",
  },
];

const FeatureSlides = () => {
  return (
    <section id="features" className="container mt-20" aria-label="Nurture features">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">Explore Nurture features</h2>
        <p className="text-muted-foreground mt-2">A quick tour of the experiences for children and parents.</p>
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent>
            {slides.map((s, i) => {
              const Icon = s.icon;
              return (
                <CarouselItem key={i} className="basis-full">
                  <Card className="glass-card h-full">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{s.title}</span>
                      </CardTitle>
                      {s.subtitle ? (
                        <div className="mt-2">
                          <Badge variant="secondary">{s.subtitle}</Badge>
                        </div>
                      ) : null}
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <AspectRatio ratio={16/10}>
                          <img
                            src={s.image}
                            alt={s.alt}
                            loading="lazy"
                            className="h-full w-full rounded-lg object-cover shadow"
                          />
                        </AspectRatio>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="-left-6" />
          <CarouselNext className="-right-6" />
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {slides.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{s.title}</span>
                </CardTitle>
                {s.subtitle ? (
                  <div className="mt-2">
                    <Badge variant="secondary">{s.subtitle}</Badge>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <AspectRatio ratio={16/10}>
                    <img
                      src={s.image}
                      alt={s.alt}
                      loading="lazy"
                      className="h-full w-full rounded-lg object-cover shadow"
                    />
                  </AspectRatio>
                </div>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureSlides;
