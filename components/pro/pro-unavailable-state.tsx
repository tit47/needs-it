import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProUnavailableStateProps {
  title: string;
  description: string;
}

export function ProUnavailableState({
  title,
  description,
}: ProUnavailableStateProps) {
  return (
    <Card className="text-center">
      <CardHeader className="items-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-sm text-base">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
