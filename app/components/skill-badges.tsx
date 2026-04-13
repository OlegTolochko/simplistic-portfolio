import Image from "next/image";

import { badge_urls } from "../constants/project_constants";

type SkillBadgesProps = {
  skills: string[];
  badgeHeight?: number;
  className?: string;
};

export default function SkillBadges({
  skills,
  badgeHeight = 30,
  className = "gap-2",
}: SkillBadgesProps) {
  return (
    <div className={`flex flex-wrap ${className}`}>
      {skills.map((skill, index) => {
        const skillBadge = badge_urls.find(
          (badgeSkill) => badgeSkill.name === skill.toLowerCase(),
        );

        if (skillBadge?.url) {
          return (
            <Image
              key={`${skillBadge.name}-${index}`}
              className="rounded-lg w-auto"
              src={skillBadge.url}
              alt={`${skill}_badge`}
              height={badgeHeight}
              width={0}
              style={{ width: "auto" }}
            />
          );
        }

        return (
          <span
            key={`${skill}-${index}`}
            className="rounded-full border border-sand-400 bg-sand-100 px-3 py-1 text-sm font-medium text-stone-800"
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}
