import { useFetch } from "@/shared/hooks/useFetch";
import { coursesService } from "@/shared/services/coursesService";
import { ClosingCta, TeachBand } from "./components/ClosingSections";
import { FeaturedCourses } from "./components/FeaturedCourses";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { ProductShowcase } from "./components/ProductShowcase";
import { StatsBand } from "./components/StatsBand";
import { Testimonials } from "./components/Testimonials";
import "./Home.css";

export function Home() {
  // One request feeds the hero hint and the featured courses filters
  const courses = useFetch("home-courses", coursesService.list);

  return (
    <div className="home">
      <HeroSection courses={courses.data} />
      <StatsBand />
      <HowItWorks />
      <FeaturedCourses
        courses={courses.data}
        isLoading={courses.isLoading}
        error={courses.error}
        onRetry={courses.retry}
      />
      <ProductShowcase />
      <Testimonials />
      <TeachBand />
      <ClosingCta />
    </div>
  );
}
