// All homepage content. components/home renders it.

export type Link = { label: string; href: string };

export type Project = {
  slug: string;
  title: string;
  /** Where the work was done, e.g. a lab, course or thesis. */
  context: string;
  period: string;
  /** Two to three sentences, plain description of what was done. */
  summary: string;
  /** Short status note shown next to ongoing work. */
  status?: string;
  tags: string[];
  /** 3:2 thumbnail in /public; a .bin file is drawn as a spinning convex mesh (components/convex-mesh.tsx). */
  image?: string;
  imageAlt?: string;
  links: Link[];
};

export type Publication = {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  links: Link[];
};

export type EducationEntry = {
  institution: string;
  degree: string;
  period: string;
  detail?: string;
};

export type Position = {
  organisation: string;
  role: string;
  period: string;
  detail?: string;
};

export const profile = {
  name: "Oleg Tolochko",
  firstName: "Oleg",
  lastName: "Tolochko",
  domain: "tolochko.dev",
  email: "oleg.i.tolochko@gmail.com",
  github: "https://github.com/OlegTolochko",
  linkedin: "https://www.linkedin.com/in/oleg-tolochko",
  // scholar: "https://scholar.google.com/citations?user=...",
  bio: [
    "I'm a master's student in Informatics at TU Munich, working on 3D computer vision.",
    "Right now I'm doing research on point cloud shape completion with the Computer Vision for Digital Twins group at the University of Cambridge. Before that I worked on uncertainty quantification at the Chair of Artificial Intelligence and Machine Learning at LMU Munich.",
  ],
  photos: {
    portrait: "/assets/portrait.webp",
    casual: "/assets/ikea-portrait.webp",
  },
};

export const publications: Publication[] = [
  // {
  //   title: "...",
  //   authors: ["Oleg Tolochko", "..."],
  //   venue: "CVPR",
  //   year: 2027,
  //   links: [{ label: "Paper", href: "..." }],
  // },
];

export const publicationsNote = "Nothing published yet.";

export const projects: Project[] = [
  {
    slug: "apex",
    title: "APEX: Anchored Convex Polytopes for Explicit Shape Completion",
    context: "University of Cambridge, CV4DT × TUM Data Innovation Lab",
    period: "2026 –",
    status: "Paper in preparation",
    summary:
      "Shape completion from a partial point cloud directly to a mesh, with the completed shape represented as a union of anchored convex polytopes. Supervised by Dr. Olaf Wysocki.",
    tags: ["Shape completion", "Meshes", "Convex decomposition"],
    image: "/assets/apex-chair.bin",
    imageAlt: "A chair predicted by APEX as a union of 512 convex polytopes, one colour per convex, turning slowly.",
    links: [],
  },
  {
    slug: "long-scene-gaussian-splatting",
    title: "Long-scene Gaussian splatting with non-rigid chunk alignment",
    context: "TU Munich, Machine Learning for 3D Geometry",
    period: "2026",
    summary:
      "Reconstructs long image sequences in chunks. Each chunk is a 3D Gaussian Splatting scene initialised from DA3-Streaming, and neighbouring chunks are aligned with Sim(3) transforms and a non-rigid deformation field. Evaluated on ScanNet++.",
    tags: ["3D Gaussian Splatting", "Depth Anything 3", "ScanNet++"],
    image: "/assets/projects/gaussian-splatting.webp",
    imageAlt: "Three novel views rendered from a reconstructed university corridor.",
    links: [],
  },
  {
    slug: "genpc",
    title: "Zero-shot point cloud completion with generative priors",
    context: "TU Munich, Seminar on Agents for 3D Generative AI",
    period: "2026",
    summary:
      "Technical report on GenPC (CVPR 2025), which completes a partial scan by rendering it to a depth prompt, generating an image and lifting that image to 3D. I re-ran the pipeline with newer foundation models (Qwen-Image-Edit, GPT Image 2, TRELLIS.2, Pixal3D) on real and ShapeNet scans.",
    tags: ["Point cloud completion", "Image-to-3D"],
    image: "/assets/projects/genpc.webp",
    imageAlt: "Completed ShapeNet point clouds: airplane, bench, car, display, knife and lamp.",
    links: [],
  },
  {
    slug: "hyperdm",
    title: "Bayesian hypernetworks for epistemic and aleatoric uncertainty",
    context: "LMU Munich, Chair of AI and Machine Learning",
    period: "2026",
    summary:
      "Extends HyperDM (NeurIPS 2024), which separates epistemic and aleatoric uncertainty with a single diffusion model. Adds a Bayesian hypernetwork variant, MC-dropout baselines, a sparse-view CT experiment on LUNA16 and anomaly localisation benchmarks on ERA5.",
    tags: ["Uncertainty", "Diffusion models", "Hypernetworks"],
    image: "/assets/projects/hyperdm.webp",
    imageAlt:
      "ERA5 temperature fields with an injected anomaly, next to the epistemic and aleatoric uncertainty maps.",
    links: [{ label: "Code", href: "https://github.com/OlegTolochko/hyperdm" }],
  },
  {
    slug: "probly",
    title: "Learning from ambiguous labels in Probly",
    context: "LMU Munich, Chair of AI and Machine Learning",
    period: "2026",
    summary:
      "Experiment setup for the open-source uncertainty library Probly: deep ensembles trained on soft-label data, aleatoric/epistemic decomposition, Entmax and conformal evaluation.",
    tags: ["Uncertainty", "Deep ensembles", "Conformal prediction"],
    image: "/assets/projects/probly.webp",
    imageAlt:
      "Illustration: ten ensemble predictions scattered on a three-class probability simplex around a soft label.",
    links: [{ label: "Code", href: "https://github.com/pwhofman/probly" }],
  },
  {
    slug: "msw-da-ml",
    title: "Uncertainty quantification for mass-conserving data assimilation",
    context: "LMU Munich, Chair of AI and Machine Learning",
    period: "2025",
    summary:
      "Re-implements a CNN that corrects cheap EnKF updates towards the mass-conserving QPEns solution in a modified shallow-water model, then adds uncertainty estimates on top: conformal prediction, conformalised quantile regression, evidential regression and MC dropout.",
    tags: ["Data assimilation", "Conformal prediction"],
    image: "/assets/projects/data-assimilation.webp",
    imageAlt:
      "Water height of the shallow-water model over time, one line per time step, with rain marked in blue.",
    links: [
      { label: "Code", href: "https://github.com/OlegTolochko/msw-da-ml" },
      { label: "Write-up", href: "/projects/msw-da-ml" },
    ],
  },
  {
    slug: "trajectory-subspace-clustering",
    title: "Learned trajectory embeddings for motion segmentation",
    context: "LMU Munich, B.Sc. thesis",
    period: "2025",
    summary:
      "Re-implementation of Lochman et al. (CVPR 2024) for subspace clustering of point trajectories. The thesis shows that the usual Hopkins155 splits leak data, proposes a leakage-free protocol, and adds cross-trajectory attention, which lowers clustering error significantly.",
    tags: ["Motion segmentation", "Transformers"],
    image: "/assets/projects/trajectories.webp",
    imageAlt:
      "A Hopkins155 street scene with point trajectories coloured by motion: two cars and the background.",
    links: [
      { label: "Thesis", href: "/project_2/thesis.pdf" },
      { label: "Code", href: "https://github.com/OlegTolochko/trajectory-subspace-clustering" },
      { label: "Write-up", href: "/projects/trajectory-subspace-clustering" },
    ],
  },
];

/** Older side projects, rendered as a single compact list. */
export const otherProjects: (Link & { note: string; year: string })[] = [
  {
    label: "BrawlAI",
    note: "a Transformer that recommends draft picks for Brawl Stars",
    year: "2024",
    href: "https://brawl-ai.com",
  },
  {
    label: "Würstchen, visualised",
    note: "Manim animations of the Stable Cascade architecture",
    year: "2024",
    href: "https://github.com/OlegTolochko/wuerstchen-visualized",
  },
];

export const education: EducationEntry[] = [
  {
    institution: "Technical University of Munich",
    degree: "M.Sc. Informatics",
    period: "2025 –",
    detail: "Focus on machine learning and 3D computer vision",
  },
  {
    institution: "LMU Munich",
    degree: "B.Sc. Computer Science, minor in Statistics",
    period: "2022 – 2025",
    detail: "Thesis: Learned Trajectory Embedding for Subspace Clustering (1.0)",
  },
];

export const positions: Position[] = [
  {
    organisation: "University of Cambridge, CV4DT group",
    role: "Research intern (remote, with the TUM Data Innovation Lab)",
    period: "2026 –",
  },
  {
    organisation: "LMU Munich, Chair of AI and Machine Learning",
    role: "Student research assistant",
    period: "2025 – 2026",
  },
];

export const honours = [{ title: "Deutschlandstipendium", year: "2024" }];

/** "2026 –" becomes "2026 – present" (or another word); closed periods are unchanged. */
export function period(p: string, openWord = "present") {
  return p.endsWith("–") ? `${p} ${openWord}` : p;
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
