import Image from "next/image";

interface ImageGridProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function ImageGrid({
  images,
  columns = 3,
  className = "",
}: ImageGridProps) {
  const gridClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

