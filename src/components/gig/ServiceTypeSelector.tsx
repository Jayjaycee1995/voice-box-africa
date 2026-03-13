import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceType } from "@/lib/database.types";
import {
  Microscope,
  Home,
  Headphones,
  Wand2,
} from "lucide-react";

interface ServiceTypeSelectorProps {
  selectedServiceType: ServiceType;
  onSelect: (serviceType: ServiceType) => void;
}

const serviceOptions = [
  {
    id: 'studio_only' as ServiceType,
    title: 'Studio Recording',
    description: 'Talent records at your studio location',
    icon: Microscope,
    features: ['In-person recording', 'Professional studio', 'Direct oversight'],
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
  },
  {
    id: 'raw_recording' as ServiceType,
    title: 'Remote Raw Recording',
    description: 'Talent records from home, no production',
    icon: Home,
    features: ['Remote recording', 'Raw audio only', 'Fast turnaround'],
    color: 'from-green-500 to-green-600',
    textColor: 'text-green-600',
  },
  {
    id: 'produced_and_mixed' as ServiceType,
    title: 'Produced & Mixed',
    description: 'Talent + Producer for fully produced audio',
    icon: Headphones,
    features: ['Remote recording', 'Professional mixing', 'Producer included', 'Best quality'],
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    badge: 'Most Popular',
  },
  {
    id: 'producer_only' as ServiceType,
    title: 'Production Services',
    description: 'Get audio mixed/mastered by a producer',
    icon: Wand2,
    features: ['Bring your own audio', 'Professional producer', 'Flexible scope'],
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
  },
];

export default function ServiceTypeSelector({
  selectedServiceType,
  onSelect,
}: ServiceTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">How will the talent deliver your project?</h3>
        <p className="text-sm text-muted-foreground">
          Choose the service type that best fits your project needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedServiceType === option.id;

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg border-primary'
                  : 'hover:shadow-md border-border/50'
              }`}
              onClick={() => onSelect(option.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {option.badge && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${option.textColor} bg-current`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
