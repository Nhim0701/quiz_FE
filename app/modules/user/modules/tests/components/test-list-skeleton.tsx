import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function TestListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <div className="px-6 pb-6">
        <Accordion type="single" collapsible className="w-full">
          {Array.from({ length: 3 }).map((_, categoryIndex) => (
            <AccordionItem
              key={categoryIndex}
              value={`category-${categoryIndex}`}
            >
              <AccordionTrigger className="hover:no-underline py-4 sm:py-6">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left w-full">
                    <Skeleton className="h-6 w-32 sm:w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Array.from({ length: 3 }).map((_, testIndex) => (
                    <Card key={testIndex} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0" />
                          <Skeleton className="h-5 w-20 ml-2" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3 mt-1" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
}
