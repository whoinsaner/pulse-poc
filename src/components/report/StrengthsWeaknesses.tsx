import { CheckCircle2, AlertCircle } from 'lucide-react';
import { InsightData } from '@/types/database';

interface StrengthsWeaknessesProps {
  insights: InsightData[];
}

export function StrengthsWeaknesses({ insights }: StrengthsWeaknessesProps) {
  // Categorize insights into strengths and weaknesses
  const strengths = insights
    .filter((i) => i.category === 'strength' || i.priority <= 2)
    .slice(0, 6);
  
  const weaknesses = insights
    .filter((i) => i.category === 'weakness' || i.category === 'improvement' || i.priority >= 4)
    .slice(0, 6);

  // If no categorized insights, create from available data
  const displayStrengths = strengths.length > 0 ? strengths : insights.slice(0, 3).map(i => ({
    ...i,
    title: i.title || 'Key Strength',
    description: i.description
  }));

  const displayWeaknesses = weaknesses.length > 0 ? weaknesses : insights.slice(3, 6).map(i => ({
    ...i,
    title: i.title || 'Area for Improvement',
    description: i.description
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="p-6 rounded-xl bg-success/5 border border-success/20">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            What Makes This Work
          </h2>
          <ul className="space-y-4">
            {displayStrengths.map((strength, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-success mt-1">•</span>
                <div>
                  <span className="font-semibold">{strength.title}</span>
                  {strength.description && (
                    <span className="text-muted-foreground"> — {strength.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Priority Fixes */}
        <div className="p-6 rounded-xl bg-warning/5 border border-warning/20">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Priority Fixes Required
          </h2>
          <ul className="space-y-4">
            {displayWeaknesses.map((weakness, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-warning mt-1">•</span>
                <div>
                  <span className="font-semibold">{weakness.title}</span>
                  {weakness.description && (
                    <span className="text-muted-foreground"> — {weakness.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
