"""Build the static image/data assets used by the homepage designs.

Run: ~/repos/ml3d-project/.venv/bin/python scripts/assets/assets.py [step ...]
Sources outside this repository are read from ~/repos (see SRC below).
"""
import base64
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

root = Path(__file__).resolve().parents[2]
repos = root.parent
pub = root / "public/assets"
proj = pub / "projects"
gen = root / "content/generated"
TW, TH = 960, 640  # project thumbnails, 3:2


def save_webp(im, path, q=82):
    im.save(path, "WEBP", quality=q, method=6)
    print("wrote", path.relative_to(root), path.stat().st_size // 1024, "KB")


def fit(im, w, h, bg=(255, 255, 255)):
    """Letterbox im into w x h without cropping."""
    im = im.copy()
    im.thumbnail((w, h), Image.LANCZOS)
    canvas = Image.new("RGB", (w, h), bg)
    canvas.paste(im, ((w - im.width) // 2, (h - im.height) // 2), im if im.mode == "RGBA" else None)
    return canvas


def cover(im, w, h, cx=0.5, cy=0.5):
    return ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(cx, cy))


def step_photos():
    prof = Image.open(root / "public/personal_images/oleg_professional.webp").convert("RGB")
    save_webp(cover(prof, 960, 1200, 0.5, 0.45), pub / "portrait.webp")
    save_webp(cover(prof, 900, 900, 0.52, 0.42), pub / "portrait-square.webp")
    ikea = Image.open(root / "public/personal_images/oleg-ikea.webp").convert("RGB")
    save_webp(cover(ikea, 960, 1200, 0.5, 0.5), pub / "ikea-portrait.webp")


def step_ml3d():
    im = Image.open(repos / "ml3d-project/outputs/figures/tum_corridor_views_collage.png").convert("RGB")
    s = im.width / 2000
    # novel views (e)-(g); panels span y = 80..518 in the 2000px-wide preview
    panels = [(1007, 1249), (1254, 1497), (1502, 1745)]
    y0, y1 = int(82 * s), int(516 * s)
    crops = [im.crop((int(a * s) + 4, y0, int(b * s) - 4, y1)) for a, b in panels]
    gap = 10
    ph = TH
    scaled = [c.resize((int(c.width * ph / c.height), ph), Image.LANCZOS) for c in crops]
    total = sum(c.width for c in scaled) + gap * (len(scaled) - 1)
    strip = Image.new("RGB", (total, ph), "white")
    x = 0
    for c in scaled:
        strip.paste(c, (x, 0))
        x += c.width + gap
    save_webp(cover(strip, TW, TH), proj / "gaussian-splatting.webp")


def step_hyperdm():
    im = Image.open(repos / "hyperdm/figures/era5_anomaly_maps.png").convert("RGB")
    s = im.width / 2000
    cols = [(230, 418), (1211, 1399), (622, 810)]
    rows = [(50, 240), (318, 506)]
    cell = 300
    gap = 8
    out = Image.new("RGB", (cell * 3 + gap * 2, cell * 2 + gap), "white")
    for r, (ya, yb) in enumerate(rows):
        for c, (xa, xb) in enumerate(cols):
            crop = im.crop((int(xa * s) + 3, int(ya * s) + 3, int(xb * s) - 3, int(yb * s) - 3))
            out.paste(crop.resize((cell, cell), Image.LANCZOS), (c * (cell + gap), r * (cell + gap)))
    save_webp(cover(out, TW, TH), proj / "hyperdm.webp")


def step_genpc():
    im = Image.open(repos / "GenPC/presentation/assets/shapenet_final_predictions/shapenet_final_predictions_5x3.png").convert("RGB")
    s = im.width / 2000
    cw = im.width // 5
    rows = [(55, 345), (455, 740)]
    picks = [[0, 2, 4], [0, 3, 4]]
    rows_px = [(int(a * s), int(b * s)) for a, b in rows]
    rh = max(b - a for a, b in rows_px)
    out = Image.new("RGB", (cw * 3, rh * 2), "white")
    for r, (ya, yb) in enumerate(rows_px):
        for c, col in enumerate(picks[r]):
            out.paste(im.crop((col * cw, ya, (col + 1) * cw, yb)), (c * cw, r * rh))
    save_webp(fit(out, TW, TH), proj / "genpc.webp")


def step_thesis(seq="cars5", frame_idx=18, tail=10):
    import cv2
    import scipy.io as sio

    base = repos / f"trajectory-subspace-clustering/data/Hopkins155/{seq}"
    m = sio.loadmat(base / f"{seq}_truth.mat")
    y = m["y"]  # 3 x P x F, pixel coordinates
    lab = m["s"].ravel()
    cap = cv2.VideoCapture(str(base / f"{seq}.avi"))
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ok, bgr = cap.read()
    assert ok, "could not read frame"
    frame = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    sc = 2
    frame = ImageOps.grayscale(frame).convert("RGB").resize((frame.width * sc, frame.height * sc), Image.LANCZOS)
    frame = Image.blend(frame, Image.new("RGB", frame.size, (255, 255, 255)), 0.3)
    draw = ImageDraw.Draw(frame, "RGBA")
    palette = {1: (40, 108, 196), 2: (226, 74, 51), 3: (240, 168, 20)}
    f0 = max(0, frame_idx - tail)
    for p in np.argsort(lab)[::-1]:
        pts = [(float(y[0, p, f]) * sc, float(y[1, p, f]) * sc) for f in range(f0, frame_idx + 1)]
        col = palette.get(int(lab[p]), (0, 0, 0))
        draw.line(pts, fill=col + (200,), width=3, joint="curve")
        x, yy = pts[-1]
        draw.ellipse([x - 4, yy - 4, x + 4, yy + 4], fill=col + (255,), outline=(255, 255, 255, 255), width=1)
    print(seq, "motions", np.unique(lab), "points", y.shape[1], "frames", y.shape[2])
    save_webp(cover(frame, TW, TH), proj / "trajectories.webp")


def step_msw():
    sys.path.insert(0, str(repos / "msw-da-ml"))
    import os

    os.chdir(repos / "msw-da-ml")
    from msw_da_ml.core.msw_model import EnsembleModel

    rng = np.random.default_rng(3)
    model = EnsembleModel(1, rng)
    model.initialize()
    hist = []
    for _ in range(420):
        model.propagate()
        hist.append(model.get_state()[:, :, 0].copy())
    hist = np.array(hist)  # T x 3 x ngrid
    rain = hist[:, 2, :]
    height = hist[:, 1, :]
    print("msw", hist.shape, rain.min(), rain.max(), height.min(), height.max())
    np.save("/tmp/msw_hist.npy", hist)
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    # ridgeline: water height h(x) at successive times, rain marked where it falls
    steps = list(range(150, 420, 8))[:32]
    fig = plt.figure(figsize=(TW / 100, TH / 100), dpi=100)
    ax = fig.add_axes([0.03, 0.03, 0.94, 0.94])
    x = np.arange(height.shape[1])
    base = np.median(height)
    scale = 2.4 / np.percentile(np.abs(height - base), 99.5)
    n = len(steps)
    for i, t in enumerate(steps[::-1]):
        off = n - 1 - i
        yv = (height[t] - base) * scale + off
        ax.fill_between(x, off - 3, yv, color="white", zorder=2 * i)
        ax.plot(x, yv, color="#151515", lw=1.25, zorder=2 * i + 1)
        wet = rain[t] > 0.004
        ax.scatter(x[wet], yv[wet] + 0.6, s=6, color="#1f4fa8", zorder=2 * i + 1, lw=0)
    ax.set_xlim(0, x[-1])
    ax.set_ylim(-1.2, n + 2.2)
    ax.set_axis_off()
    fig.savefig("/tmp/msw.png", dpi=100, facecolor="white")
    save_webp(Image.open("/tmp/msw.png").convert("RGB"), proj / "data-assimilation.webp")


def step_probly():
    """Illustration: ensemble members' predictions on the 3-class simplex vs a soft label."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    rng = np.random.default_rng(11)
    corners = np.array([[0, 0], [1, 0], [0.5, np.sqrt(3) / 2]])

    def to_xy(p):
        return p @ corners

    fig = plt.figure(figsize=(TW / 100, TH / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(-0.36, 1.36)
    ax.set_ylim(-0.07, 0.94)
    ax.set_aspect("equal")
    ax.set_axis_off()
    # faint barycentric grid
    for t in np.linspace(0.1, 0.9, 9):
        for a, b, c in [(0, 1, 2), (1, 2, 0), (2, 0, 1)]:
            p1 = np.zeros(3); p1[a] = t; p1[b] = 1 - t
            p2 = np.zeros(3); p2[a] = t; p2[c] = 1 - t
            xy = to_xy(np.array([p1, p2]))
            ax.plot(xy[:, 0], xy[:, 1], color="#000", lw=0.5, alpha=0.12)
    tri = np.vstack([corners, corners[:1]])
    ax.plot(tri[:, 0], tri[:, 1], color="#111", lw=1.4)
    # soft label (annotator disagreement) as a Dirichlet cloud
    soft = np.array([0.45, 0.33, 0.22])
    lab = rng.dirichlet(soft * 40, 5000)
    xy = to_xy(lab)
    ax.scatter(xy[:, 0], xy[:, 1], s=3, color="#111", alpha=0.16, lw=0)
    # ensemble members
    members = rng.dirichlet(soft * 18, 10)
    mxy = to_xy(members)
    ax.scatter(mxy[:, 0], mxy[:, 1], s=70, facecolor="white", edgecolor="#111", lw=1.5, zorder=3)
    mean = to_xy(members.mean(0))
    ax.scatter([mean[0]], [mean[1]], s=90, marker="+", color="#111", lw=1.8, zorder=4)
    for i, name in enumerate(["A", "B", "C"]):
        off = [(-0.06, -0.06), (0.06, -0.06), (0, 0.05)][i]
        ax.text(corners[i, 0] + off[0], corners[i, 1] + off[1], name, ha="center", va="center",
                fontsize=17, family="DejaVu Sans Mono", color="#111")
    fig.savefig("/tmp/probly.png", dpi=100, facecolor="white")
    save_webp(Image.open("/tmp/probly.png").convert("RGB"), proj / "probly.webp")


APEX_RUN = "shapenet55_ae_kl32_c512_knn32_in8192_seed7401"  # best ShapeNet55 complete-input model (CD-L1, F1, IoU)
APEX_RESULTS = repos / "GF4Shape/local/polytope/results" / APEX_RUN / "step_240000/assets"


def read_pmsh(path):
    """Mesh written by GF4Shape local/polytope/common.py:write_mesh (triangle soup + convex id per face)."""
    import struct

    b = path.read_bytes()
    assert b[:4] == b"PMSH"
    nv, nf, flags = struct.unpack("<III", b[4:16])
    o = 16
    v = np.frombuffer(b, "<f4", nv * 3, o).reshape(-1, 3)
    o += nv * 12
    small = flags & 2
    size = 2 if small else 4
    f = np.frombuffer(b, "<u2" if small else "<u4", nf * 3, o).reshape(-1, 3).astype(np.int64)
    o += nf * 3 * size
    o += -(nf * 3 * size) % 4
    g = np.frombuffer(b, "<u2", nf, o).astype(np.int64)
    return v, f, g


def step_apex(slug="03001627__28844eb55fc82dc8f4b6538438a0b930", out_name="apex-chair.bin"):
    """Predicted convex polytopes of one ShapeNet55 chair -> compact binary for the WebGL viewer.

    Layout (little endian): "CVX1", u16 convexes, u16 pad, u32 vertices, u32 triangles,
    i16 xyz[vertices] (unit radius * 32767), u16 convex[vertices], u16 indices[3 * triangles],
    u8 colour[convexes] (index into the paper's 10-tone palette, see components/convex-mesh.tsx).
    """
    import struct
    from scipy.spatial import cKDTree

    v, f, g = read_pmsh(APEX_RESULTS / slug / "parts.bin")
    tri = v[f]  # T x 3 x 3
    centre = (v.max(0) + v.min(0)) / 2
    radius = np.linalg.norm(v - centre, axis=1).max()
    positions, owners, indices = [], [], []
    count = 0
    for cid in np.unique(g):
        t = tri[g == cid].reshape(-1, 3)
        q = np.round((t - centre) / radius * 32767).astype(np.int64)
        uniq, inv = np.unique(q, axis=0, return_inverse=True)
        tris = inv.reshape(-1, 3)
        tris = tris[(tris[:, 0] != tris[:, 1]) & (tris[:, 1] != tris[:, 2]) & (tris[:, 0] != tris[:, 2])]
        if len(tris) == 0:
            continue
        positions.append(uniq)
        owners.append(np.full(len(uniq), len(positions) - 1))
        indices.append(tris + count)
        count += len(uniq)
    pos = np.concatenate(positions).astype("<i2")
    own = np.concatenate(owners).astype("<u2")
    idx = np.concatenate(indices).astype("<u2")
    assert count < 65536
    # colours as in GF4Shape local/arch_figure/assets.py: greedy colouring of the centres' 10-NN graph
    centres = np.array([p.mean(0) for p in positions], np.float64)
    _, neighbours = cKDTree(centres).query(centres, 11)
    order = np.argsort(-np.linalg.norm(centres - centres.mean(0), axis=1))
    colour = -np.ones(len(centres), int)
    for i in order:
        used = {colour[j] for j in neighbours[i][1:] if colour[j] >= 0}
        options = [c for c in range(10) if c not in used] or list(range(10))
        colour[i] = min(options, key=lambda c: (np.sum(colour == c), c))
    out = pub / out_name
    with open(out, "wb") as fh:
        fh.write(b"CVX1" + struct.pack("<HHII", len(positions), 0, len(pos), len(idx)))
        fh.write(pos.tobytes() + own.tobytes() + idx.tobytes() + colour.astype(np.uint8).tobytes())
    print(slug, len(positions), "convexes,", len(pos), "vertices,", len(idx), "triangles,", out.stat().st_size // 1024, "KB")


steps = {k[5:]: v for k, v in globals().items() if k.startswith("step_")}
for name in sys.argv[1:] or steps:
    if ":" in name:  # e.g. apex:<slug>:<file> to try another shape
        name, *args = name.split(":")
        steps[name](*args)
    else:
        steps[name]()
