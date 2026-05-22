"use client";

import { Button } from "@/components/ui/Button";
import { isFavoriteToilet, onFavoritesUpdated, toggleFavoriteToilet } from "@/lib/favorites";
import type { Toilet } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

type FavoriteButtonProps = {
  toilet: Toilet;
  className?: string;
  variant?: "icon" | "pill";
  light?: boolean;
};

export function FavoriteButton({ toilet, className, variant = "icon", light = false }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const sync = () => setFavorite(isFavoriteToilet(toilet.id));
    sync();
    return onFavoritesUpdated(sync);
  }, [toilet.id]);

  const label = favorite ? "お気に入りから外す" : "お気に入りに保存";

  return (
    <Button
      type="button"
      size={variant === "icon" ? "icon" : "md"}
      variant={light ? "ghost" : "secondary"}
      aria-label={label}
      title={label}
      className={cn(
        variant === "icon" && "h-11 w-11 rounded-full",
        variant === "pill" && "rounded-[20px]",
        light && "bg-white/12 text-white hover:bg-white/18",
        favorite && !light && "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-50",
        favorite && light && "bg-white text-rose-600 hover:bg-white",
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavoriteToilet(toilet);
        setFavorite((value) => !value);
      }}
    >
      <Heart size={18} className={favorite ? "fill-current" : ""} />
      {variant === "pill" ? (favorite ? "保存済み" : "保存") : null}
    </Button>
  );
}
