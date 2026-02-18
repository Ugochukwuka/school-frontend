"use client";

import { useState } from "react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
}

export default function FAQAccordion({ 
  faqs, 
  title = "Frequently Asked Questions",
  subtitle 
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div
              key={faq.id}
              className={`
                group bg-white rounded-xl shadow-md hover:shadow-xl
                border-2 transition-all duration-300 overflow-hidden
                ${isOpen ? 'border-orange-500 shadow-lg' : 'border-gray-200 hover:border-orange-300'}
              `}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-xl"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    transition-all duration-300
                    ${isOpen 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                    }
                  `}>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  
                  {/* Question Text */}
                  <h3 className={`
                    text-lg font-semibold flex-1 transition-colors duration-300
                    ${isOpen ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'}
                  `}>
                    {faq.question}
                  </h3>
                </div>
              </button>

              {/* Answer Content */}
              <div
                id={`faq-answer-${faq.id}`}
                className={`
                  transition-all duration-300 ease-in-out
                  ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                  overflow-hidden
                `}
              >
                <div className="px-6 pb-5 pl-20">
                  <div className="pt-2 pb-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
