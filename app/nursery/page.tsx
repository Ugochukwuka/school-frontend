"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";

export default function Nursery() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Nurturing Tomorrow's Leaders - Where Learning Begins with Joy"
        title="Nursery Program"
        subtitle="Nurturing Young Minds, Ages 2-5"
        description="Welcome to Elite Academy's Nursery Program - where quality early childhood education meets exceptional care. Experience the perfect start to your child's educational journey through our play-based learning approach. We celebrate every child's first steps in learning, ensuring young learners develop essential skills while having fun, building confidence, and discovering the joy of learning in a safe, nurturing environment designed for their success."
        imagePath="/FrontEndImages/freepik__35mm-film-photography-toddlers-in-a-bright-african__3239.png"
        simple={true}
      />

      <Section title="Early Childhood Education" subtitle="A foundation for lifelong learning">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Our Nursery program provides a safe, nurturing, and stimulating environment where
            young children can explore, discover, and grow. We believe that early childhood
            education sets the foundation for all future learning, and our play-based approach
            ensures children develop essential skills while having fun.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our experienced early childhood educators create engaging activities that promote
            cognitive, social, emotional, and physical development in age-appropriate ways.
          </p>
        </div>
      </Section>

      <Section bgColor="gray" title="Program Highlights">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Play-Based Learning"
            description="Children learn best through play. Our curriculum incorporates structured play activities that develop problem-solving, creativity, and social skills while making learning enjoyable."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3248.png"
            imageAlt="Play-based learning"
          />
          <Card
            title="Early Literacy & Numeracy"
            description="Age-appropriate introduction to letters, sounds, numbers, and basic concepts through songs, stories, games, and hands-on activities that make learning natural and fun."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3249.png"
            imageAlt="Early learning"
          />
          <Card
            title="Social & Emotional Development"
            description="We help children develop self-confidence, empathy, and social skills through group activities, sharing, and positive reinforcement in a supportive environment."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3250.png"
            imageAlt="Social development"
          />
          <Card
            title="Creative Expression"
            description="Art, music, movement, and storytelling activities allow children to express themselves creatively while developing fine motor skills and imagination."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Creative activities"
          />
        </div>
      </Section>

      <Section title="Age Groups">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Toddlers (Ages 2-3)</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Sensory exploration activities</li>
              <li>• Basic motor skills development</li>
              <li>• Introduction to colors and shapes</li>
              <li>• Social interaction with peers</li>
              <li>• Language development through songs</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Pre-K (Ages 3-4)</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Pre-reading and pre-writing skills</li>
              <li>• Number recognition and counting</li>
              <li>• Science exploration activities</li>
              <li>• Creative arts and crafts</li>
              <li>• Structured play and games</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Kindergarten (Ages 4-5)</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Reading readiness and phonics</li>
              <li>• Basic math concepts</li>
              <li>• Science and nature studies</li>
              <li>• Social studies introduction</li>
              <li>• Preparation for primary school</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Daily Schedule">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">8:00 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Arrival & Free Play</h5>
                <p className="text-gray-600 text-sm">Children arrive and engage in supervised free play</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">9:00 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Circle Time</h5>
                <p className="text-gray-600 text-sm">Morning greetings, songs, and calendar activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">9:30 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Learning Centers</h5>
                <p className="text-gray-600 text-sm">Rotating activities: literacy, math, science, art</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">10:30 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Snack & Outdoor Play</h5>
                <p className="text-gray-600 text-sm">Healthy snack followed by playground activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">11:30 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Story Time & Music</h5>
                <p className="text-gray-600 text-sm">Interactive storytelling and music activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">12:00 PM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Lunch & Rest</h5>
                <p className="text-gray-600 text-sm">Lunch followed by quiet rest time</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">1:00 PM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Afternoon Activities</h5>
                <p className="text-gray-600 text-sm">Creative projects, games, and special programs</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">2:30 PM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Dismissal</h5>
                <p className="text-gray-600 text-sm">Pick-up and end of day</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Facilities & Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Child-Safe Classrooms</h4>
            <p className="text-gray-600 text-sm">
              Bright, colorful classrooms designed specifically for young children with age-appropriate
              furniture, learning materials, and safety features.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Outdoor Play Areas</h4>
            <p className="text-gray-600 text-sm">
              Secure playgrounds with age-appropriate equipment, sandboxes, and open spaces for
              physical activity and exploration.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Learning Materials</h4>
            <p className="text-gray-600 text-sm">
              Extensive collection of educational toys, books, puzzles, and hands-on learning
              resources that support all areas of development.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Health & Safety</h4>
            <p className="text-gray-600 text-sm">
              Certified staff, secure facilities, health protocols, and nutritious meal programs
              ensure children's safety and well-being.
            </p>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}

