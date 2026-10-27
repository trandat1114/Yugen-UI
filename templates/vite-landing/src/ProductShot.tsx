import { Checkmark12Filled } from "@fluentui/react-icons";
import { cn } from "yugen-ui";
import type { Content } from "./content/types";

/**
 * A picture of the product drawn with HTML and tokens instead of a screenshot: no image to download, sharp at any size,
 * and it follows the theme. Replace it with a real screenshot (an <img> with width and height) when you have one.
 */
export function ProductShot({ shot }: { shot: Content["hero"]["shot"] }) {
  return (
    <div
      role="img"
      aria-label={shot.label}
      className="@container/shot overflow-hidden rounded-2xlarge border border-stroke-2 bg-background-1 text-start shadow-28"
    >
      <div className="flex items-center gap-1.5 border-b border-stroke-2 bg-background-3 px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-circular bg-stroke-1" />
        ))}
      </div>
      <div className="flex">
        <div className="hidden w-40 shrink-0 flex-col gap-0.5 border-e border-stroke-2 bg-background-2 p-2 @md/shot:flex">
          {shot.spaces.map((space, i) => (
            <span
              key={space}
              className={cn(
                "truncate rounded-medium px-2 py-1 text-caption1",
                i === 0 ? "bg-background-1 font-semibold text-foreground-1 shadow-2" : "text-foreground-2",
              )}
            >
              {space}
            </span>
          ))}
          <span className="mx-2 my-2 border-t border-stroke-2" />
          {shot.notes.map((note, i) => (
            <span key={note} className={cn("truncate px-2 py-1 text-caption1", i === 0 ? "text-brand-foreground-1" : "text-foreground-2")}>
              {note}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-4 @md/shot:p-5">
          <p className="font-display text-subtitle2 font-semibold text-foreground-1">{shot.title}</p>
          <p className="text-caption1 text-foreground-3">{shot.meta}</p>
          <p className="mt-3 text-body1 text-foreground-2">{shot.body}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {shot.tasks.map((task, i) => (
              <li key={task} className="flex items-center gap-2 text-body1 text-foreground-1">
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-small border",
                    i === 0 ? "border-brand-background bg-brand-background text-foreground-on-brand" : "border-stroke-accessible",
                  )}
                >
                  {i === 0 && <Checkmark12Filled className="size-3" />}
                </span>
                <span className={cn(i === 0 && "text-foreground-3 line-through")}>{task}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-large bg-brand-background-2 p-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-circular bg-brand-background text-caption2 font-semibold text-foreground-on-brand">
              {shot.comment.author.slice(0, 1)}
            </span>
            <p className="text-caption1 text-foreground-1">
              <span className="font-semibold">{shot.comment.author}</span> {shot.comment.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
