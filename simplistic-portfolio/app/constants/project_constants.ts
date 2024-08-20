export const skills_images = [
    { url: "/python.svg", title: "Python", bgColor: "#1b5789" },
    { url: "/javascript.svg", title: "JavaScript", bgColor: "#d1bb0b" },
    { url: "/react.svg", title: "React", bgColor: "#000101" },
    { url: "/nextjs.svg", title: "Next", bgColor: "#deded5" },
    { url: "/tailwind.svg", title: "Tailwind", bgColor: "#101424" },
    { url: "/typescript.svg", title: "TypeScript", bgColor: "#29629c" },
    { url: "/mongo.svg", title: "Mongo", bgColor: "#046c4c" },
    { url: "/java.svg", title: "Java", bgColor: "#224268" },
    { url: "/csharp.svg", title: "C#", bgColor: "#4606ad" },
    { url: "/LaTeX.svg", title: "LaTeX", bgColor: "#deded5" },
    { url: "/R.png", title: "R", bgColor: "#deded5" },
];

export type ProjectPreview = {
    name: string;
    description: string;
    skills: string[];
    img_url: string;
    url: string;
    index: number;
};

export const project_previews: ProjectPreview[] = [
    {
        name: "douni2work",
        description: "Uptime/Response time-tracker for University website uni2work.de",
        skills: ["React", "TypeScript", "Next.js"],
        img_url: "/uni2work_dark.png",
        url: "https://douni2work.de",
        index: 0
    }
];
  