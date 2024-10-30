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

export type BadgeUrl = {
    name: string
    url: string
}

export const badge_urls: BadgeUrl[] = [
    {
        name: "python",
        url: "https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"
    },
    {
        name: "pytorch",
        url: "https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white"
    },
    {
        name: "pytorch",
        url: "https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white"
    },
    {
        name: "fastapi",
        url: "https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi"
    },
    {
        name: "typescript",
        url: "https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"
    },
    {
        name: "tailwind",
        url: "https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white"
    },
    {
        name: "next",
        url: "https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white"
    },
    {
        name: "react",
        url: "https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"
    },
    {
        name: "postgresql",
        url: "https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"
    },
    {
        name: "vite",
        url: "https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white"
    },
    {
        name: "javascript",
        url: "https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=black"
    },
    {
        name: "sqlite",
        url: "https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white"
    },
    {
        name: "flask",
        url: "https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"
    }
]

export type ProjectPreview = {
    index: number;
    name: string;
    description: string;
    skills: string[];
    img_url: string;
    url: string;
    img_width: string;
};

export const project_previews: ProjectPreview[] = [
    {
        index: 0,
        name: "BrawlAI",
        description: "An AI based solution for optimizing ranked drafting sequences in the mobile game Brawl Stars by Supercell.",
        skills: ["React", "TypeScript", "Tailwind", "Next" ,"Python", "fastapi" , "PyTorch","PostgreSQL"],
        img_url: "/brawlai.webp",
        url: "https://github.com/ANDI-neV/brawl-ai",
        img_width: "w-[400px]  h-[200px] md:h-[250px]"
    },
    {
        index: 1,
        name: "douni2work",
        description: "Uptime/Response time-tracker for University website uni2work.de",
        skills: ["React", "JavaScript", "Tailwind", "Vite", "Python", "Flask","SQLite"],
        img_url: "/uni2work_dark.webp",
        url: "https://douni2work.de",
        img_width: "w-[300px] h-[250px]"
    }
];

type Section = {
    title: string;
    description: string;
}

export type ProjectInformation = {
    sections: Section[];
    repository_url: string;
    cropped_img_url: string;
} & ProjectPreview

export const project_info: ProjectInformation[] = project_previews.map(preview => {
    switch (preview.name) {
        case "BrawlAI":
            return {
                ...preview,
                repository_url: "https://github.com/ANDI-neV/brawl-ai",
                sections: [
                    {
                        title: "Overview",
                        description: "BrawlAI is an advanced drafting assistant that helps players optimize their brawler selections in ranked matches. It utilizes a self-trained AI model to understand the complex relationships between the individual brawlers to deliver context-rich predictions."
                    },
                    {
                        title: "Technical Implementation",
                        description: "The system uses PyTorch to train a Transformer based model, with a FastAPI backend and a Next.js frontend, with Typescript, TailwindCSS and React, as well a database hosted with PostgreSQL to store player data and matches."
                    },
                    {
                        title: "Model Architecture and Training",
                        description: "The data used for training is obtained from the free Brawlstars API provided by Supercell. The model uses a Transformer-based neural network architecture for sequential predictions of Brawl Stars brawler combinations. It utilizes a Transformer encoder to process sequences of brawlers, the associated team, positions, and map information to output a pick-score for all brawlers in the game in terms of a score from 0 to 1, where the sum of all scores is 1. This allows the prediction of the next best brawlers for selection."
                    },
                    {
                        title: "Challenges",
                        description: "One of the biggest challenges was finding a suitable neural architecture, that balanced complexity with efficiency. The initial approach used a Multilayer-Perceptron with a 6xBrawlerCount input dimension, with size 6xBrawlerCount input size, representing team compositions, with an output of 1 (win) or 0 (loss). Though this architecture didn't look too promising and only delivered semi-good predictions, especially with nature of drafting inputs being of variable length. To receive the next best brawler with this architecture, the model ran once for each brawler in the game to receive the associated winrate, which is not very efficient. Thus the solution was to fully revamp the architecture and use a Transformer based model, which can handle variable input lenghts and outputs one vector, where each variable represents the associated score predicted by the model. Another big challenge was the data preparation for training."
                    }
                ],
                cropped_img_url: "/brawlai_cropped.webp"
            };
        case "douni2work":
            return {
                ...preview,
                repository_url: "https://github.com/OlegTolochko/douni2work",
                sections: [
                    {
                        title: "Overview",
                        description: "douni2work is a monitoring system that tracks the availability and performance of the LMU University website uni2work.de."
                    },
                    {
                        title: "Features",
                        description: "Includes real-time monitoring and historical data visualization, of the the uptime of uni2work."
                    },
                    {
                        title: "Technical Implementation",
                        description: "Built with a Flask backend, the system periodically measures response times and stores is the data in SQLite database. The frontend utilizes Vite with React, Javascript and TailwindCSS. To display historical performance metrics rechart is utilized."
                    }
                ],
                cropped_img_url: "/uni2work_dark_cropped.webp"
            };
        default:
            throw new Error(`No detailed information found for project: ${preview.name}`);
    }
});


export const utilized_libraries = [
    { name: "React", url: "https://reactjs.org/" },
    { name: "Next", url: "https://nextjs.org/" },
    { name: "Tailwind", url: "https://tailwindcss.com/" },
    { name: "TypeScript", url: "https://www.typescriptlang.org/" },
    { name: "Framer Motion", url: "https://www.framer.com/motion/" }
];
  