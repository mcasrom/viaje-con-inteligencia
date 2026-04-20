import MapaMundial from '@/components/MapaMundial';
import Testimonios from '@/components/Testimonios';
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Home() {
  return (
    <>
      <MapaMundial />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <NewsletterSignup variant="blog" />
      </div>
      <Testimonios />
    </>
  );
}
