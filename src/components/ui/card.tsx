import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "ghost";
  hover?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
  variant?: "default" | "success" | "warning" | "error";
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  color?: "primary" | "success" | "warning" | "error" | "secondary";
  className?: string;
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", hover = false, children, ...props },
    ref,
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "elevated":
          return "bg-card text-card-foreground shadow-medium border-0";
        case "outlined":
          return "bg-card text-card-foreground border-2 border-border shadow-none";
        case "ghost":
          return "bg-transparent text-card-foreground border-0 shadow-none";
        default:
          return "bg-card text-card-foreground border border-border shadow-soft";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-200",
          getVariantClasses(),
          hover && "hover:shadow-medium hover:-translate-y-1 cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
CardFooter.displayName = "CardFooter";

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, children, icon: Icon, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

// StatsCard - Card para estatísticas com design moderno
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = "",
  onClick,
  variant = "default",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-destructive/20 bg-destructive/5";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        getVariantClasses(),
        onClick && "cursor-pointer hover:shadow-medium hover:-translate-y-1",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center mt-3 text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive",
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                {trend.label && (
                  <span className="ml-1 text-muted-foreground font-normal">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  variant === "success" && "bg-success/10 text-success",
                  variant === "warning" && "bg-yellow-100 text-yellow-600",
                  variant === "error" && "bg-destructive/10 text-destructive",
                  variant === "default" && "bg-primary/10 text-primary",
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// MetricCard - Card para métricas com cores personalizadas
const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  color = "primary",
  className = "",
  onClick,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "bg-success/10 border-success/20 text-success";
      case "warning":
        return "bg-yellow-100 border-yellow-200 text-yellow-700";
      case "error":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "secondary":
        return "bg-secondary border-border text-secondary-foreground";
      default:
        return "bg-primary/10 border-primary/20 text-primary";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 border",
        getColorClasses(),
        onClick && "cursor-pointer hover:shadow-medium hover:-translate-y-1",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subValue && <p className="text-xs opacity-70 mt-1">{subValue}</p>}
          </div>
          {Icon && <Icon className="h-6 w-6 opacity-80 flex-shrink-0" />}
        </div>
      </CardContent>
    </Card>
  );
};

// Alias para compatibilidade
const CardBody = CardContent;

export {
  Card,
  CardHeader,
  CardContent,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  StatsCard,
  MetricCard,
};

export type {
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  CardTitleProps,
  CardDescriptionProps,
  StatsCardProps,
  MetricCardProps,
};
