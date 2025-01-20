import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onChange,
  readonly = false,
  size = 'md'
}) => {
  const [hover, setHover] = React.useState<number | null>(null);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(null)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} p-1 -m-1`}
          disabled={readonly}
        >
          <Star
            className={`${sizes[size]} ${
              (hover || rating) >= star
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;