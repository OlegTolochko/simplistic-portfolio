#!/usr/bin/env node

/**
 * Normalises the `#kg::` / `#ctx::` tags on the knowledge decks and tags any
 * note that does not carry one yet.
 *
 *   node scripts/retag-anki.mjs --dry        # report only, change nothing
 *   node scripts/retag-anki.mjs              # apply (writes a backup first)
 *   node scripts/retag-anki.mjs --restore scripts/backups/anki-tags-<ts>.json
 *
 * Two mechanisms:
 *
 *  1. ALIASES rewrites historical / inconsistent tag ids onto the canonical
 *     concept ids used by app/data/knowledge_structure.json ("bn" →
 *     "batch-normalization", "CKY" → "cky-algorithm", …).
 *  2. RULES tags untagged notes by matching their text. Rules are ordered;
 *     every rule that matches contributes its concepts, capped at MAX_TAGS.
 *
 * Both are additive and idempotent: notes that already carry a canonical tag
 * are only ever normalised, never re-classified. Re-run it whenever you have
 * added cards — new notes get picked up, existing ones stay put.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const STRUCTURE_PATH = path.join(ROOT, "app", "data", "knowledge_structure.json");
const BACKUP_DIR = path.join(ROOT, "scripts", "backups");
const ANKI_URL = process.env.ANKI_CONNECT_URL ?? "http://127.0.0.1:8765";

/** Decks that feed the knowledge graph. Everything else is ignored. */
export const DECK_QUERY =
  '(deck:"Knowledge" OR deck:"Master::SS26::ml3d" OR deck:"Master::WS2526::I2DL")';

const DRY_RUN = process.argv.includes("--dry");
const VERBOSE = process.argv.includes("--verbose");
const RESTORE_INDEX = process.argv.indexOf("--restore");
const MAX_TAGS = 3;

/* ------------------------------------------------------------------ aliases */

/** legacy tag id → canonical concept id */
const ALIASES = {
  // malformed prefixes
  deep: "deep-learning",

  // math
  math: "mathematics",
  hermitian: "hermitian-matrix",
  "matrix-range": "matrix-span",
  svd: "singular-value-decomposition",
  "cauchy-schwarz": "cauchy-schwarz-inequality",
  gd: "gradient-descent",
  sgd: "stochastic-gradient-descent",
  gn: "gauss-newton",
  dp: "dynamic-programming",

  // statistics / classical ML
  mle: "maximum-likelihood-estimation",
  hmm: "hidden-markov-models",
  "markov-model": "markov-models",
  crfs: "conditional-random-fields",
  viterbi: "viterbi-algorithm",
  svms: "support-vector-machines",
  pca: "principal-component-analysis",
  ncut: "normalized-cut",
  "pointwise-mi": "pointwise-mutual-information",

  // deep learning
  bn: "batch-normalization",
  cnn: "cnns",

  // nlp
  "n-gram-lms": "n-gram-language-models",
  llms: "large-language-models",
  bpe: "byte-pair-encoding",
  cfg: "context-free-grammar",
  cnf: "chomsky-normal-form",
  CKY: "cky-algorithm",
  cky: "cky-algorithm",
  ie: "information-extraction",
  "e2e-coref": "e2e-coreference",
  sft: "supervised-fine-tuning",
  rag: "retrieval-augmented-generation",
  "cos-similarity": "cosine-similarity",
  "evaluation-metrics": "nlp-evaluation",

  // computer vision
  vos: "video-object-segmentation",
  nms: "non-maximum-suppression",
  roipooling: "roi-pooling",
  roialign: "roi-align",
  ap: "average-precision",
  map: "mean-average-precision",
  iou: "intersection-over-union",
  giou: "generalized-iou",
  "prec-recall": "precision-recall",
  hog: "histogram-of-oriented-gradients",
  fpn: "feature-pyramid-network",
  yolov1: "yolo",
  sam: "segment-anything",
  "image-segmentation": "segmentation",

  // 3d
  vertices: "vertices-and-faces",
  sdf: "signed-distance-fields",
  "3dgs": "gaussian-splatting",
  pixelsplat: "pixelsplat", // guards against the "pixelSplat" casing
  plenovoxels: "plenoxels",
  procgen3d: "procedural-generation",
  da3: "depth-anything-3",
  sds: "score-distillation",
  nerfs: "nerf",
};

/**
 * Image-only notes: nothing to match on, so they are pinned by note id.
 * (Anki note ids are stable creation timestamps.)
 */
const OVERRIDES = {
  1760895271267: ["regex"], // regex quantifier table
  1760896807574: ["regex"], // regex character-class table
  1767545093307: ["matrix-calculus", "vector-norms"], // ∇ ½‖x‖²
  1767545167261: ["matrix-calculus", "vector-norms"], // ∇ ½‖x‖
  1769714871451: ["tanh", "vanishing-gradients"], // tanh saturation plot
};

/* -------------------------------------------------------------------- rules */

/** [pattern, concepts] — applied to "front \n back" of untagged notes. */
const RULES = [
  // ---------------------------------------------------------------- math
  [/nabla_x\s*\(x\^\\top A x\)|partial \\beta\} \(\\beta\^T A|nabla_x b\^Tx|quadratic form|x_i x_j M_\{ij\}/i, ["matrix-calculus"]],
  [/\\frac\{1\}\{2\}\\\|\\boldsymbol\{x\}\\\|_2|\|\\boldsymbol\{x\}\\\|/i, ["matrix-calculus", "vector-norms"]],
  [/langle u, v \\rangle|inner product/i, ["inner-product"]],
  [/squared vs normal.*norm|l_2. norm/i, ["vector-norms"]],
  [/gradient definition/i, ["gradient"]],
  [/jacobian/i, ["jacobian"]],
  [/divergence of functions/i, ["divergence"]],
  [/derivative of cos\/sin|cos\/sin wave|cos\(0\)/i, ["derivatives"]],
  [/jensen inequality/i, ["jensen-inequality"]],
  [/bregman/i, ["bregman-divergence"]],
  [/convex problems benefit/i, ["convexity"]],
  [/linear least squares|least squares/i, ["least-squares"]],
  [/newton update step/i, ["newton-method"]],
  [/second order (vs|optimization)|second-order/i, ["second-order-optimization"]],
  [/gauss-newton/i, ["gauss-newton"]],
  [/bipartite matching/i, ["bipartite-matching"]],

  // ---------------------------------------------------- probability / stats
  [/expected value pdf|expected value/i, ["expected-value"]],
  [/\\int_\{-\\infty\}\^\{\\infty\} p\(x,z\)|marginali[sz]/i, ["marginalization"]],
  [/\bmle\b|maximum likelihood/i, ["maximum-likelihood-estimation"]],
  [/logistic regression/i, ["logistic-regression"]],
  [/linear predictor/i, ["linear-predictor"]],
  [/regression task and classification task/i, ["supervised-learning"]],
  [/purpose of validation set|validation set/i, ["validation-set"]],
  [/mitigate overfitting|overfitting issues/i, ["overfitting", "regularization"]],

  // --------------------------------------------------------- deep learning
  [/dying relu|dead relu/i, ["dying-relu"]],
  [/parametric relu|leakyrelu|leaky relu/i, ["leaky-relu"]],
  [/maxout/i, ["maxout"]],
  [/tanh (derivative|saturat)|derivative of tanh/i, ["tanh"]],
  [/sigmoid property|term logit root/i, ["sigmoid"]],
  [/softmax derivative/i, ["softmax", "backpropagation"]],
  [/why can relu|benefit of relu|drawbacks of relu/i, ["relu"]],
  [/not using non-linearity|non-linearity in neural/i, ["activation-functions"]],
  [/bias replacement trick/i, ["neural-network-basics"]],
  [/cross entropy loss w\. softmax|multiclass ce gradient|multiclass cross entropy/i, ["cross-entropy-loss"]],
  [/binary cross entro|bce gradient/i, ["binary-cross-entropy"]],
  [/hinge loss|hinge vs cross-entropy/i, ["hinge-loss"]],
  [/mse loss|derivative of mse/i, ["mse-loss"]],
  [/structure for error losses/i, ["loss-functions"]],
  [/backpropagation|summation of gradients|frac\{\\partial L\}\{\\partial X\}|derivative w\.r\.t\. .w21/i, ["backpropagation"]],
  [/vanishing gradient/i, ["vanishing-gradients"]],
  [/gradient clipping/i, ["gradient-clipping"]],
  [/rmsprop/i, ["rmsprop"]],
  [/adagrad/i, ["adagrad"]],
  [/\badam\b|second moment .v_t|\\beta_1|\\beta_2/i, ["adam"]],
  [/learning rate (scheduler|decay)|lr decay|learning rate be the same/i, ["learning-rate-schedules"]],
  [/learning rate warmup/i, ["learning-rate-warmup", "transformers"]],
  [/sgd over gd|advantages of sgd/i, ["stochastic-gradient-descent"]],
  [/weight decay|l2 regulari[sz]ation/i, ["weight-decay"]],
  [/dropout/i, ["dropout"]],
  [/data augmentation/i, ["data-augmentation"]],
  [/purpose of regulari[sz]ation/i, ["regularization"]],
  [/batchnorm|batch norm|full ?bn|\bbn\b/i, ["batch-normalization"]],
  [/instancenorm/i, ["instance-normalization"]],
  [/pre-ln|post-ln|layernorm|layer norm/i, ["layer-normalization"]],
  [/normalization before activation|normalization of images/i, ["normalization-layers"]],
  [/xavier/i, ["xavier-initialization"]],
  [/he weight initiali/i, ["he-initialization"]],
  [/weight initiali|initialization of weights/i, ["weight-initialization"]],
  [/batch[- ]?size/i, ["batch-size"]],
  [/unequally distributed training sets|loss divergence/i, ["network-training"]],
  [/domain gap/i, ["domain-gap"]],
  [/receptive field/i, ["receptive-field"]],
  [/conv layer output dimension|convolutional kernel|maxpool output size/i, ["convolution-arithmetic"]],
  [/maxpool|max ?pool/i, ["pooling"]],
  [/invariance|equivariance/i, ["translation-invariance"]],
  [/dilation in convolutional|dilated conv/i, ["dilated-convolutions"]],
  [/strided convolution.*backward|backward operation of a strided/i, ["transposed-convolution"]],
  [/upsampling: interpolation|resize convolution/i, ["upsampling"]],
  [/information loss during upsampling|skip connection/i, ["skip-connections"]],
  [/u-net/i, ["u-net"]],
  [/residual (highway|block|network)|resnet|unraveled view/i, ["residual-networks"]],
  [/inception layer/i, ["inception"]],
  [/vggnet/i, ["vggnet"]],
  [/convolutions more efficient|feature mlp vs cnn/i, ["cnns"]],
  [/eigenvalues .\\lambda_i|orthogonal \(\\theta\^T|eigendecomposition/i, ["rnns", "eigendecomposition"]],
  [/difficulties rnns|\brnn\b/i, ["rnns"]],
  [/positional (information|encoding)/i, ["positional-encoding"]],
  [/fc, cnn, rnn and attention/i, ["architectures"]],
  [/autoencoder|latent space in ae/i, ["autoencoders"]],
  [/benefits of vae|\bvae\b/i, ["variational-autoencoders"]],
  [/diffusion model|latent diffusion|pixel-space diffusion|denoising diffusion/i, ["diffusion-models"]],
  [/graphs? (problem with|dont have strict)/i, ["graph-neural-networks"]],

  // ------------------------------------------------------------------- nlp
  [/orthographic word|morpheme|clitic/i, ["morphology"]],
  [/lemma|citation form/i, ["lemmatization"]],
  [/stemming/i, ["stemming"]],
  [/utf-8|ascii|string encoding|unicode/i, ["character-encoding"]],
  [/byte pair encoding|\bbpe\b|llm lookup table/i, ["byte-pair-encoding"]],
  [/sentence segmentation/i, ["sentence-segmentation"]],
  [/code switching/i, ["text-processing"]],
  [/corpus datasheet|corpora/i, ["corpora"]],
  [/regex|kleene|capture group|character disjunction|\\d\{2\}|re\.(search|sub)/i, ["regex"]],
  [/minimum edit distance/i, ["minimum-edit-distance"]],
  [/n-gram|bigram|add k-smoothing|black swan|out of vocabulary|\boov\b/i, ["n-gram-language-models"]],
  [/smoothing/i, ["smoothing"]],
  [/perplexity/i, ["perplexity"]],
  [/affective meaning|sentiment analysis/i, ["sentiment-analysis"]],
  [/cosine similarity|similarity measurement/i, ["cosine-similarity"]],
  [/word2vec|context window/i, ["word2vec"]],
  [/anisotropy|same direction/i, ["word-representations"]],
  [/prompting|few-shot prompt|zero-shot prompt/i, ["prompting"]],
  [/in-context learning/i, ["in-context-learning"]],
  [/greedy decoding/i, ["greedy-decoding"]],
  [/top-k sampling|sampling llm/i, ["sampling-strategies"]],
  [/teacher forcing/i, ["teacher-forcing"]],
  [/sc+aling laws/i, ["scaling-laws"]],
  [/bradley-terry|winner, loser/i, ["dpo"]],
  [/rl llm|reinforcement learning.*llm/i, ["rlhf"]],
  [/\bbert\b|\bnsp\b|80\/10\/10/i, ["bert"]],
  [/word sense/i, ["word-sense-disambiguation"]],
  [/named entity/i, ["named-entity-recognition"]],
  [/framenet|semantic role/i, ["semantic-role-labeling"]],
  [/winograd|coreference/i, ["coreference-resolution"]],

  // -------------------------------------------------------- computer vision
  [/template matching/i, ["template-matching"]],
  [/sliding window/i, ["sliding-window"]],
  [/ncut|normalized cut/i, ["normalized-cut"]],
  [/panoptic segmentation/i, ["panoptic-segmentation"]],
  [/instance segmentation/i, ["instance-segmentation"]],
  [/video object segmentation|\bvos\b|one-shot.*unsupervised/i, ["video-object-segmentation"]],
  [/onavos|osvos/i, ["osvos"]],
  [/segflow/i, ["segflow"]],
  [/flownet/i, ["flownet"]],
  [/aperture problem/i, ["aperture-problem"]],
  [/optical flow/i, ["optical-flow"]],

  // -------------------------------------------------------------- 3d vision
  [/per-scene fitting|amortized prediction|amortized/i, ["per-scene-optimization"]],
  [/sfm-side|structure from motion/i, ["structure-from-motion"]],
  [/radiance-side|radiance field/i, ["radiance-fields"]],
  [/rgb-d/i, ["rgbd-segmentation"]],
  [/open[- ]vocabulary|closed vocabulary/i, ["open-vocabulary-3d"]],
  [/atiss|diffuscene|scene composition|scene generation/i, ["scene-generation"]],
  [/procedural|infinigen|scenesmith/i, ["procedural-generation"]],
  [/nerf|neural radiance/i, ["nerf"]],
  [/gaussian splatting|\b3dgs\b/i, ["gaussian-splatting"]],
  [/score distillation|\bsds\b/i, ["score-distillation"]],
  [/flow matching/i, ["flow-matching"]],
  [/voxel/i, ["voxels"]],
  [/point cloud/i, ["point-clouds"]],
  [/\bmesh\b|meshes/i, ["meshes"]],
];

/* ------------------------------------------------------------------ helpers */

const callAnki = async (action, params = {}) => {
  const res = await fetch(ANKI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, version: 6, params }),
  });
  const body = await res.json();
  if (body.error) throw new Error(`AnkiConnect ${action}: ${body.error}`);
  return body.result;
};

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

/** `#kg::foo` / `kg1::foo` / `ctx::foo` → { kind, id } */
const parseTag = (raw) => {
  const tag = raw.replace(/^#/, "");
  const match = tag.match(/^(kg|kg1|kg2|ctx)::(.+)$/i);
  if (!match) return null;
  const kind = match[1].toLowerCase().startsWith("kg") ? "kg" : "ctx";
  return { kind, id: match[2].trim() };
};

const canonical = (id) => ALIASES[id] ?? ALIASES[id.toLowerCase()] ?? id;

const loadConcepts = async () => {
  const raw = JSON.parse(await readFile(STRUCTURE_PATH, "utf8"));
  return new Set((raw.concepts ?? []).map((c) => c.id));
};

/* --------------------------------------------------------------------- main */

const restore = async (file) => {
  const backup = JSON.parse(await readFile(file, "utf8"));
  for (const entry of backup.notes) {
    await callAnki("updateNoteTags", { note: entry.noteId, tags: entry.tags });
  }
  console.log(`Restored tags on ${backup.notes.length} notes from ${file}`);
};

const main = async () => {
  if (RESTORE_INDEX !== -1) {
    const file = process.argv[RESTORE_INDEX + 1];
    if (!file) throw new Error("--restore needs a backup file path");
    return restore(file);
  }

  const known = await loadConcepts();
  const noteIds = await callAnki("findNotes", { query: DECK_QUERY });
  const notes = await callAnki("notesInfo", { notes: noteIds });
  console.log(`${notes.length} notes in scope\n`);

  const unknownTags = new Map();
  const newlyTagged = [];
  const unmatched = [];
  const planned = [];
  let normalised = 0;
  let tagged = 0;

  for (const note of notes) {
    const keep = [];
    const concepts = new Map(); // id → kind
    for (const raw of note.tags) {
      const parsed = parseTag(raw);
      if (!parsed) {
        // Drop the bare parent tags Anki materialises ("#kg", "#ctx", "#").
        if (!/^#?(kg|ctx)?$/i.test(raw)) keep.push(raw);
        continue;
      }
      const id = canonical(parsed.id);
      if (!known.has(id)) {
        unknownTags.set(id, (unknownTags.get(id) ?? 0) + 1);
        continue;
      }
      // A concept tagged both ways stays a kg tag.
      if (parsed.kind === "kg" || !concepts.has(id)) concepts.set(id, parsed.kind);
    }

    if (concepts.size === 0) {
      const text = Object.values(note.fields)
        .map((f) => stripHtml(f.value))
        .join("\n");
      for (const id of OVERRIDES[note.noteId] ?? []) {
        if (known.has(id)) concepts.set(id, "kg");
      }
      for (const [pattern, ids] of RULES) {
        if (concepts.size >= MAX_TAGS) break;
        if (!pattern.test(text)) continue;
        for (const id of ids) {
          if (concepts.size >= MAX_TAGS) break;
          if (known.has(id)) concepts.set(id, "kg");
        }
      }
      if (concepts.size === 0) {
        unmatched.push({ id: note.noteId, text: text.slice(0, 90) });
        continue;
      }
      tagged += 1;
      if (VERBOSE)
        newlyTagged.push({
          concepts: [...concepts.keys()].join(", "),
          text: text.slice(0, 80),
        });
    }

    const next = [
      ...keep,
      ...[...concepts.entries()].map(([id, kind]) => `#${kind}::${id}`),
    ].sort();
    // Anki's tag registry is case-insensitive and rewrites a tag to whichever
    // casing was registered first, so a casing-only difference would flip back
    // and forth forever. The graph lowercases tag ids anyway, so ignore case
    // when deciding whether a write is actually needed.
    const fold = (tags) => tags.map((t) => t.toLowerCase()).sort();
    const before = [...note.tags].sort();
    if (JSON.stringify(fold(next)) !== JSON.stringify(fold(before))) {
      planned.push({ noteId: note.noteId, tags: next, before: note.tags });
      normalised += 1;
    }
  }

  console.log(`newly tagged      : ${tagged}`);
  console.log(`notes to rewrite  : ${normalised}`);
  console.log(`unmatched notes   : ${unmatched.length}`);
  if (unknownTags.size) {
    console.log(`\nTags with no concept in knowledge_structure.json:`);
    for (const [id, count] of [...unknownTags].sort((a, b) => b[1] - a[1]))
      console.log(`  ${String(count).padStart(4)}  ${id}`);
  }
  if (VERBOSE && newlyTagged.length) {
    console.log(`\nNewly tagged notes:`);
    for (const item of newlyTagged)
      console.log(`  [${item.concepts}]  ${item.text}`);
  }
  if (unmatched.length) {
    console.log(`\nNotes no rule matched:`);
    for (const item of unmatched) console.log(`  ${item.id}  ${item.text}`);
  }

  if (DRY_RUN) {
    console.log("\nDry run — nothing written.");
    return;
  }
  if (!planned.length) {
    console.log("\nNothing to change.");
    return;
  }

  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `anki-tags-${stamp}.json`);
  await writeFile(
    backupPath,
    JSON.stringify(
      { createdAt: new Date().toISOString(), query: DECK_QUERY, notes: notes.map((n) => ({ noteId: n.noteId, tags: n.tags })) },
      null,
      2
    ),
    "utf8"
  );
  console.log(`\nBackup written to ${path.relative(ROOT, backupPath)}`);

  for (const entry of planned) {
    await callAnki("updateNoteTags", { note: entry.noteId, tags: entry.tags });
  }
  console.log(`Updated ${planned.length} notes.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
