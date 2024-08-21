export const skills_images = [
    { url: "/python.svg", title: "Python", bgColor: "#1b5789" },
    { url: "/pytorch.svg", title: "PyTorch", bgColor: "#deded5" },
    { url: "/r.svg", title: "R", bgColor: "#deded5" },
    { url: "/java.svg", title: "Java", bgColor: "#224268" },
    { url: "/javascript.svg", title: "JavaScript", bgColor: "#d1bb0b" },
    { url: "/typescript.svg", title: "TypeScript", bgColor: "#29629c" },
    { url: "/react.svg", title: "React", bgColor: "#000101" },
    { url: "/nextjs.svg", title: "Next", bgColor: "#deded5" },
    { url: "/tailwind.svg", title: "Tailwind", bgColor: "#101424" },
    { url: "/mongo.svg", title: "MongoDB", bgColor: "#046c4c" },
    { url: "/csharp.svg", title: "C#", bgColor: "#4606ad" },
    { url: "/LaTeX.svg", title: "LaTeX", bgColor: "#deded5" },
    { url: "/typst.svg", title: "Typst", bgColor: "#36818a" },
    { url: "/sql.svg", title: "SQL", bgColor: "#deded5" },
    { url: "/framermotion.svg", title: "Framer Motion", bgColor: "#101424" },

    
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
        skills: ["React", "JavaScript", "Vite", "Tailwind", "Python", "SQLite"],
        img_url: "/uni2work_dark.png",
        url: "https://douni2work.de",
        index: 0
    }
];
  